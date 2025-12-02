export type User = {
  ID?: string;     
  id?: string;     
  name: string;
  username: string;
  role: 'superadmin' | 'admin' | 'staff'; 
  photo_url?: string | null;
  photo_id?: string | null;
  created_at?: string;
  CreatedAt?: string; 
  updated_at?: string;
  UpdatedAt?: string;
};

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  message: string;
  created_at: string;
}

export function getUserId(user: User): string | undefined {
  return user.ID ?? user.id;
}

export type Document = {
  id: string;   
  sender: string;
  file_name: string;
  subject: string;       
  public_id: string;        
  resource_type: string;
  letter_type: 'masuk' | 'keluar';
  user_id?: string; 
  file_url: string; 
  user?: User;
  user_name?: string;
  created_at: string;
  updated_at: string;
  source?: string;
};

export interface DocumentStaff {
  id: string;   
  sender: string;
  file_name: string;
  subject: string;       
  public_id: string;        
  resource_type: string;
  letter_type: 'masuk' | 'keluar';
  user_id?: string; 
  file_url: string; 
  user?: User;
  user_name?: string;
  created_at: string;
  updated_at: string;
  source?: string;
}

export interface SuperiorOrder {
  id: string;
  document_id: string;
  document?: Document;
  user_id: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateSuperiorOrderRequest {
  document_id: string;
  user_ids: string[]; 
}

export interface UpdateSuperiorOrderRequest {
  user_ids: string[]; 
}

export type SharedDocument = Document | DocumentStaff;

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string; 
}

export interface NotificationsApiResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface ApiResponse<T> {
    status?: 'success' | 'error';
    message?: string;
    data?: T; 
    users?: T; 
    user?: T;
    document?: T;
    error?: string; 
    errors?: Record<string, string[]>;
}

export interface DocumentsResponse {
  documents: Document[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface DocumentStaffApiResponse {
  documents: DocumentStaff[]; 
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}