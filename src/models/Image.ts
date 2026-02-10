export interface UploadImageRequest {
    file: File;
}

export interface ImageParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
}

export interface AppImageDto {
    id: number;
    url: string;
    fileName: string;
    publicId: string;
    altText: string;
    fileSize: number;
    width: number;
    height: number;
}