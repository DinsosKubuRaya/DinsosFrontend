import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  Document,
  DocumentStaff,
  User,
  ActivityLog,
  NotificationsApiResponse,
  SuperiorOrder,
  CreateSuperiorOrderRequest,
  UpdateSuperiorOrderRequest,
  DocumentStaffApiResponse,
  DocumentsResponse,
  ApiResponse
} from "@/types";

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

interface DocumentUpdateData {
  sender: string;
  subject: string;
  letter_type: "masuk" | "keluar";
  document_number?: string;
  description?: string;
  file?: File | null;
}

interface CreateUserData {
  name: string;
  username: string;
  password: string;
  role: "admin" | "staff" | "superadmin";
  password_confirmation?: string;
}

interface UpdateUserData {
  name: string;
  username: string;
  password?: string;
  role: "admin" | "staff" | "superadmin";
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/login") ||
        error.config?.url?.includes("/register");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        Cookies.remove("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper type-safe untuk extract data response
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.data) return response.data.data;
  if (response.data.user) return response.data.user;
  if (response.data.users) return response.data.users;
  if (response.data.document) return response.data.document;
  
  // Fallback
  return response.data as unknown as T;
}

// --- AUTH API ---
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post<LoginResponse>("/login", {
      username,
      password,
    });
    return response.data;
  },

  me: async () => {
    const response = await api.get<ApiResponse<User>>("/users/me");
    return extractData<User>(response);
  },

  logout: async () => {
    try {
      const response = await api.post<ApiResponse<null>>("/logout", {});
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  register: async (data: CreateUserData) => {
    const response = await api.post<ApiResponse<{ message: string; user: User }>>(
      "/users/admin",
      data
    );
    return extractData(response);
  },
};

// --- DOKUMEN DINAS (ADMIN) ---
export const documentAPI = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    letter_type?: string;
  }) => {
    const response = await api.get<DocumentsResponse>("/documents", { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get<{ document: Document }>(`/documents/${id}`);
    return response.data.document;
  },

  create: async (formData: FormData) => {
    const response = await api.post<ApiResponse<Document>>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: string | number, data: DocumentUpdateData) => {
    const formData = new FormData();
    formData.append("sender", data.sender);
    formData.append("subject", data.subject);
    formData.append("letter_type", data.letter_type);
    
    if (data.description) formData.append("description", data.description);
    if (data.document_number) formData.append("document_number", data.document_number);
    if (data.file) formData.append("file", data.file);

    const response = await api.put<ApiResponse<Document>>(
      `/documents/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await api.delete<{ message: string }>(`/documents/${id}`);
    return response.data;
  },

  download: async (id: string | number) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dokumen-dinas-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getDownloadUrl: (id: string | number) => {
    return `${API_URL}/documents/${id}/download`;
  },
};

// --- DOKUMEN STAFF (MONITORING) ---
export const documentStaffAPI = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    letter_type?: string;
  }) => {
    const response = await api.get<DocumentStaffApiResponse>("/document_staff", {
      params,
    });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get<{ document: DocumentStaff }>(
      `/document_staff/${id}`
    );
    return response.data.document;
  },

  create: async (formData: FormData) => {
    const response = await api.post<{
      message: string;
      document: DocumentStaff;
    }>("/document_staff", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: string | number, data: DocumentUpdateData) => {
    const formData = new FormData();
    formData.append("sender", data.sender);
    formData.append("subject", data.subject);
    formData.append("letter_type", data.letter_type);
    
    if (data.description) formData.append("description", data.description);
    if (data.document_number) formData.append("document_number", data.document_number);
    if (data.file) formData.append("file", data.file);

    const response = await api.put<{
      message: string;
      document: DocumentStaff;
    }>(`/document_staff/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await api.delete<{ message: string }>(
      `/document_staff/${id}`
    );
    return response.data;
  },

  download: async (id: string | number) => {
    const response = await api.get(`/document_staff/${id}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dokumen-staff-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getDownloadUrl: (id: string | number) => {
    return `${API_URL}/document_staff/${id}/download`;
  },
};

// --- USER API ---
export const userAPI = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ users: User[] } | User[]>("/users");
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as { users: User[] }).users || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUsersForFilter: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ users: User[] }>("/users/for-filter");
      const users = response.data?.users || [];
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error("Error fetching filter users:", error);
      throw error;
    }
  },

  create: async (data: CreateUserData) => {
    let endpoint = "/users/staff";
    if (data.role === "admin") endpoint = "/users/admin";
    if (data.role === "superadmin") endpoint = "/users/superadmin";

    const response = await api.post<{ message: string; user: User }>(
      endpoint,
      data
    );
    return response.data.user;
  },

  update: async (id: string | number, data: UpdateUserData) => {
    const response = await api.put<{ user: User }>(`/users/${id}`, data);
    return response.data.user;
  },

  delete: async (id: string | number) => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
};

// --- SUPERIOR ORDER API ---
export const superiorOrderAPI = {
  create: async (data: CreateSuperiorOrderRequest) => {
    const response = await api.post<ApiResponse<null>>("/superior_orders", data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<ApiResponse<SuperiorOrder[]>>(
      "/superior_orders"
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? (data as SuperiorOrder[]) : [];
  },

  getByDocumentId: async (documentId: string) => {
    const response = await api.get<ApiResponse<SuperiorOrder[]>>(
      `/superior_orders/${documentId}`
    );
    const data = response.data.data || response.data;
    return Array.isArray(data) ? (data as SuperiorOrder[]) : [];
  },

  update: async (documentId: string, data: UpdateSuperiorOrderRequest) => {
    const response = await api.put<ApiResponse<null>>(
      `/superior_orders/${documentId}`,
      data
    );
    return response.data;
  },

  delete: async (documentId: string) => {
    const response = await api.delete<ApiResponse<null>>(
      `/superior_orders/${documentId}`
    );
    return response.data;
  },
};

// --- NOTIFICATION API ---
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get<NotificationsApiResponse>("/notifications");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.post<{ message: string }>(
      `/notifications/${id}/read`
    );
    return response.data;
  },
};

// --- ACTIVITY LOG API ---
export const activityLogAPI = {
  getAll: async () => {
    const response = await api.get<{ data: ActivityLog[]; total: number }>(
      "/activity-logs"
    );
    return response.data.data;
  },
};

// Helper Error Message 
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || "Terjadi kesalahan";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak diketahui";
}