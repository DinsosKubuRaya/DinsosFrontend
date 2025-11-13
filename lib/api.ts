import axios, { AxiosError, AxiosResponse } from 'axios';
import { Document, ActivityLog, User, Category } from '@/types'; 


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
    status?: 'success' | 'error';
    message?: string;
    data?: T; 
    users?: T; 
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

// Response khusus dari backend Golang untuk documents
interface DocumentsApiResponse {
    documents: Document[];
}

// Response untuk create document
interface CreateDocumentResponse {
    message: string;
    file_id: string;
    file_name: string;
    document: Document;
}

interface AuthResponseData {
    token: string;
    user: User;
}

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle responses and errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Helper function extract data from Backend response
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.status === 'error') {
        throw new Error(response.data.message || 'An error occurred');
    }
    return (response.data.data || response.data.users || response.data) as T;
}

function extractPaginatedData<T>(
    response: AxiosResponse<PaginatedApiResponse<T>>
): PaginatedApiResponse<T> {
    if (response.data.status === 'error') {
        throw new Error(response.data.message || 'An error occurred');
    }
    return response.data;
}


// Auth API
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', {
            username, 
            password,
        });
        return extractData(response);
    },

    register: async (data: {
    name: string;
    username: string; 
    password: string;
    password_confirmation: string;
}) => {
    const dataToSend = {
        nama: data.name, 
        username: data.username,
        password: data.password,
        role: 'staff', 
    };
    const response = await api.post<ApiResponse<AuthResponseData>>('/users', dataToSend); 
    
    return extractData(response);
},

    logout: async () => {
        const response = await api.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get<ApiResponse<User>>('/auth/me'); 
        return extractData(response);
    },
};

// Category API 
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

// Document API - Adjusted untuk backend Golang
export const documentAPI = {
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        letter_type?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        // Backend return DocumentsApiResponse
        const response = await api.get<DocumentsApiResponse>('/documents', { params });
        return response.data; 
    },

    getById: async (id: string) => { 
        const response = await api.get<{ document: Document }>(`/documents/${id}`);
        return response.data.document;
    },

    create: async (formData: FormData) => {
        // Response: { message, file_id, file_name, document }
        const response = await api.post<CreateDocumentResponse>('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data; // Return full response dengan message
    },

    update: async (
        id: string, 
        data: {
            sender: string;
            subject: string;
            letter_type: 'masuk' | 'keluar';
            user_id?: string;
        }
    ) => {
        const response = await api.put<{ message: string; document: Document }>(`/documents/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => { 
        const response = await api.delete<{ message: string }>(`/documents/${id}`);
        return response.data;
    },

    download: async (id: string) => { 
        return api.get(`/documents/${id}/download`, {
            responseType: 'blob',
        });
        
    },
    
};

// upload document function
export const uploadDocument = (formData: FormData) => {
  return api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
};


// Activity Log API
export const activityLogAPI = {
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        user_id?: string; 
        document_id?: string; 
        action?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await api.get<PaginatedApiResponse<ActivityLog>>('/activity-logs', { params });
        return extractPaginatedData(response);
    },
};

// User API (Admin only)
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

// Handle error axios
export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        return error.message || 'Terjadi kesalahan';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
}