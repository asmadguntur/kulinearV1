export const demoFoods = [
  {
    id: "nasi-goreng-tumpeng-special",
    name: "Nasi Goreng Tumpeng Special",
    price: 35000,
    rating: 4.9,
    reviews: 24,
    category: "Nasi & Ayam",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",
    description:
      "Nasi goreng aromatik berbentuk tumpeng mini dengan pelengkap telur dadar suwir, ayam goreng crispy, sambal terasi matang, dan kerupuk udang renyah khas KULINEAR.",
  },
  {
    id: "sate-ayam-madura-saus-kacang",
    name: "Sate Ayam Madura Saus Kacang",
    price: 28000,
    rating: 4.8,
    reviews: 24,
    category: "Sate & Bakaran",
    image:
      "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "gado-gado-ibu-kartini",
    name: "Gado-Gado Ibu Kartini",
    price: 22000,
    rating: 4.7,
    reviews: 24,
    category: "Nasi & Ayam",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "es-cendol-durian-legit",
    name: "Es Cendol Durian Legit",
    price: 18000,
    rating: 4.9,
    reviews: 24,
    category: "Minuman Tradisional",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",
  },
];

export function getDemoFood(foodId) {
  return demoFoods.find((food) => food.id === foodId) || demoFoods[0];
}
