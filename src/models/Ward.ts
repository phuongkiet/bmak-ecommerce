export interface WardDto {
    id: string;
    name: string;
}

export interface WardParams {
  pageNumber: number;
  pageSize: number;
  provinceId?: string;
}