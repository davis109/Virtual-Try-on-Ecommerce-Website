const products = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    price: 19.99,
    category: "T-Shirts",
    image: "https://beyondtheshopdoor.com/wp-content/uploads/2023/04/Classic-Tee-White-Kowtow-Clothing.jpg",
    description: "A comfortable and stylish classic white t-shirt, perfect for any casual occasion.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["white", "black", "navy"],
    rating: 4.5,
    numReviews: 12,
    featured: true,
    isTryOnEnabled: true,
    countInStock: 10
  },
  {
    id: 2,
    name: "Slim Fit Jeans",
    price: 49.99,
    category: "Bottoms",
    image: "https://example.com/slim-fit-jeans.jpg",
    description: "Modern slim fit jeans with a classic 5-pocket design.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["blue", "black", "grey"],
    rating: 4.2,
    numReviews: 8,
    featured: false,
    isTryOnEnabled: true,
    countInStock: 15
  },
  {
    id: 3,
    name: "Casual Hoodie",
    price: 39.99,
    category: "Outerwear",
    image: "https://example.com/casual-hoodie.jpg",
    description: "A warm and comfortable hoodie for everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["grey", "black", "red"],
    rating: 4.7,
    numReviews: 15,
    featured: true,
    isTryOnEnabled: true,
    countInStock: 8
  }
];

export default products; 