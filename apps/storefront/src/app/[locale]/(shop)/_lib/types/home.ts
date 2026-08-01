export interface HomeBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomeCategory {
  slug: string;
  name: string;
  image: string;
  productCount: number;
  description?: string;
}

export interface HomeHero {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaSale: string;
  image: string;
  trustItems: string[];
}

export interface HomeProductHighlight {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  badges: Array<'best-seller' | 'new' | 'sale' | 'low-stock'>;
}

export interface HomeTestimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  quote: string;
  meta: string;
}
