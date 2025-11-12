import axios, { AxiosResponse } from 'axios';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Response Type Backend
interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

interface PaginatedApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data: T[];
    pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    };
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

// Helper function to extract data from Backend response
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.status === 'error') {
    throw new Error(response.data.message || 'An error occurred');
    }
    return response.data.data as T;
}

function extractPaginatedData<T>(
    response: AxiosResponse<PaginatedApiResponse<T>>
    ): PaginatedApiResponse<T> {
    if (response.data.status === 'error') {
    throw new Error(response.data.message || 'An error occurred');
    }
    return response.data;
}

export const authAPI = {
login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: unknown }>>('/auth/login', {
    email,
    password,
    });
    return extractData(response);
},

logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
},

me: async () => {
    const response = await api.get<ApiResponse<unknown>>('/auth/me');
    return extractData(response);
},
};

// Category API
export const categoryAPI = {
getAll: async () => {
    const response = await api.get<ApiResponse<unknown[]>>('/categories');
    return extractData(response);
},

create: async (data: { name: string; description?: string; parent_id?: number }) => {
    const response = await api.post<ApiResponse<unknown>>('/categories', data);
    return extractData(response);
},

update: async (id: number, data: { name: string; description?: string; parent_id?: number }) => {
    const response = await api.put<ApiResponse<unknown>>(`/categories/${id}`, data);
    return extractData(response);
},

delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return response.data;
},
};

// Document API
export const documentAPI = {
getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: string | number;
    start_date?: string;
    end_date?: string;
}) => {
    const response = await api.get<PaginatedApiResponse<unknown>>('/documents', { params });
    return extractPaginatedData(response);
},

getById: async (id: number) => {
    const response = await api.get<ApiResponse<unknown>>(`/documents/${id}`);
    return extractData(response);
},

create: async (formData: FormData) => {
    const response = await api.post<ApiResponse<unknown>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
},

update: async (
    id: number,
    data: {
    title: string;
    description?: string;
    document_date: string;
    category_id: string | number;
    status?: string;
    }
) => {
    const response = await api.put<ApiResponse<unknown>>(`/documents/${id}`, data);
    return extractData(response);
},

delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/documents/${id}`);
    return response.data;
},

download: async (id: number) => {
    return api.get(`/documents/${id}/download`, {
    responseType: 'blob',
    });
},
};

// Activity Log API
export const activityLogAPI = {
getAll: async (params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
    document_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
}) => {
    const response = await api.get<PaginatedApiResponse<unknown>>('/activity-logs', { params });
    return extractPaginatedData(response);
},
};

// User API (Admin)
export const userAPI = {
getAll: async () => {
    const response = await api.get<ApiResponse<unknown>>('/users');
    return extractData(response);
},

create: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'staff';
    is_active?: boolean;
}) => {
    const response = await api.post<ApiResponse<unknown>>('/users', data);
    return extractData(response);
},

update: async (
    id: number,
    data: {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'staff';
    is_active: boolean;
    }
) => {
    const response = await api.put<ApiResponse<unknown>>(`/users/${id}`, data);
    return extractData(response);
},

delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
},
};