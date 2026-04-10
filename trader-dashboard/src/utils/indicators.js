export const calculateEMA = (prices, period) => {
  const k = 2 / (period + 1);
  let ema = prices[0];
  const result = [ema];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
};

export const calculateMACD = (prices, fast = 12, slow = 26, signalPeriod = 9) => {
  const emaFast = calculateEMA(prices, fast);
  const emaSlow = calculateEMA(prices, slow);
  const macdLine = emaFast.map((f, i) => (i >= slow - 1 ? f - emaSlow[i] : null));
  const validMacd = macdLine.filter(v => v !== null);
  const signalLineFull = calculateEMA(validMacd, signalPeriod);
  const signalLine = new Array(macdLine.length - signalLineFull.length).fill(null).concat(signalLineFull);
  const histogram = macdLine.map((m, i) => (m !== null && signalLine[i] !== null ? m - signalLine[i] : null));
  return { macdLine, signalLine, histogram };
};

export const calculateRSI = (prices, period = 14) => {
  const rsi = new Array(prices.length).fill(null);
  if (prices.length < period + 1) return rsi;

  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  let rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  }
  return rsi;
};