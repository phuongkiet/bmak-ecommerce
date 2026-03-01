export interface NewsCategoryDto {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface CreateNewsCategoryCommand {
    name: string;
    description?: string;
}

export interface UpdateNewsCategoryCommand {
    id: number;
    name: string;
    description?: string;
}