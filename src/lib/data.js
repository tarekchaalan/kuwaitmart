export const CATEGORIES = [
  {
    id: "avicare-pro-biotic",
    name_en: "AviCare Pro Biotic",
    name_ar: "أفي كير برو بيوتيك",
  },
  {
    id: "avimax-products",
    name_en: "Avimax Products",
    name_ar: "منتجات أفيمـاكس",
  },
  { id: "bird-food", name_en: "Bird Food", name_ar: "أطعمة الطيور" },
  {
    id: "hand-feeding-formula",
    name_en: "Hand Feeding Formula",
    name_ar: "خلطة التغذية باليد",
  },
  { id: "vitamins", name_en: "Vitamins", name_ar: "فيتامينات" },
  {
    id: "cages-accessories",
    name_en: "Bird Cages & Accessories",
    name_ar: "أقفاص الطيور وإكسسواراتها",
  },
  { id: "toys", name_en: "Bird Toys", name_ar: "ألعاب الطيور" },
];

export const SEED_PRODUCTS = Array.from({ length: 72 }).map((_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length].id;
  const basePrice = 0.75 + (i % 9) * 0.25; // KWD
  const discountPct = i % 7 === 0 ? 15 : 0;
  return {
    id: `prod-${i + 1}`,
    categoryId: cat,
    title_en: `Bird Product ${i + 1}`,
    title_ar: `منتج طيور ${i + 1}`,
    image: "[IMG_PLACEHOLDER_PRODUCT]",
    priceKWD: parseFloat(basePrice.toFixed(3)),
    discountPct,
    severalOptions: i % 5 === 0,
  };
});
