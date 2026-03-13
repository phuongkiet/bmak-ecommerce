import userApi from "@/agent/api/userApi";
import { PaginatedResult } from "@/models/Common";
import { ChangePasswordAdminRequest, UserDto, UserSpecParams, UserSummaryDto } from "@/models/User";
import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./RootStore";

class UserStore {
  users: PaginatedResult<UserSummaryDto[]> | null = null;
  userDetail: UserDto | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  fetchUser = async (params: Partial<UserSpecParams>) => {
    // Implementation for fetching user data goes here
    this.isLoading = true;
    this.error = null;

    try {
      const result = await userApi.getUsers(params);
      console.log("API returned users:", result);
      runInAction(() => {
        this.users = result;
        console.log("Fetched users:", this.users);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to fetch users";
        this.isLoading = false;
      });
      console.error("Error fetching users:", error);
    }
  };

  fetchUserDetail = async (id: number) => {
    this.isLoading = true
    this.error = null
    try {
      const data = await userApi.getUserById(id)
      runInAction(() => {
        this.userDetail = data
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user detail'
        this.isLoading = false
      })
      throw error
    }
  };

  updateUser = async (userData: any) => {
    this.isLoading = true
    this.error = null
    try {
      const id = userData.userId ?? userData.id
      const success = await userApi.updateUser(id, { ...userData, userId: id })
      runInAction(() => {
        if (this.userDetail && this.userDetail.id === id) {
          this.userDetail = { ...this.userDetail, ...userData }
        }
        if (this.users && Array.isArray(this.users.items)) {
          this.users.items = this.users.items.map((u: any) => (u.id === id ? { ...u, ...userData } : u))
        }
        this.isLoading = false
      })
      return success
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to update user'
        this.isLoading = false
      })
      throw error
    }
  };

  createNewUser = async (newUserData: any) => {
    this.isLoading = true
    this.error = null
    try {
      const newId = await userApi.createUser(newUserData)
      runInAction(() => {
        // Optionally append to users list
        if (this.users && Array.isArray(this.users.items)) {
          const summary: UserSummaryDto = {
            id: newId,
            fullName: newUserData.fullName || newUserData.name || '',
            email: newUserData.email,
            phoneNumber: newUserData.phoneNumber || '',
            isDeleted: false,
            roles: (newUserData.roles || []).join ? (newUserData.roles as string[]).join(',') : String(newUserData.roles || ''),
          }
          this.users.items = [summary, ...this.users.items]
          // adjust total count
          this.users.metaData.totalItems = (this.users.metaData.totalItems || 0) + 1
        }
        this.isLoading = false
      })
      return newId
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to create user'
        this.isLoading = false
      })
      throw error
    }
  };

  deleteUser = async (userId: number, hardDelete: boolean = false) => {
    this.isLoading = true
    this.error = null
    try {
      const success = await userApi.deleteUser(userId, hardDelete)
      runInAction(() => {
        if (success && this.users && Array.isArray(this.users.items)) {
          if (hardDelete) {
            this.users.items = this.users.items.filter((u: any) => u.id !== userId)
            this.users.metaData.totalItems = Math.max(0, (this.users.metaData.totalItems || 1) - 1)
          } else {
            // soft delete: mark isDeleted = true
            this.users.items = this.users.items.map((u: any) =>
              u.id === userId ? { ...u, isDeleted: true } : u
            )
          }
        }
        if (success && this.userDetail && this.userDetail.id === userId) {
          this.userDetail = hardDelete ? null : { ...this.userDetail, isDeleted: true }
        }
        this.isLoading = false
      })
      return success
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to delete user'
        this.isLoading = false
      })
      throw error
    }
  };

  restoreUser = async (userId: number) => {
    this.isLoading = true
    this.error = null
    try {
      const success = await userApi.restoreUser(userId)
      runInAction(() => {
        if (success && this.users && Array.isArray(this.users.items)) {
          this.users.items = this.users.items.map((u: any) =>
            u.id === userId ? { ...u, isDeleted: false } : u
          )
        }
        if (success && this.userDetail && this.userDetail.id === userId) {
          this.userDetail = { ...this.userDetail, isDeleted: false }
        }
        this.isLoading = false
      })
      return success
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to restore user'
        this.isLoading = false
      })
      throw error
    }
  };

  changePassword = async (userId: number, data: ChangePasswordAdminRequest) => {
    this.isLoading = true
    this.error = null
    try {
      const success = await userApi.changePasswordAdmin(userId, data)
      runInAction(() => {
        this.isLoading = false
      })
      return success
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to change password'
        this.isLoading = false
      })
      throw error
    }
  };
}

export default UserStore;
