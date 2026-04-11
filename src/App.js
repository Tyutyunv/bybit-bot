import React from "react";
import "./chartsConfig";
import { useBybitData } from "./hooks/useBybitData";
import TopPanel from "./components/TopPanel";
import SignalGauge from "./components/SignalGauge";
import PriceChart from "./components/PriceChart";
import VolumeChart from "./components/VolumeChart";
import MACDChart from "./components/MACDChart";
import RSIChart from "./components/RSIChart";
import AIAnalysisButton from "./components/AIAnalysisButton";

function App() {
  const {
    symbol,
    setSymbol,
    liveData,
    trendStrength,
    prices,
    timestamps,
    volumes,
    ema20,
    ema50,
    macd,
    rsi,
    copyDashboardData,
  } = useBybitData();

  const symbols = ["BTCUSDT", "ETHUSDT"];

  // Колір ціни залежно від останньої свічки
  const lastPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
  const prevPrice = prices.length > 1 ? prices[prices.length - 2] : lastPrice;
  const priceColor = lastPrice >= prevPrice ? "#00ff88" : "#ff3333";

  return (
    <div style={{ backgroundColor: "#121212", color: "#fff", minHeight: "100vh", padding: "20px", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>📊 Аналітична панель трейдера</h1>

      {/* Селектор + ціна поруч */}
      <div style={{ textAlign: "center", marginBottom: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
        <select 
          value={symbol} 
          onChange={e => setSymbol(e.target.value)} 
          style={{ padding: "10px", fontSize: "18px", background: "#1e1e1e", color: "#fff", borderRadius: "8px" }}
        >
          {symbols.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{
          fontSize: "22px",
          fontWeight: "700",
          color: priceColor,
          textShadow: `0 0 12px ${priceColor}80`,
          transition: "color 0.4s ease, text-shadow 0.4s ease",
          animation: "pulse 1.5s infinite"
        }}>
          {isNaN(liveData.price) ? "—" : liveData.price.toFixed(2)}
        </span>
      </div>

      <TopPanel liveData={liveData} trendStrength={trendStrength} prices={prices} />

      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button 
          onClick={copyDashboardData} 
          style={{ padding: "12px 24px", fontSize: "16px", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          📋 Копіювати дані для аналізу
        </button>
      </div>

      <SignalGauge
        lastPrice={prices[prices.length - 1]}
        ema20={ema20[ema20.length - 1]}
        ema50={ema50[ema50.length - 1]}
        macdValue={macd.macdLine[macd.macdLine.length - 1]}
        rsi={rsi[rsi.length - 1]}
        volumes={volumes}
      />

      <AIAnalysisButton marketData={{
  symbol,
  lastPrice: prices[prices.length - 1],
  ema20: ema20[ema20.length - 1],
  ema50: ema50[ema50.length - 1],
  macdHist: macd.histogram[macd.histogram.length - 1],
  rsi: rsi[rsi.length - 1],
  volume: volumes[volumes.length - 1],
  avgVolume: volumes.slice(-20).reduce((a, b) => a + b, 0) / 20,
  trendStrength
}} />


      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <PriceChart timestamps={timestamps} prices={prices} ema20={ema20} ema50={ema50} />
        <VolumeChart timestamps={timestamps} volumes={volumes} />
        <MACDChart timestamps={timestamps} macd={macd} />
        <RSIChart timestamps={timestamps} rsi={rsi} />
      </div>

      <div style={{ maxWidth: "1100px", margin: "40px auto", backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "12px" }}>
        <h3>📖 Як користуватися</h3>
        <p>Натисни кнопку «Копіювати дані» → встав в будь-який ШІ — зроблю повний аналіз.</p>
      </div>

      {/* CSS-анімація для пульсації */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
