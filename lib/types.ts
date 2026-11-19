export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  code?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  reviews?: {
    id?: string;
    name: string;
    rating: number;
    comment: string;
    date?: string;
    verified?: boolean;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
