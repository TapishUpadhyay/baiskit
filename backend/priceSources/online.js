const axios = require("axios");

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRelevantProduct(searchTerm, title) {
  const searchWords = normalize(searchTerm)
    .split(" ")
    .filter((word) => word.length >= 2);

  const productTitle = normalize(title);

  if (!searchWords.length || !productTitle) {
    return false;
  }

  const matchedWords = searchWords.filter((word) =>
    productTitle.includes(word)
  );

  return matchedWords.length >= Math.max(1, Math.ceil(searchWords.length * 0.5));
}

async function getOnlinePrices(product) {
  if (!process.env.SERPAPI_KEY) {
    return [];
  }

  try {
    const response = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google_shopping",
          q: product,
          gl: "in",
          hl: "en",
          api_key: process.env.SERPAPI_KEY
        }
      }
    );

    const results = response.data.shopping_results || [];

    const offers = results
      .filter(
        (item) =>
          item.title &&
          isRelevantProduct(product, item.title) &&
          item.extracted_price &&
          item.source &&
          item.product_link
      )
      .map((item) => ({
        platform: item.source,
        type: item.second_hand_condition
          ? "second-hand"
          : "online",
        product: item.title,
        price: Number(item.extracted_price),
        condition: item.second_hand_condition || "Brand New",
        seller: item.source,
        distance: null,
        url: item.product_link,
        source: "Online Aggregator",
        rating: item.rating || null,
        reviews: item.reviews || 0,
        delivery: item.delivery || null
      }));

    const uniqueOffers = offers.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (other) =>
            other.platform === item.platform &&
            other.price === item.price &&
            other.product === item.product
        )
    );

    return uniqueOffers;
  } catch (error) {
    console.error(
      "Online price search error:",
      error.response?.data || error.message
    );

    return [];
  }
}

module.exports = { getOnlinePrices };