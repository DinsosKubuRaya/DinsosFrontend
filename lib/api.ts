import axios, { AxiosError, AxiosResponse } from 'axios';
import { Document, User, NotificationsApiResponse , ActivityLog, DocumentStaff, DocumentStaffApiResponse} from '@/types'; 
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

// interface PaginatedApiResponse<T> {
//     status?: 'success' | 'error';
//     message?: string;
//     data: T[];
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
// }

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

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor Response 
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Error details:', error.response?.data);
        
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/login') || 
                                    error.config?.url?.includes('/register');
            
            if (!isAuthEndpoint && typeof window !== 'undefined') {
                console.log('Redirecting to login...');
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
        const response = await api.get<User>('/users/me');
        return response.data;
    },

 logout: async () => {
    try {
        const response = await api.post<ApiResponse<null>>('/logout', {}); 
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
},

    register: async (data: {
        name: string;
        username: string; 
        password: string;
        password_confirmation: string;
    }) => {
        console.warn("PERINGATAN KEAMANAN: Memanggil endpoint /users/admin yang tidak terproteksi untuk registrasi.");

        const dataToSend = {
            name: data.name, 
            username: data.username,
            password: data.password,
        };
        
        const response = await api.post<ApiResponse<{ message: string; user: User }>>('/users/admin', dataToSend); 
        return extractData(response);
    },
};



// ==== Activity Log API ====
export const activityLogAPI = {
  getAll: async () => {
    const response = await api.get<{ data: ActivityLog[]; total: number }>(
      '/activity-logs'
    );
    return response.data.data; 
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
        const downloadUrl = `${API_URL}/documents/${id}/download`;
        window.open(downloadUrl, '_blank');
    },
    
    getDownloadUrl: (id: string | number) => {
        return `${API_URL}/documents/${id}/download`;
    },
};

// ==== Document Staff API ====
export const documentStaffAPI = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    letter_type?: string;
  }) => {
    const response = await api.get<DocumentStaffApiResponse>('/document_staff', {
      params,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ document: DocumentStaff }>(
      `/document_staff/${id}`
    );
    return response.data.document;
  },

  create: async (formData: FormData) => {
    const response = await api.post<{
      message: string;
      document: DocumentStaff;
    }>('/document_staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      message: response.data.message,
      document: response.data.document,
    };
  },
  
  update: async (
    id: string,
    data: {
      sender: string;
      subject: string;
      letter_type: 'masuk' | 'keluar';
    }
  ) => {
    const formData = new FormData();
    formData.append('sender', data.sender);
    formData.append('subject', data.subject);
    formData.append('letter_type', data.letter_type);

    const response = await api.put<{
      message: string;
      document: DocumentStaff;
    }>(`/document_staff/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      message: response.data.message,
      document: response.data.document,
    };
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(
      `/document_staff/${id}`
    );
    return response.data;
  },

  //Download endpoint
  download: async (id: string) => {
    const downloadUrl = `${API_URL}/document_staff/${id}/download`;
    window.open(downloadUrl, '_blank');
  },

  //Download endpoint
  getDownloadUrl: (id: string) => {
    return `${API_URL}/document_staff/${id}/download`;
  },
};

//  ==== User API (Admin only) =====
export const userAPI = {
   getAll: async () => {
        try {
            const response = await api.get('/users');       
            const users = response.data?.users || response.data || [];            
            
            if (!Array.isArray(users)) {
                return [];
            }
            
            return users;         
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

   create: async (data: {
        name: string;
        username: string; 
        password: string;
        role: 'admin' | 'staff';
    }) => {
        const endpoint = data.role === 'admin' ? '/users/admin' : '/users/staff';
        const dataToSend = {
            name: data.name,
            username: data.username,
            password: data.password,
        };

        // Panggil endpoint
        const response = await api.post<{ message: string; user: User }>(endpoint, dataToSend);
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
    try {
      const response = await api.get<NotificationsApiResponse>('/notifications');
      return response.data;
    } catch (error) {
      console.error(' Notification fetch error:', error);
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await api.post<{ message: string }>(
        `/notifications/${id}/read`
      );
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
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