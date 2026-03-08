import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./RootStore";
import * as businessRuleApi from "@/agent/api/businessRuleApi";
import {
  BusinessRuleDto,
  BusinessRuleSpecParams,
  CreateBusinessRuleCommand,
  PagedList,
  ToggleBusinessRuleStatusCommand,
  UpdateBusinessRuleCommand,
} from "@/models/BusinessRule";

class BusinessRuleStore {
  rootStore: RootStore;
  businessRules: PagedList<BusinessRuleDto> | null = null;
  selectedBusinessRule: BusinessRuleDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  clearError(): void {
    this.error = null;
  }

  clearSelectedBusinessRule(): void {
    this.selectedBusinessRule = null;
  }

  async fetchBusinessRules(params?: BusinessRuleSpecParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await businessRuleApi.getBusinessRules(params);
      runInAction(() => {
        this.businessRules = data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch business rules";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchBusinessRuleById(id: number): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await businessRuleApi.getBusinessRuleById(id);
      runInAction(() => {
        this.selectedBusinessRule = data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to fetch business rule";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createBusinessRule(command: CreateBusinessRuleCommand): Promise<number> {
    this.isLoading = true;
    this.error = null;

    try {
      const businessRuleId = await businessRuleApi.createBusinessRule(command);
      return businessRuleId;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to create business rule";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateBusinessRule(id: number, command: UpdateBusinessRuleCommand): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const updated = await businessRuleApi.updateBusinessRule(id, command);

      if (updated && this.selectedBusinessRule?.id === id) {
        runInAction(() => {
          this.selectedBusinessRule = { ...this.selectedBusinessRule!, ...command };
        });
      }

      return updated;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to update business rule";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async toggleBusinessRuleStatus(
    id: number,
    command: ToggleBusinessRuleStatusCommand,
  ): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const updated = await businessRuleApi.toggleBusinessRuleStatus(id, command);

      if (updated && this.businessRules?.items?.length) {
        runInAction(() => {
          this.businessRules = {
            ...this.businessRules!,
            items: this.businessRules!.items.map((item) =>
              item.id === id ? { ...item, isActive: command.isActive } : item,
            ),
          };
        });
      }

      if (updated && this.selectedBusinessRule?.id === id) {
        runInAction(() => {
          this.selectedBusinessRule = {
            ...this.selectedBusinessRule!,
            isActive: command.isActive,
          };
        });
      }

      return updated;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to toggle business rule status";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteBusinessRule(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const deleted = await businessRuleApi.deleteBusinessRule(id);

      if (deleted && this.businessRules?.items?.length) {
        runInAction(() => {
          this.businessRules = {
            ...this.businessRules!,
            items: this.businessRules!.items.filter((item) => item.id !== id),
            totalCount: Math.max(0, this.businessRules!.totalCount - 1),
          };
        });
      }

      if (deleted && this.selectedBusinessRule?.id === id) {
        runInAction(() => {
          this.selectedBusinessRule = null;
        });
      }

      return deleted;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Failed to delete business rule";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default BusinessRuleStore;
