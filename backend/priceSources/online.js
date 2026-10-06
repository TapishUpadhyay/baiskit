const axios = require("axios");

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(searchTerm) {
  return normalize(searchTerm)
    .split(" ")
    .filter((word) => word.length >= 2);
}

function isRelevantProduct(searchTerm, title) {
  const searchTokens = getSearchTokens(searchTerm);
  const productTitle = normalize(title);

  if (!searchTokens.length || !productTitle) {
    return false;
  }

  const matchedTokens = searchTokens.filter((token) =>
    productTitle.includes(token)
  );

  const matchRatio = matchedTokens.length / searchTokens.length;

  return (
    matchedTokens.length >= 1 &&
    matchRatio >= 0.5
  );
}

function getProductNumbers(text = "") {
  return normalize(text)
    .match(/\b\d+[a-z]?\b/g) || [];
}

function hasConflictingModel(searchTerm, title) {
  const searchNumbers = getProductNumbers(searchTerm);
  const titleNumbers = getProductNumbers(title);

  if (!searchNumbers.length) {
    return false;
  }

  return searchNumbers.some(
    (number) =>
      !titleNumbers.includes(number)
  );
}

function cleanPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  return price;
}

async function getOnlinePrices(product) {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY is not configured.");
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
        },
        timeout: 15000
      }
    );

    const results =
      response.data.shopping_results || [];

    const offers = results
      .filter((item) => {
        if (
          !item.title ||
          !item.source ||
          !item.product_link
        ) {
          return false;
        }

        const price = cleanPrice(
          item.extracted_price
        );

        if (price === null) {
          return false;
        }

        if (!isRelevantProduct(product, item.title)) {
          return false;
        }

        if (
          hasConflictingModel(
            product,
            item.title
          )
        ) {
          return false;
        }

        return true;
      })
      .map((item) => {
        const price = cleanPrice(
          item.extracted_price
        );

        return {
          platform: item.source,
          type: item.second_hand_condition
            ? "second-hand"
            : "online",
          product: item.title,
          price,
          condition:
            item.second_hand_condition ||
            "Brand New",
          seller: item.source,
          distance: null,
          url: item.product_link,
          source: "Online Aggregator",
          rating: item.rating || null,
          reviews: item.reviews || 0,
          delivery: item.delivery || null
        };
      });

    const uniqueOffers = offers.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (other) =>
            other.platform ===
              item.platform &&
            other.price === item.price &&
            other.product === item.product
        )
    );

    return uniqueOffers.sort(
      (a, b) => a.price - b.price
    );
  } catch (error) {
    console.error(
      "Online price search error:",
      error.response?.data ||
        error.message
    );

    return [];
  }
}

module.exports = {
  getOnlinePrices
};