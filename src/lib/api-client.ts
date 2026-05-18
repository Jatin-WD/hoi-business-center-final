import { adminApiMethods } from "./admin-api-methods";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hoi-business-backend-production-e7dd.up.railway.app/api";
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

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : { message: await response.text() };

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

  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  setAuthSession(token: string, user: unknown) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  clearAuthSession() {
    const hadToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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

  async verifyRegistration(payload: { email: string; code: string }) {
    return this.request("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(payload),
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

  async requestPhoneOtp(phone: string) {
    return this.request("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhoneOtp(payload: { phone: string; code: string }) {
    return this.request("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(payload),
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

export const apiClient = Object.assign(new ApiClient(), adminApiMethods);
