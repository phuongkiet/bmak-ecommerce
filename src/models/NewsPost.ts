export interface NewsPostDto {
    id: number;
    categoryId: number;
    categoryName: string;
    authorId?: number;
    authorName?: string;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    thumbnailUrl?: string;
    isPublished: boolean;
    viewCount: number;
    createdAt: Date; 
    publishedAt?: Date;
}

export interface NewsPostSummaryDto {
    id: number;
    categoryId: number;
    categoryName: string;
    title: string;
    slug: string;
    summary?: string;
    thumbnailUrl?: string;
    isPublished: boolean;
    viewCount: number;
    createdAt: Date; 
    publishedAt?: Date;
}

export interface CreateNewsPostCommand {
    categoryId: number;
    authorId?: number;
    title: string;
    summary?: string;
    content: string;
    thumbnailUrl?: string;
    isPublished: boolean;
}

export interface UpdateNewsPostCommand {
    id: number;
    categoryId: number;
    authorId?: number;
    title: string;
    summary?: string;
    content: string;
    thumbnailUrl?: string;
    isPublished: boolean;
}