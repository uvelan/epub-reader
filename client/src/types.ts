export interface User {
    id: number;
    username: string;
}

export interface File {
    id: number;
    user_id: number;
    filename: string;
    path: string;
    size: number;
    uploaded_at: string;
    url?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}