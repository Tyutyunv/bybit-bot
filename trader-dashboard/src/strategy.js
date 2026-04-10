// src/strategy.js

const MIN_TREND_STRENGTH = 45;
const PULLBACK_RSI_LOW = 42;
const PULLBACK_RSI_HIGH = 57;
const BREAKOUT_VOLUME_MULTIPLIER = 1.75;

const calculateEMASlope = (emaArray, periods = 3) => {
  if (!emaArray || emaArray.length < periods) return 0;
  return emaArray[emaArray.length - 1] - emaArray[emaArray.length - periods];
};

const calculateTrendStrength = (prices, ema20, ema50, macdLine, rsi, volumes) => {
  let strength = 0;

  const last = prices.length - 1;

  if (ema20[last] > ema50[last]) strength += 30;
  if (macdLine[last] > 0) strength += 25;
  if (rsi[last] > 50) strength += 20;

  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  if (volumes[last] > avgVolume) strength += 15;

  if (rsi[last] > 30 && rsi[last] < 70) strength += 10;

  return strength;
};

export const getTradeSignal = (data) => {
  const {
    prices,
    ema20,
    ema50,
    macdLine,
    rsi,
    volumes
  } = data;

  if (!prices || prices.length < 30) {
    return { action: "WAIT", reason: "Недостатньо даних", strength: 0 };
  }

  const last = prices.length - 1;

  const currentPrice = prices[last];
  const lastEma20 = ema20[last];
  const lastEma50 = ema50[last];
  const lastMacd = macdLine[last];
  const lastRsi = rsi[last];
  const lastVolume = volumes[last];

  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const emaSlope = calculateEMASlope(ema20, 4);
  const strength = calculateTrendStrength(prices, ema20, ema50, macdLine, rsi, volumes);

  // === NO TRADE ===
  if (strength < MIN_TREND_STRENGTH) {
    return { action: "WAIT", reason: "Слабкий тренд", strength };
  }

  if (Math.abs(emaSlope) < 5) {
    return { action: "WAIT", reason: "Флет", strength };
  }

  if (lastRsi > 72 || lastRsi < 28) {
    return { action: "WAIT", reason: "RSI екстремум", strength };
  }

  // === TREND ===
  const isBull = lastEma20 > lastEma50 && emaSlope > 0;
  const isBear = lastEma20 < lastEma50 && emaSlope < 0;

  // === PULLBACK LONG ===
  if (isBull) {
    const inZone = currentPrice <= lastEma20 && currentPrice > lastEma50 * 0.985;

    if (inZone &&
        lastRsi >= PULLBACK_RSI_LOW &&
        lastRsi <= PULLBACK_RSI_HIGH &&
        lastMacd > -20 &&
        lastVolume > avgVolume * 0.9) {

      return {
        action: "LONG",
        reason: "Trend Pullback",
        strength,
        sl: lastEma50 * 0.985,
        tp: currentPrice * 1.025
      };
    }
  }

  // === PULLBACK SHORT ===
  if (isBear) {
    const inZone = currentPrice >= lastEma20 && currentPrice < lastEma50 * 1.015;

    if (inZone &&
        lastRsi >= PULLBACK_RSI_LOW &&
        lastRsi <= PULLBACK_RSI_HIGH &&
        lastMacd < 20 &&
        lastVolume > avgVolume * 0.9) {

      return {
        action: "SHORT",
        reason: "Trend Pullback",
        strength,
        sl: lastEma50 * 1.015,
        tp: currentPrice * 0.975
      };
    }
  }

  // === BREAKOUT ===
  const high = Math.max(...prices.slice(-20));
  const low = Math.min(...prices.slice(-20));

  if (currentPrice > high && lastVolume > avgVolume * BREAKOUT_VOLUME_MULTIPLIER) {
    return {
      action: "LONG",
      reason: "Breakout",
      strength: 80,
      sl: high * 0.985,
      tp: currentPrice * 1.03
    };
  }

  if (currentPrice < low && lastVolume > avgVolume * BREAKOUT_VOLUME_MULTIPLIER) {
    return {
      action: "SHORT",
      reason: "Breakout",
      strength: 80,
      sl: low * 1.015,
      tp: currentPrice * 0.97
    };
  }

  return { action: "WAIT", reason: "Нема сигналу", strength };
};

export default getTradeSignal;
