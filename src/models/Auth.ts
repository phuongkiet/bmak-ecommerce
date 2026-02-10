export interface AuthResponse {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    token: string;
    refreshToken?: string;
    roles: string[];
}

export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface TokenRequest{
    accessToken: string;
    refreshToken: string;
}