function getBaiskitPrices(product, listings = []) {
  return listings.map((item) => {
    const isPreOwned =
      item.condition?.toLowerCase().includes("pre-owned") ||
      item.condition?.toLowerCase().includes("good condition") ||
      item.condition?.toLowerCase().includes("used") ||
      item.condition?.toLowerCase().includes("second-hand") ||
      item.sellerType?.toLowerCase().includes("individual") ||
      item.sellerType?.toLowerCase().includes("student");

    return {
      platform: "Baiskit Marketplace",
      type: isPreOwned ? "second-hand" : "local",
      product: item.name,
      price: item.price,
      condition: item.condition || (isPreOwned ? "Pre-owned" : "Brand New"),
      seller: item.seller,
      sellerType: item.sellerType || (isPreOwned ? "Individual Seller" : "Verified Store"),
      verified: item.verified ?? true,
      distance: item.distance || "Near you",
      url: item.url || null,
      source: isPreOwned ? "Baiskit Second-Hand Users" : "Baiskit Verified Local Store",
      rating: item.rating || 4.7,
      reviews: item.reviews || 24
    };
  });
}

module.exports = {
  getBaiskitPrices
};