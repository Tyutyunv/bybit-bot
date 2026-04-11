export const calculateTrendStrength = (
  prices,
  ema20,
  ema50,
  macdLine,
  rsi,
  volumes
) => {
  if (!prices || prices.length === 0) return 0;

  const lastEma20 = ema20?.[ema20.length - 1] || 0;
  const lastEma50 = ema50?.[ema50.length - 1] || 0;
  const lastMacd = macdLine?.[macdLine.length - 1] || 0;
  const lastRsi = rsi?.[rsi.length - 1] || 0;

  const lastVolume = volumes?.[volumes.length - 1] || 0;
  const avgVolume =
    volumes && volumes.length >= 20
      ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
      : 0;

  let strength = 0;

  if (lastEma20 > lastEma50) strength += 30;        // EMA тренд
  if (lastMacd > 0) strength += 25;                 // MACD
  if (lastRsi > 50) strength += 20;                 // RSI імпульс
  if (lastRsi > 30 && lastRsi < 70) strength += 10; // RSI зона
  if (lastVolume > avgVolume) strength += 15;       // Об’єм

  return Math.min(100, Math.max(0, strength));
};