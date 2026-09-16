export const ENDPOINTS = {
  AUTH: { REGISTER: "/register", LOGIN: "/login", LOGOUT: "/logout" },
  FOODS: {
    GET_ALL: "/foods",
    GET_BY_ID: (foodId) => `/foods/${foodId}`,
    CREATE: "/create-food",
    UPDATE: (foodId) => `/update-food/${foodId}`,
    DELETE: (foodId) => `/delete-food/${foodId}`,
  },
  FAVORITES: { LIKE: "/like", UNLIKE: "/unlike", GET_LIKED: "/like-foods" },
  RATINGS: {
    CREATE: (foodId) => `/rate-food/${foodId}`,
    GET_BY_FOOD: (foodId) => `/food-rating/${foodId}`,
  },
  CARTS: {
    GET: "/carts",
    ADD: "/add-cart",
    UPDATE: (cartId) => `/update-cart/${cartId}`,
    DELETE: (cartId) => `/delete-cart/${cartId}`,
  },
  PAYMENTS: {
    GET_METHODS: "/payment-methods",
    GENERATE: "/generate-payment-methods",
  },
  TRANSACTIONS: {
    CREATE: "/create-transaction",
    MY_TRANSACTIONS: "/my-transactions",
    ALL: "/all-transactions",
    GET_BY_ID: (transactionId) => `/transaction/${transactionId}`,
    CANCEL: (transactionId) => `/cancel-transaction/${transactionId}`,
    UPDATE_PROOF: (transactionId) =>
      `/update-transaction-proof-payment/${transactionId}`,
    UPDATE_STATUS: (transactionId) =>
      `/update-transaction-status/${transactionId}`,
  },
  USERS: {
    CURRENT_USER: "/user",
    UPDATE_PROFILE: "/update-profile",
    GET_ALL: "/all-user",
    UPDATE_ROLE: (userId) => `/update-user-role/${userId}`,
  },
  UPLOAD: { IMAGE: "/upload-image" },
};
