import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./RootStore";
import * as voucherApi from "@/agent/api/voucherApi";
import {
  ApplyVoucherQuery,
  CreateVoucherCommand,
  PagedList,
  ToggleVoucherStatusCommand,
  UpdateVoucherCommand,
  VoucherDto,
  VoucherResponseDto,
  VoucherSpecParams,
} from "@/models/Voucher";

class VoucherStore {
  rootStore: RootStore;
  vouchers: PagedList<VoucherDto> | null = null;
  selectedVoucher: VoucherDto | null = null;
  appliedVoucher: VoucherResponseDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  clearError(): void {
    this.error = null;
  }

  clearSelectedVoucher(): void {
    this.selectedVoucher = null;
  }

  clearAppliedVoucher(): void {
    this.appliedVoucher = null;
  }

  async fetchVouchers(params?: VoucherSpecParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await voucherApi.getVouchers(params);
      runInAction(() => {
        this.vouchers = data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch vouchers";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchVoucherById(id: number): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await voucherApi.getVoucherById(id);
      runInAction(() => {
        this.selectedVoucher = data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch voucher";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createVoucher(command: CreateVoucherCommand): Promise<number> {
    this.isLoading = true;
    this.error = null;

    try {
      const voucherId = await voucherApi.createVoucher(command);
      return voucherId;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to create voucher";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateVoucher(id: number, command: UpdateVoucherCommand): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const updated = await voucherApi.updateVoucher(id, command);

      if (updated && this.selectedVoucher?.id === id) {
        runInAction(() => {
          this.selectedVoucher = { ...this.selectedVoucher!, ...command };
        });
      }

      return updated;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to update voucher";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async toggleVoucherStatus(id: number, command: ToggleVoucherStatusCommand): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const updated = await voucherApi.toggleVoucherStatus(id, command);

      if (updated && this.vouchers?.items?.length) {
        runInAction(() => {
          this.vouchers = {
            ...this.vouchers!,
            items: this.vouchers!.items.map((item) =>
              item.id === id ? { ...item, isActive: command.isActive } : item,
            ),
          };
        });
      }

      if (updated && this.selectedVoucher?.id === id) {
        runInAction(() => {
          this.selectedVoucher = { ...this.selectedVoucher!, isActive: command.isActive };
        });
      }

      return updated;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to toggle voucher status";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteVoucher(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const deleted = await voucherApi.deleteVoucher(id);

      if (deleted && this.vouchers?.items?.length) {
        runInAction(() => {
          this.vouchers = {
            ...this.vouchers!,
            items: this.vouchers!.items.filter((item) => item.id !== id),
            totalCount: Math.max(0, this.vouchers!.totalCount - 1),
          };
        });
      }

      if (deleted && this.selectedVoucher?.id === id) {
        runInAction(() => {
          this.selectedVoucher = null;
        });
      }

      return deleted;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to delete voucher";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async applyVoucher(query: ApplyVoucherQuery): Promise<VoucherResponseDto> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await voucherApi.applyVoucher(query);
      runInAction(() => {
        this.appliedVoucher = result;
      });
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to apply voucher";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default VoucherStore;
