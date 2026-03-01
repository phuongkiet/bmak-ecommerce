export interface FavoriteProductDto
{
    productId: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    originalPrice: number;
    thumbnail: string;
    addedAt: Date;
}