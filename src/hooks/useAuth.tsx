import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createUserWithEmailAndPassword, onIdTokenChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { apiClient } from "@/lib/api-client"
import { firebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase"
import type { LoginValues, SignUpValues } from "@/lib/validators"

export type AuthUser = {
  id: string
  name: string
  company?: string
  email: string
  phone?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (values: LoginValues) => Promise<void>
  register: (values: SignUpValues) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_TOKEN_KEY = "hoi_auth_token"
const STORAGE_USER_KEY = "hoi_auth_user"
const AUTH_SESSION_EXPIRED_EVENT = "hoi-auth-session-expired"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false)
      setUser(null)
      setToken(null)
      return
    }

    const clearLocalSession = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearLocalSession)
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        apiClient.clearAuthSession()
        clearLocalSession()
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const idToken = await firebaseUser.getIdToken()
        const response = await apiClient.getProfile()
        setToken(idToken)
        setUser(response.data.user)
        apiClient.setAuthSession(idToken, response.data.user)
      } catch {
        apiClient.clearAuthSession()
        clearLocalSession()
        await signOut(firebaseAuth).catch(() => undefined)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, clearLocalSession)
      unsubscribe()
    }
  }, [])

  const login = async (values: LoginValues) => {
    if (!firebaseAuth || !isFirebaseClientConfigured) {
      const error = new Error("Firebase client config is missing. Add VITE_FIREBASE_* values in .env to use login.");
      setError(error.message)
      throw error
    }
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (values: SignUpValues) => {
    if (!firebaseAuth || !isFirebaseClientConfigured) {
      const error = new Error("Firebase client config is missing. Add VITE_FIREBASE_* values in .env to use signup.");
      setError(error.message)
      throw error
    }
    setLoading(true)
    setError(null)
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password)
      await updateProfile(credential.user, { displayName: values.name })
      const idToken = await credential.user.getIdToken()
      const response = await apiClient.register({
        idToken,
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company || "",
      })
      if (response?.data?.user) {
        setUser(response.data.user)
        setToken(idToken)
        apiClient.setAuthSession(idToken, response.data.user)
      }
    } catch (err) {
      await firebaseAuth.currentUser?.delete().catch(() => undefined)
      await signOut(firebaseAuth).catch(() => undefined)
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(firebaseAuth).catch(() => undefined)
    setUser(null)
    setToken(null)
    apiClient.clearAuthSession()
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
    }),
    [user, token, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
