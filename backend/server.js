const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/api", (req, res) => {
  res.json({
    message: "Baiskit API is working!"
  });
});


const products = [
  {
    id: 1,
    name: "Let Us C",
    category: "Programming",
    seller: "Campus Book Store",
    sellerType: "vendor",
    condition: "New",
    price: 550,
    distance: "0.6 km",
    verified: true
  },
  {
    id: 2,
    name: "Let Us C",
    category: "Programming",
    seller: "Rahul",
    sellerType: "individual",
    condition: "Like New",
    price: 300,
    distance: "0.3 km",
    verified: true
  },
  {
    id: 3,
    name: "Let Us C",
    category: "Programming",
    seller: "Sharma Book Depot",
    sellerType: "vendor",
    condition: "New",
    price: 480,
    distance: "1.2 km",
    verified: true
  }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});


app.listen(PORT, () => {
  console.log(`Baiskit API running on http://localhost:${PORT}`);
});