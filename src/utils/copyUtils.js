// src/utils/copyUtils.js

export const createDashboardTable = (symbol, liveData, signal, trendStrength, ema20, ema50, rsi, macd, timestamps, prices) => {
  const lastEma20 = ema20[ema20.length - 1] || 0;
  const lastEma50 = ema50[ema50.length - 1] || 0;
  const lastRsi = rsi[rsi.length - 1] || 0;
  const lastMacd = macd[macd.length - 1] || 0;

  return `
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
};

export const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
};

const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  document.body.removeChild(textarea);
  return success;
};