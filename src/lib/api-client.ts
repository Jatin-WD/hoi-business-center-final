import { adminApiMethods } from "./admin-api-methods";
import { getFirebaseIdToken } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api");
const AUTH_TOKEN_KEY = "hoi_auth_token";
const AUTH_USER_KEY = "hoi_auth_user";
const AUTH_SESSION_EXPIRED_EVENT = "hoi-auth-session-expired";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

class ApiClient {
  baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    };
    const config: RequestInit = {
      ...options,
      headers,
    };

    const token = await this.getAuthToken();
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : { message: friendlyTextError(await response.text(), response.status) };

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthSession();
        }
        throw new Error(data.message || `API request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getAuthToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || (await getFirebaseIdToken());
  }

  setAuthSession(token: string, user: unknown) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  clearAuthSession() {
    const hadToken = Boolean(sessionStorage.getItem(AUTH_TOKEN_KEY));
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    if (hadToken) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
  }

  async login(credentials: unknown) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: unknown) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getVenues() {
    return this.request("/venues");
  }

  async getVenue(locationId: string, subVenueId: string) {
    return this.request(`/venues/${locationId}/${subVenueId}`);
  }

  async getVenuesByLocation(locationId: string) {
    return this.request(`/venues/${locationId}`);
  }

  async getPackages() {
    return this.request("/packages");
  }

  async getPackagesByCategory(category: string) {
    return this.request(`/packages/category/${category}`);
  }

  async getPackage(category: string, subcategory: string) {
    return this.request(`/packages/${category}/${subcategory}`);
  }

  async getServices() {
    return this.request("/services");
  }

  async getService(serviceId: string) {
    return this.request(`/services/${serviceId}`);
  }

  async getEvents() {
    return this.request("/events");
  }

  async submitInquiry(inquiryData: unknown) {
    return this.request("/inquiries", {
      method: "POST",
      body: JSON.stringify(inquiryData),
    });
  }

  async submitManpowerRequest(formData: FormData) {
    return this.request("/manpower", {
      method: "POST",
      body: formData,
    });
  }

  async createBooking(bookingData: unknown) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return this.request("/bookings");
  }

  async adminLogin(credentials: unknown) {
    return this.request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

}

function friendlyTextError(text: string, status: number) {
  if (status === 503 || text.includes("503 Service Unavailable")) {
    return "Server is temporarily unavailable. Please check the backend deployment and environment variables.";
  }
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    return `Server returned an HTML error page (${status}).`;
  }
  return text || `API request failed with status ${status}`;
}

export const apiClient = Object.assign(new ApiClient(), adminApiMethods);
