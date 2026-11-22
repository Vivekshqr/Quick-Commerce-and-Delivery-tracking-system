// Sample grocery catalogue. Images are free placeholder images (placehold.co).
const img = (text, bg) =>
  `https://placehold.co/400x300/${bg}/ffffff/png?text=${encodeURIComponent(text)}&font=roboto`;

const C = { fruits: "16a34a", veg: "65a30d", dairy: "0284c7", bakery: "d97706", snacks: "dc2626", drinks: "7c3aed", staples: "a16207", home: "475569" };

module.exports = [
  { name: "Bananas", unit: "6 pcs", price: 49, category: "Fruits", stock: 80, imageUrl: img("Bananas", C.fruits), description: "Fresh ripe bananas" },
  { name: "Apples (Shimla)", unit: "1 kg", price: 180, category: "Fruits", stock: 50, imageUrl: img("Apples", C.fruits), description: "Crisp red apples" },
  { name: "Oranges", unit: "1 kg", price: 120, category: "Fruits", stock: 40, imageUrl: img("Oranges", C.fruits), description: "Juicy Nagpur oranges" },
  { name: "Tomatoes", unit: "1 kg", price: 40, category: "Vegetables", stock: 100, imageUrl: img("Tomatoes", C.veg), description: "Farm fresh tomatoes" },
  { name: "Onions", unit: "1 kg", price: 35, category: "Vegetables", stock: 120, imageUrl: img("Onions", C.veg), description: "Red onions" },
  { name: "Potatoes", unit: "1 kg", price: 30, category: "Vegetables", stock: 150, imageUrl: img("Potatoes", C.veg), description: "All-purpose potatoes" },
  { name: "Spinach", unit: "250 g", price: 25, category: "Vegetables", stock: 30, imageUrl: img("Spinach", C.veg), description: "Fresh palak bunch" },
  { name: "Toned Milk", unit: "1 L", price: 56, category: "Dairy", stock: 60, imageUrl: img("Milk", C.dairy), description: "Pasteurised toned milk" },
  { name: "Curd", unit: "400 g", price: 45, category: "Dairy", stock: 40, imageUrl: img("Curd", C.dairy), description: "Thick set dahi" },
  { name: "Paneer", unit: "200 g", price: 90, category: "Dairy", stock: 25, imageUrl: img("Paneer", C.dairy), description: "Soft malai paneer" },
  { name: "Butter", unit: "100 g", price: 58, category: "Dairy", stock: 35, imageUrl: img("Butter", C.dairy), description: "Salted butter" },
  { name: "Brown Bread", unit: "400 g", price: 50, category: "Bakery", stock: 30, imageUrl: img("Brown Bread", C.bakery), description: "Whole wheat bread" },
  { name: "Eggs", unit: "12 pcs", price: 84, category: "Bakery", stock: 45, imageUrl: img("Eggs", C.bakery), description: "Farm eggs, tray of 12" },
  { name: "Potato Chips", unit: "90 g", price: 20, category: "Snacks", stock: 100, imageUrl: img("Chips", C.snacks), description: "Classic salted chips" },
  { name: "Chocolate Bar", unit: "50 g", price: 45, category: "Snacks", stock: 70, imageUrl: img("Chocolate", C.snacks), description: "Milk chocolate" },
  { name: "Orange Juice", unit: "1 L", price: 110, category: "Beverages", stock: 30, imageUrl: img("Orange Juice", C.drinks), description: "No added sugar" },
  { name: "Green Tea", unit: "25 bags", price: 150, category: "Beverages", stock: 25, imageUrl: img("Green Tea", C.drinks), description: "Refreshing green tea" },
  { name: "Basmati Rice", unit: "1 kg", price: 140, category: "Staples", stock: 60, imageUrl: img("Basmati Rice", C.staples), description: "Long grain basmati" },
  { name: "Toor Dal", unit: "1 kg", price: 160, category: "Staples", stock: 50, imageUrl: img("Toor Dal", C.staples), description: "Unpolished toor dal" },
  { name: "Dishwash Liquid", unit: "500 ml", price: 99, category: "Household", stock: 40, imageUrl: img("Dishwash", C.home), description: "Lemon dishwash gel" },
];
