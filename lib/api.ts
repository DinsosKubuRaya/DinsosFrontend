import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  Document,
  DocumentStaff,
  User,
  ActivityLog,
  NotificationsApiResponse,
  DocumentStaffApiResponse,
  DocumentsResponse,
  ApiResponse
} from "@/types";

// --- INTERFACES ---
interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

interface DocumentUpdateData {
  sender: string;
  subject: string;
  letter_type: "masuk" | "keluar";
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

// --- INTERCEPTOR ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
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

function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.data) return response.data.data;
  if (response.data.user) return response.data.user;
  if (response.data.users) return response.data.users;
  if (response.data.document) return response.data.document;
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
    const response = await api.post<ApiResponse<null>>("/logout", {});
    return response.data;
  },

  register: async (data: CreateUserData) => {
    const response = await api.post<ApiResponse<{ message: string; user: User }>>(
      "/users/admin",
      data
    );
    return extractData(response);
  },
};

// --- DOKUMEN DINAS (ADMIN)  ---
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
    const response = await api.post<ApiResponse<Document>>("/documents", formData);
    return response.data;
  },

  update: async (id: string | number, data: DocumentUpdateData) => {
    
    if (!data.file) {
      const jsonPayload = {
        sender: data.sender,
        subject: data.subject,
        letter_type: data.letter_type,
      };

      const response = await api.put<ApiResponse<Document>>(
        `/documents/${id}`,
        jsonPayload
      );
      return response.data;
    }

    const formData = new FormData();
    formData.append("sender", data.sender);
    formData.append("subject", data.subject);
    formData.append("letter_type", data.letter_type);
    formData.append("file", data.file);

    const response = await api.put<ApiResponse<Document>>(
      `/documents/${id}`,
      formData
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

// --- DOKUMEN STAFF  ---
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
    }>("/document_staff", formData);
    return response.data;
  },
  

  update: async (id: string | number, data: DocumentUpdateData) => {
    const formData = new FormData();
    
    formData.append("subject", data.subject);
    
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await api.put<{
      message: string;
      document: DocumentStaff;
    }>(`/document_staff/${id}`, formData);
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
    const response = await api.get<{ users: User[] } | User[]>("/users");
    if (Array.isArray(response.data)) return response.data;
    return (response.data as { users: User[] }).users || [];
  },

  getUsersForFilter: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>("/users/for-filter");
    return response.data?.users || [];
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

  update: async (id: string | number, data: UpdateUserData | FormData) => {
    if (data instanceof FormData) {
        const response = await api.put<{ user: User }>(`/users/${id}`, data);
        return response.data.user;
    }
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.username) formData.append("username", data.username);
    if (data.role) formData.append("role", data.role);
    if (data.password) formData.append("new_password", data.password);

    const response = await api.put<{ user: User }>(`/users/${id}`, formData);
    return response.data.user;
  },

  delete: async (id: string | number) => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
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
    const response = await api.post<{ message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post<{ message: string; updated_count: number }>(
      "/notifications/read-all"
    );
    return response.data;
  },
};

// --- ACTIVITY LOG API ---
export const activityLogAPI = {
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get<{ data: ActivityLog[]; total: number }>(
      "/activity-logs", 
      { params: { page, limit } } 
    );
    return response.data;
  },
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || "Terjadi kesalahan";
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";
}