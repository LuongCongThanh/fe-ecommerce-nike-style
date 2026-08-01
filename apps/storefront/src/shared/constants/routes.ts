export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: (slug: string) => `/products/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  CHECKOUT_FAILED: '/checkout/failed',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  ACCOUNT: {
    ORDERS: '/account/orders',
    ORDER: (id: string | number) => `/account/orders/${String(id)}`,
    PROFILE: '/account/profile',
  },
  ADMIN: {
    PRODUCTS: '/admin/products',
    PRODUCT_NEW: '/admin/products/new',
    PRODUCT_EDIT: (id: string | number) => `/admin/products/${String(id)}/edit`,
    ORDERS: '/admin/orders',
    ORDER: (id: string | number) => `/admin/orders/${String(id)}`,
  },
} as const;
