// API endpoints configuration
const API_BASE_URL = 'http://localhost:3000/api'; // API Gateway URL

const API_ENDPOINTS = {
  // User Service endpoints
  auth: {
    register: `${API_BASE_URL}/user/register`,
    login: `${API_BASE_URL}/user/login`,
    profile: `${API_BASE_URL}/user/profile`,
  },
  
  // Product Service endpoints
  products: {
    list: `${API_BASE_URL}/product/products`,
    details: (id) => `${API_BASE_URL}/product/products/${id}`,
    categories: `${API_BASE_URL}/product/categories`,
    categoryDetails: (id) => `${API_BASE_URL}/product/categories/${id}`,
    searchProducts: (query) => `${API_BASE_URL}/product/products?search=${query}`,
  },
  
  // Cart Service endpoints
  cart: {
    get: (id) => `${API_BASE_URL}/cart/carts/${id}`,
    getUserCart: (userId) => `${API_BASE_URL}/cart/carts/user/${userId}`,
    create: `${API_BASE_URL}/cart/carts`,
    clear: (id) => `${API_BASE_URL}/cart/carts/${id}/clear`,
    convert: (id) => `${API_BASE_URL}/cart/carts/${id}/convert`,
    addItem: (cartId) => `${API_BASE_URL}/cart/carts/${cartId}/items`,
    updateItem: (cartId, itemId) => `${API_BASE_URL}/cart/carts/${cartId}/items/${itemId}`,
    removeItem: (cartId, itemId) => `${API_BASE_URL}/cart/carts/${cartId}/items/${itemId}`,
  },
  
  // Order Service endpoints
  orders: {
    list: `${API_BASE_URL}/order/orders`,
    details: (id) => `${API_BASE_URL}/order/orders/${id}`,
    create: `${API_BASE_URL}/order/orders`,
    update: (id) => `${API_BASE_URL}/order/orders/${id}`,
    cancel: (id) => `${API_BASE_URL}/order/orders/${id}/cancel`,
    userOrders: (userId) => `${API_BASE_URL}/order/orders?userId=${userId}`,
  },
};

export default API_ENDPOINTS;
