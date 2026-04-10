import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { calculateEMA, calculateMACD, calculateRSI } from "../utils/indicators";
import { calculateTrendStrength } from "../utils/strengthCalculator";

export const useBybitData = () => {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [prices, setPrices] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [ema20, setEma20] = useState([]);
  const [ema50, setEma50] = useState([]);
  const [macd, setMacd] = useState({ macdLine: [], signalLine: [], histogram: [] });
  const [rsi, setRsi] = useState([]);
  const [signal, setSignal] = useState("⚪ Нейтрально");
  const [trendStrength, setTrendStrength] = useState(50);
  const [liveData, setLiveData] = useState({
    price: 0,
    high24h: 0,
    low24h: 0,
    change24hPct: 0,
    volume24h: 0,
    fundingRate: 0,
    openInterest: 0
  });

  const wsRef = useRef(null);

  // Копіювання даних
  const copyDashboardData = useCallback(() => {
    const lastEma20 = ema20[ema20.length - 1] || 0;
    const lastEma50 = ema50[ema50.length - 1] || 0;
    const lastRsi = rsi[rsi.length - 1] || 0;
    const lastMacd = macd.macdLine[macd.macdLine.length - 1] || 0;

    const table = `
**📊 Дашборд ${symbol} — ${new Date().toLocaleString("uk-UA")}**

**Жива ціна:** ${liveData.price.toFixed(2)}
**24h Change:** ${liveData.change24hPct.toFixed(2)}%
**24h High/Low:** ${liveData.high24h.toFixed(2)} / ${liveData.low24h.toFixed(2)}
**Volume 24h:** ${liveData.volume24h.toLocaleString("uk-UA")}
**Funding Rate:** ${liveData.fundingRate.toFixed(4)}%
**Open Interest:** ${liveData.openInterest.toLocaleString("uk-UA")}
**Сигнал:** ${signal}
**Сила тренду:** ${trendStrength}/100

**Індикатори:**
EMA20: ${lastEma20.toFixed(2)} | EMA50: ${lastEma50.toFixed(2)}
RSI: ${lastRsi.toFixed(2)} | MACD: ${lastMacd.toFixed(4)}

**Останні 8 свічок (зліва старіше → справа новіше):**
${timestamps.slice(-8).map((t, i) => {
      const idx = prices.length - 8 + i;
      return `${t} → ${prices[idx]?.toFixed(2)}`;
    }).join("\n")}
    `.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(table).then(() => {
        alert("✅ Дані скопійовано! Вставте їх в будь який ШІ");
      }).catch(() => fallbackCopy(table));
    } else {
      fallbackCopy(table);
    }
  }, [symbol, liveData, signal, trendStrength, ema20, ema50, rsi, macd, timestamps, prices]);

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("✅ Дані скопійовано (старий метод)!");
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [candlesRes, priceRes, fundingRes, oiRes] = await Promise.all([
        axios.get(`/candles?symbol=${symbol}&interval=60&limit=120`),
        axios.get(`/price?symbol=${symbol}`),
        axios.get(`/funding?symbol=${symbol}`),
        axios.get(`/open-interest?symbol=${symbol}`)
      ]);

      const raw = candlesRes.data;
      const closes = raw.map(c => c.close).reverse();
      const times = raw.map(c => {
        const d = new Date(c.time);
        return d.toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      }).reverse();
      const vols = raw.map(c => c.volume).reverse();

      setPrices(closes);
      setTimestamps(times);
      setVolumes(vols);

      const ema20Calc = calculateEMA(closes, 20);
      const ema50Calc = calculateEMA(closes, 50);
      const macdCalc = calculateMACD(closes);
      const rsiCalc = calculateRSI(closes, 14);

      setEma20(ema20Calc);
      setEma50(ema50Calc);
      setMacd(macdCalc);
      setRsi(rsiCalc);

      setLiveData({
        ...priceRes.data,
        fundingRate: fundingRes.data.fundingRate || 0,
        openInterest: oiRes.data.openInterest || 0
      });

      // Єдина формула сили тренду
      const strength = calculateTrendStrength(closes, ema20Calc, ema50Calc, macdCalc.macdLine, rsiCalc, vols);
      setTrendStrength(strength);

      // Логіка сигналу
      const lastPriceVal = closes[closes.length - 1] || 0;
      const lastEma20Val = ema20Calc[ema20Calc.length - 1] || 0;
      const lastEma50Val = ema50Calc[ema50Calc.length - 1] || 0;
      const lastMacdVal = macdCalc.macdLine[macdCalc.macdLine.length - 1] || 0;
      const lastRsiVal = rsiCalc[rsiCalc.length - 1] || 0;

      if (lastPriceVal > lastEma20Val && lastEma20Val > lastEma50Val && lastMacdVal > 0 && lastRsiVal < 70) {
        setSignal("🟢 STRONG LONG (купувати)");
      } else if (lastPriceVal < lastEma20Val && lastEma20Val < lastEma50Val && lastMacdVal < 0 && lastRsiVal > 30) {
        setSignal("🔴 STRONG SHORT (продавати)");
      } else if (lastPriceVal > lastEma20Val && lastEma20Val > lastEma50Val) {
        setSignal("🟡 LONG (слабкий)");
      } else if (lastPriceVal < lastEma20Val && lastEma20Val < lastEma50Val) {
        setSignal("🟠 SHORT (слабкий)");
      } else {
        setSignal("⚪ Нейтрально");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [symbol]);

  // WebSocket
  useEffect(() => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ op: "subscribe", args: [`tickers.${symbol}`] }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.topic?.startsWith("tickers.") && msg.data?.lastPrice) {
        const p = parseFloat(msg.data.lastPrice);
        if (!isNaN(p)) setLiveData(prev => ({ ...prev, price: p }));
      }
    };

    return () => ws.close();
  }, [symbol]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    symbol,
    setSymbol,
    liveData,
    trendStrength,
    signal,
    prices,
    timestamps,
    volumes,
    ema20,
    ema50,
    macd,
    rsi,
    copyDashboardData,
  };
};