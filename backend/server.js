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

app.listen(PORT, () => {
  console.log(`Baiskit API running on http://localhost:${PORT}`);
});