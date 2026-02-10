export interface ProductFilterAggregationDto {
    // Thống kê giá thấp nhất/cao nhất trong tập kết quả
    minPrice: number;
    maxPrice: number;

    // Các nhóm thuộc tính (Màu sắc, Kích thước...)
    attributes: FilterGroupDto[];
    categories: FilterGroupDto[];
}

export interface FilterGroupDto {
    code: string; // VD: COLOR
    name: string; // VD: Màu sắc
    options: FilterItemDto[];
}

export interface FilterItemDto {
    value: string; // VD: Red
    label: string; // VD: Đỏ
    count: number; // Số lượng sản phẩm (quan trọng cho dynamic filter)
}