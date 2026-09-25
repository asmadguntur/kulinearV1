export const ROLES = { ADMIN: "admin", USER: "user" };

export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FOODS: "/foods",
  FOOD_DETAIL: (foodId) => `/foods/${foodId}`,
  FOOD_RATING: (foodId) => `/foods/${foodId}/rating`,
  FAVORITES: "/favorites",
  CART: "/cart",
  CHECKOUT: "/checkout",
  TRANSACTIONS: "/transactions",
  TRANSACTION_DETAIL: (transactionId) => `/transactions/${transactionId}`,
  PROFILE: "/profile",
  ADMIN: "/admin",
  ADMIN_FOODS: "/admin/foods",
  ADMIN_CREATE_FOOD: "/admin/foods/create",
  ADMIN_EDIT_FOOD: (foodId) => `/admin/foods/${foodId}/edit`,
  ADMIN_USERS: "/admin/users",
  ADMIN_TRANSACTIONS: "/admin/transactions",
  ADMIN_PAYMENT_METHODS: "/admin/payment-methods",
  UNAUTHORIZED: "/unauthorized",
};
