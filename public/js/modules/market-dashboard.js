// Market Dashboard - v12
// Live Crypto Fetcher via Binance API

export const fetchCryptoPrice = async (symbol = "BTCUSDT") => {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.warn("Market API Error:", error);
    return null;
  }
};

export const startLiveTicker = (symbols, callback) => {
  return setInterval(async () => {
    const updates = {};
    for (const symbol of symbols) {
      const price = await fetchCryptoPrice(symbol);
      if (price) updates[symbol] = price;
    }
    callback(updates);
  }, 5000);
};

export const initCryptoChart = (canvasId, symbol) => {
  // Use Chart.js to render a historical trend (placeholder)
  // ... configuration for Chart.js instance
};
