import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./RootStore";
// import { CreateTagCommand, TagDto } from "@/models/Tag";
import { getTags } from "@/agent/api/tagApi";
import { TagDto } from "@/models/Tag";

class TagStore {
  rootStore: RootStore;
  tags: TagDto[] = [];
  isLoading = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setTags(tags: TagDto[]): void {
    this.tags = tags;
  }

  clearTags(): void {
    this.tags = [];
  }

  async fetchTags(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await getTags();
      runInAction(() => {
        this.setTags(data);
      });
    } catch (error: any) {
      const message = error?.message || "Không thể tải thẻ";
      this.rootStore.commonStore.showError(message);
      runInAction(() => {
        this.clearTags();
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // async createTag(request: CreateTagCommand): Promise<number> {
  //   // Implementation for creating a tag will go here
    
  //   return 0; // Placeholder return value
  // }

  // async updateTag(id: number, name: string): Promise<void> {
  //   // Implementation for updating a tag will go here
  // }

  // async deleteTag(id: number): Promise<void> {
  //   // Implementation for deleting a tag will go here
  // }
}

export default TagStore;
