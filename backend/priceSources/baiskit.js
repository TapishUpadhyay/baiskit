function getBaiskitPrices(product, listings) {
  return listings.map((item) => ({
    platform: "Baiskit",
    type: item.condition?.toLowerCase().includes("pre-owned")
      ? "second-hand"
      : "local",

    product: item.name,
    price: item.price,

    condition: item.condition,

    seller: item.seller,

    distance: item.distance,

    url: null,

    source: "Baiskit"
  }));
}

module.exports = {
  getBaiskitPrices
};