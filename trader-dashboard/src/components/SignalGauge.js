import React from "react";
import ReactECharts from "echarts-for-react";

const SignalGauge = ({ lastPrice, ema20, ema50, macdValue, rsi, volumes, prices }) => {
  // === Розрахунок балів ===
  const emaScore = (ema20 > ema50) ? 30 : 0;
  const macdScore = macdValue > 0 ? 25 : 0;
  const rsiImpulse = rsi > 50 ? 20 : 0;
  const rsiZone = (rsi > 30 && rsi < 70) ? 10 : 0;

  const lastVolume = volumes?.[volumes.length - 1] || 0;
  const avgVolume = volumes?.slice(-20).reduce((a, b) => a + b, 0) / 20 || 0;
  const volumeScore = lastVolume > avgVolume ? 15 : 0;

  const totalStrength = emaScore + macdScore + rsiImpulse + rsiZone + volumeScore;
  const value = Math.max(0, Math.min(100, totalStrength));

  // === Логіка сигналу ===
  let statusText = "WAIT";
  let statusColor = "#aaaaaa";
  let explanation = "Сигнал нейтральний: сила тренду ще недостатня для входу.";

  if (value >= 60 && ema20 > ema50) {
    statusText = "LONG";
    statusColor = "#00ff66";
    explanation = `
      Зараз сигнал на ЛОНГ:
      • EMA20 вище EMA50 → тренд вгору.
      • MACD > 0 → моментум позитивний.
      • RSI > 50 → імпульс сильний.
      • Об’єм вище середнього → ринок підтверджує рух.
      Це означає, що покупці контролюють ринок, і є висока ймовірність продовження росту.
    `;
  } else if (value >= 60 && ema20 < ema50) {
    statusText = "SHORT";
    statusColor = "#ff3333";
    explanation = `
      Зараз сигнал на ШОРТ:
      • EMA20 нижче EMA50 → тренд вниз.
      • MACD < 0 → моментум негативний.
      • RSI < 50 → імпульс слабкий.
      • Об’єм вище середнього → продавці підтверджують падіння.
      Це означає, що ринок під тиском, і є висока ймовірність продовження зниження.
    `;
  }

  // === Спідометр ===
  const option = {
    backgroundColor: "#121212",
    series: [
      {
        type: "gauge",
        startAngle: 225,
        endAngle: -45,
        radius: "80%",
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.4, "#ff3333"],   // SHORT зона
              [0.6, "#aaaaaa"],   // WAIT зона
              [1, "#00ff66"],     // LONG зона
            ],
          },
        },
        pointer: {
          length: "75%",
          width: 6,
          itemStyle: { color: statusColor, shadowBlur: 30, shadowColor: statusColor },
        },
        detail: {
          valueAnimation: true,
          formatter: "{value}",
          offsetCenter: [0, "32%"],
          fontSize: 52,
          fontWeight: "900",
          color: statusColor,
          textShadow: `0 0 20px ${statusColor}`,
        },
        data: [{ value }],
      },
    ],
  };

  return (
    <div style={{ marginBottom: "50px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#ddd" }}>Технічний сигнал</h2>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>

        {/* ЛІВА ПАНЕЛЬ — РОЗРАХУНОК */}
        <div style={{
          background: "rgba(30, 30, 30, 0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "20px",
          width: "280px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}>
          <h3 style={{ marginTop: 0, color: "#ddd", fontSize: "17px", textAlign: "center" }}>
            З чого складається сила тренду
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "6px",
            fontSize: "14.5px",
            lineHeight: "1.8"
          }}>
            <span style={{ color: "#fff" }}>EMA20 / EMA50 (тренд)</span>
            <span style={{ color: emaScore > 0 ? "#00ff88" : "#ff6666" }}>+{emaScore}</span>
            <span>/30</span>

            <span style={{ color: "#fff" }}>MACD (моментум)</span>
            <span style={{ color: macdScore > 0 ? "#00ff88" : "#ff6666" }}>+{macdScore}</span>
            <span>/25</span>

            <span style={{ color: "#fff" }}>RSI &gt; 50 (імпульс)</span>
            <span style={{ color: rsiImpulse > 0 ? "#00ff88" : "#ff6666" }}>+{rsiImpulse}</span>
            <span>/20</span>

            <span style={{ color: "#fff" }}>RSI в нормальній зоні</span>
            <span style={{ color: "#00ff88" }}>+{rsiZone}</span>
            <span>/10</span>

            <span style={{ color: "#fff" }}>Об’єм (Volume)</span>
            <span style={{ color: volumeScore > 0 ? "#00ff88" : "#ff6666" }}>+{volumeScore}</span>
            <span>/15</span>
          </div>

          <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
            Загальна сила: <span style={{ color: statusColor }}>{value}/100</span>
          </div>
        </div>

        {/* ЦЕНТР — СПІДОМЕТР */}
        <div style={{ width: "360px" }}>
          <ReactECharts option={option} style={{ height: "290px", width: "100%" }} />
          <div style={{ fontSize: "27px", fontWeight: "800", color: statusColor, marginTop: "5px", marginBottom: "12px" }}>
            {statusText}
          </div>
        </div>

        {/* ПРАВА ПАНЕЛЬ — ПОЯСНЕННЯ */}
        <div style={{
          background: "rgba(30, 30, 30, 0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "20px",
          width: "320px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          lineHeight: "1.6",
          fontSize: "15px",
          whiteSpace: "pre-line"
        }}>
          <h3 style={{ marginTop: 0, color: "#ddd", fontSize: "17px" }}>Що це означає?</h3>
          <p style={{ margin: 0 }}>{explanation}</p>
        </div>

      </div>
    </div>
  );
};

export default SignalGauge;
