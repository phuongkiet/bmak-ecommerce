import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./RootStore";
import * as addressApi from "@/agent/api/addressApi";
import type { AddressDto, CreateAddressRequest, UpdateAddressRequest } from "@/models/Address";

class AddressStore {
  rootStore: RootStore;
  addresses: AddressDto[] = [];
  selectedAddress: AddressDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  clearSelectedAddress(): void {
    this.selectedAddress = null;
  }

  async fetchMyAddresses(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await addressApi.getMyAddresses();
      runInAction(() => {
        this.addresses = data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch addresses";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchAddressById(id: number): Promise<AddressDto | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await addressApi.getAddressById(id);
      runInAction(() => {
        this.selectedAddress = data;
      });
      return data;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch address detail";
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createAddress(payload: CreateAddressRequest): Promise<number | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const newId = await addressApi.createAddress(payload);
      await this.fetchMyAddresses();
      return newId || null;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to create address";
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateAddress(payload: UpdateAddressRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const success = await addressApi.updateAddress(payload.id, payload);

      if (!success) {
        runInAction(() => {
          this.error = "Update address failed";
        });
        return false;
      }

      await this.fetchMyAddresses();

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to update address";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteAddress(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const success = await addressApi.deleteAddress(id);

      if (!success) {
        runInAction(() => {
          this.error = "Delete address failed";
        });
        return false;
      }

      runInAction(() => {
        this.addresses = this.addresses.filter((item) => item.id !== id);
        if (this.selectedAddress?.id === id) {
          this.selectedAddress = null;
        }
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to delete address";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default AddressStore;
