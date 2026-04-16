require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const BYBIT_BASE = "https://api.bybit.com/v5";

// === API ендпоінти Bybit ===

// Свічки (OHLCV)
app.get("/candles", async (req, res) => {
  try {
    const { symbol = "BTCUSDT", interval = "60", limit = "120" } = req.query;
    const response = await axios.get(`${BYBIT_BASE}/market/kline`, {
      params: { category: "linear", symbol: symbol.toUpperCase(), interval, limit: parseInt(limit) }
    });

    const list = response.data.result.list.map(c => ({
      time: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5])
    }));

    res.json(list);
  } catch (err) {
    console.error("Candles error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Поточна ціна + 24h дані
app.get("/price", async (req, res) => {
  try {
    const { symbol = "BTCUSDT" } = req.query;
    const response = await axios.get(`${BYBIT_BASE}/market/tickers`, {
      params: { category: "linear", symbol: symbol.toUpperCase() }
    });

    const t = response.data.result.list[0];
    res.json({
      price: parseFloat(t.lastPrice),
      high24h: parseFloat(t.highPrice24h || 0),
      low24h: parseFloat(t.lowPrice24h || 0),
      change24hPct: parseFloat(t.price24hPcnt || 0),
      volume24h: parseFloat(t.volume24h || 0)
    });
  } catch (err) {
    console.error("Price error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Funding Rate
app.get("/funding", async (req, res) => {
  try {
    const { symbol = "BTCUSDT" } = req.query;
    const response = await axios.get(`${BYBIT_BASE}/market/funding/history`, {
      params: { category: "linear", symbol: symbol.toUpperCase(), limit: 1 }
    });

    const f = response.data.result.list[0] || {};
    res.json({
      fundingRate: parseFloat(f.fundingRate || 0) * 100
    });
  } catch (err) {
    console.error("Funding error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Open Interest
app.get("/open-interest", async (req, res) => {
  try {
    const { symbol = "BTCUSDT" } = req.query;
    const response = await axios.get(`${BYBIT_BASE}/market/open-interest`, {
      params: { category: "linear", symbol: symbol.toUpperCase(), intervalTime: "1h", limit: 1 }
    });

    const list = response.data.result.list || [];
    const oi = list[0] || { openInterest: "0", timestamp: Date.now().toString() };

    res.json({
      openInterest: parseFloat(oi.openInterest || 0),
      timestamp: parseInt(oi.timestamp)
    });
  } catch (err) {
    console.error("OI error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === Новий ендпоінт для GPT аналізу ===
app.post("/api/ai-analysis", async (req, res) => {
  const { prompt, marketData } = req.body;
  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Ти фінансовий аналітик, який пише короткі коментарі по крипторинку. На основі наданих даних дай короткий висновок трейдера у форматі: [LONG / SHORT / WAIT] — [коротке пояснення, максимум 1-2 речення]." },
        { role: "user", content: `${prompt}\nДані: ${JSON.stringify(marketData)}` }
      ]
    }, {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });

    const aiComment = response.data?.choices?.[0]?.message?.content || "No response";
    res.json({ comment: aiComment });
  } catch (err) {
    console.error("Groq AI error:", err.response?.data || err.message);
    res.status(500).json({ error: "Groq AI service error" });
  }
});

// === Видача React фронту ===
app.use(express.static(path.join(__dirname, "build")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// === Запуск сервера ===
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on("error", err => {
  if (err.code === "EADDRINUSE") {
    const fallbackPort = 4000;
    app.listen(fallbackPort, () => {
      console.log(`⚠️ Port ${DEFAULT_PORT} busy, switched to http://localhost:${fallbackPort}`);
    });
  } else {
    throw err;
  }
});
