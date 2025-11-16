import axios, { AxiosError, AxiosResponse } from 'axios';
import { Document, User, Category, NotificationsApiResponse } from '@/types'; 
import Cookies from 'js-cookie'; 


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
    status?: 'success' | 'error';
    message?: string;
    data?: T; 
    users?: T; 
    user?: T; 
    error?: string; 
    errors?: Record<string, string[]>;
}

interface PaginatedApiResponse<T> {
    status?: 'success' | 'error';
    message?: string;
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface DocumentsApiResponse {
    documents: Document[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

interface CreateDocumentResponse {
    message: string;
    file_id: string;
    file_name: string;
    document: Document;
}

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor Request: Mengirim Token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor Response: Menangani Error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/login') || 
                                    error.config?.url?.includes('/register');
            
            if (!isAuthEndpoint && typeof window !== 'undefined') {
                Cookies.remove('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    return (response.data.data || response.data.user || response.data.users || response.data) as T;
}

function extractPaginatedData<T>(
    response: AxiosResponse<PaginatedApiResponse<T>>
): PaginatedApiResponse<T> {
    if (response.data.status === 'error') {
        throw new Error(response.data.message || 'An error occurred');
    }
    return response.data;
}

// ==== Auth API =====
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post<{
            token: string;
            user: User;
            message?: string;
        }>('/login', {
            username,
            password,
        });
        return response.data; 
    },

    me: async () => {
        const response = await api.get<User>('/me');
        return response.data;
    },

   logout: async () => {
        const response = await api.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    register: async (data: {
        name: string;
        username: string; 
        password: string;
        password_confirmation: string;
    }) => {
        const dataToSend = {
            name: data.name, 
            username: data.username,
            password: data.password,
            role: 'staff', 
        };
        
        const response = await api.post<ApiResponse<{ message: string; user: User }>>('/register', dataToSend); 
        return extractData(response);
    },
};

// ==== Category API =====
export const categoryAPI = {
    getAll: async () => {
        const response = await api.get<PaginatedApiResponse<Category>>('/categories');
        return extractPaginatedData(response);
    },

    create: async (data: { name: string; description?: string; parent_id?: number }) => {
        const response = await api.post<ApiResponse<Category>>('/categories', data);
        return extractData(response);
    },

    update: async (id: number, data: { name: string; description?: string; parent_id?: number }) => {
        const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
        return extractData(response);
    },

    delete: async (id: number) => {
        const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
        return response.data;
    },
};

// ==== Document API ====
export const documentAPI = {
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        letter_type?: string;
    }) => {
        const response = await api.get<DocumentsApiResponse>('/documents', { params });
        return response.data;
    },

    getById: async (id: string | number) => { 
        const response = await api.get<{ document: Document }>(`/documents/${id}`);
        return response.data.document;
    },

    create: async (formData: FormData) => {
        const response = await api.post<CreateDocumentResponse>('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (
        id: string | number, 
        data: {
            sender: string;
            subject: string;
            letter_type: 'masuk' | 'keluar';
        }
    ) => {
        const response = await api.put<{ message: string; document: Document }>(`/documents/${id}`, data);
        return response.data;
    },

    delete: async (id: string | number) => { 
        const response = await api.delete<{ message: string }>(`/documents/${id}`);
        return response.data;
    },

    download: async (id: string | number) => { 
        return api.get(`/documents/${id}/download`, {
            responseType: 'blob',
        });
    },
};

//  ==== User API (Admin only) =====
export const userAPI = {
    getAll: async () => {
        const response = await api.get<{ users: User[] }>('/users'); 
        return response.data.users;
    },

    create: async (data: {
        name: string;
        username: string; 
        password: string;
        role: 'admin' | 'staff';
    }) => {
        const response = await api.post<{ message: string; user: User }>('/users', data);
        return response.data.user;
    },

    update: async (
        id: string, 
        data: {
            name: string;
            username: string; 
            password?: string;
            role: 'admin' | 'staff';
        }
    ) => {
        const response = await api.put<{ user: User }>(`/users/${id}`, data);
        return response.data.user;
    },

    delete: async (id: string) => { 
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
    },
};

// ==== Notification API ====
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get<NotificationsApiResponse>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.post<{ message: string }>(
      `/notifications/${id}/read`
    );
    return response.data;
  },
};

// Handle error axios
export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.status === 404) {
            return 'Endpoint tidak ditemukan. Periksa URL backend Anda.';
        }
        return error.message || 'Terjadi kesalahan';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
}