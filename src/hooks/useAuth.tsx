import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
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
  loginWithOtp: (values: { phone: string; code: string }) => Promise<void>
  requestPhoneOtp: (phone: string) => Promise<{ message: string; devOtp?: string }>
  register: (values: SignUpValues) => Promise<{ message: string; devOtp?: string }>
  verifyRegistration: (values: { email: string; code: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_TOKEN_KEY = "hoi_auth_token"
const STORAGE_USER_KEY = "hoi_auth_user"
const AUTH_SESSION_EXPIRED_EVENT = "hoi-auth-session-expired"

function isJwtExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""))
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const clearLocalSession = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearLocalSession)
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    if (storedToken) {
      if (isJwtExpired(storedToken)) {
        apiClient.clearAuthSession()
        setLoading(false)
      } else {
        setLoading(true)
        setToken(storedToken)
        apiClient
          .getProfile()
          .then((response) => {
            setUser(response.data.user)
            apiClient.setAuthSession(storedToken, response.data.user)
          })
          .catch(() => {
            apiClient.clearAuthSession()
            setToken(null)
            setUser(null)
          })
          .finally(() => setLoading(false))
      }
    } else {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY)
      if (storedUser) {
        setUser(null)
      }
    }

    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, clearLocalSession)
  }, [])

  const login = async (values: LoginValues) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.login(values)
      setToken(response.data.token)
      setUser(response.data.user)
      apiClient.setAuthSession(response.data.token, response.data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const requestPhoneOtp = async (phone: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.requestPhoneOtp(phone)
      return { message: response.message || "OTP sent", devOtp: response.data?.devOtp }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP request failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithOtp = async (values: { phone: string; code: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.verifyPhoneOtp(values)
      setToken(response.data.token)
      setUser(response.data.user)
      apiClient.setAuthSession(response.data.token, response.data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (values: SignUpValues) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.register(values)
      if (response.data?.token && response.data?.user) {
        setToken(response.data.token)
        setUser(response.data.user)
        apiClient.setAuthSession(response.data.token, response.data.user)
      }
      return {
        message: response.message || "Verification code sent",
        devOtp: response.data?.devOtp,
        autoVerified: Boolean(response.data?.autoVerified || response.data?.token),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyRegistration = async (values: { email: string; code: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.verifyRegistration(values)
      setToken(response.data.token)
      setUser(response.data.user)
      apiClient.setAuthSession(response.data.token, response.data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiClient.logout().catch(() => undefined)
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
      loginWithOtp,
      requestPhoneOtp,
      register,
      verifyRegistration,
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
