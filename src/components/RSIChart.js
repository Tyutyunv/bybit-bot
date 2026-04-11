import React from "react";
import { Line } from "react-chartjs-2";

const RSIChart = ({ timestamps, rsi }) => {
  const data = {
    labels: timestamps,
    datasets: [
      { label: "RSI 14", data: rsi, borderColor: "violet", tension: 0.2 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: { ticks: { color: "#aaa", maxTicksLimit: 12 }, reverse: false },
      y: {
        position: "right", // шкала справа
        ticks: { color: "#aaa" },
        min: 0,
        max: 100,
      },
    },
  };

  const lastRsi = rsi[rsi.length - 1];
  const rsiImpulse = lastRsi > 50 ? 20 : 0;
  const rsiZone = (lastRsi > 30 && lastRsi < 70) ? 10 : 0;
  const totalRsiScore = rsiImpulse + rsiZone;

  return (
    <div style={{ width: "100%", marginBottom: "60px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        RSI (14) — Поточне значення: {lastRsi?.toFixed(2)} ({totalRsiScore}/30 балів)
      </h2>

      {/* Контент: графік + опис */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap", // адаптивність
        }}
      >
        {/* Графік */}
        <div
          style={{
            flex: "2 1 500px",
            minWidth: "300px",
            height: "400px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "20px",
            flexGrow: 1,
          }}
        >
          <Line data={data} options={options} />
        </div>

        {/* Опис */}
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "280px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "20px",
            color: "#fff",
            fontSize: "13px",
            lineHeight: "1.6",
            flexGrow: 1,
          }}
        >
          <h3 style={{ marginTop: 0 }}>📊 Як ми враховуємо RSI</h3>

          <p><b>RSI (Relative Strength Index)</b> — індикатор сили імпульсу, який коливається між 0 і 100.  
          Він показує, чи ринок перекуплений або перепроданий.</p>

          <p><b>Формула для балів:</b><br />
          Якщо <code>RSI &gt; 50</code> → +20 балів.<br />
          Якщо <code>RSI між 30 і 70</code> → +10 балів.<br />
          Інакше → +0.</p>

          <p>👉 Поточний розрахунок:<br />
          Останнє значення RSI = {lastRsi?.toFixed(2)}.<br />
          Результат: {rsiImpulse}/20 + {rsiZone}/10 = {totalRsiScore}/30 балів.</p>

          <hr style={{ borderColor: "#444" }} />
          <p><b>Як інтерпретувати:</b><br />
          - RSI &gt; 70 → перекупленість (можливий розворот вниз).<br />
          - RSI &lt; 30 → перепроданість (можливий розворот вверх).<br />
          - RSI між 30 і 70 → нормальна зона, тренд стабільний.</p>
        </div>
      </div>
    </div>
  );
};

export default RSIChart;
