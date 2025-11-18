export type User = {
  ID?: string;     
  id?: string;     
  name: string;
  username: string;
  role: string;
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
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  status?: 'success' | 'error';
  message?: string;
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface DocumentsResponse {
  documents: Document[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface DocumentResponse {
  document: Document;
}

export interface MessageResponse {
  message: string;
}

export interface CreateDocumentResponse {
  message: string;
  file_id: string;
  file_name: string;
  document: Document;
}

export interface ApiDocumentsResponse {
  documents: Document[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface ApiCreateDocumentResponse {
  message: string;
  file_id: string;
  file_name: string;
  document: Document;
}

export interface DocumentStaffApiResponse {
  documents: DocumentStaff[]; 
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}