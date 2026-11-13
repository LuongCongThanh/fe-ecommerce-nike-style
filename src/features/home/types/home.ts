export interface HomeBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
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

export interface HomeTestimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  quote: string;
  meta: string;
}
