export interface UserDto {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  roles: string[];
}

export interface UserSummaryDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  isDeleted: boolean;
  roles: string;
}

export interface CreateNewUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  roles: string[];
}

export interface DeleteUserRequest {
  userId: number;
  isHardDelete: boolean;
}

export interface UpdateUserRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  roles: string[];
  isActive: boolean;
}

export interface UserSpecParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  sortOrder?: string
}