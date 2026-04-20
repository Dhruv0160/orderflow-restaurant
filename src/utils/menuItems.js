/**
 * Menu items configuration with images, prices, and categories.
 * Using high-quality unsplash placeholders matching standard Indian food.
 */
export const MENU_ITEMS = [
  {
    name: "Kulcha",
    description: "Soft and fluffy authentically baked tandoori kulcha.",
    price: 35.00,
    category: "Breads",
    image: "https://images.unsplash.com/photo-1626248916327-04664972f7d5?auto=format&fit=crop&q=80&w=400&h=300" 
  },
  {
    name: "Aloo Paratha",
    description: "Potatoes and Indian spices stuffed inside warm flatbread.",
    price: 60.00,
    category: "Breads",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Paneer Tikka",
    description: "Cottage cheese cubes marinated in yogurt and spices, grilled to perfection.",
    price: 220.00,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Chicken Patiala",
    description: "A delicious recipe featuring a creamy cashew nut and tomato sauce.",
    price: 310.00,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=400&h=300" // Placeholder
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer in creamy, mildly spiced tomato gravy.",
    price: 250.00,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with spiced chicken, herbs, and saffron.",
    price: 280.00,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in creamy butter.",
    price: 180.00,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Vada Pav",
    description: "Spicy potato fritter served in a soft bun with chutney.",
    price: 25.00,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1626079934177-3331b262d153?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Lassi",
    description: "Sweet churned classic yogurt drink.",
    price: 60.00,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1571556041697-3932ced0983d?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    name: "Butter Lassi",
    description: "Rich yogurt drink topped with a thick layer of malai/butter.",
    price: 90.00,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1550461716-ba4ee1cf6a5b?auto=format&fit=crop&q=80&w=400&h=300"
  }
];

// Extract distinct categories dynamically
export const MENU_CATEGORIES = [...new Set(MENU_ITEMS.map((item) => item.category))];
