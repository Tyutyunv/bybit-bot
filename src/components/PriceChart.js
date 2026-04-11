import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";

const PriceChart = ({ timestamps, prices, ema20, ema50 }) => {
  const chartRef = useRef(null);

  const data = {
    labels: timestamps,
    datasets: [
      { label: "Ціна", data: prices, borderColor: "cyan", tension: 0.2 },
      { label: "EMA20", data: ema20, borderColor: "orange", tension: 0.2 },
      { label: "EMA50", data: ema50, borderColor: "red", tension: 0.2 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: "easeOutQuart" },
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: {
        ticks: { color: "#aaa", maxTicksLimit: 12 },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        position: "right",
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const lastPrice = prices[prices.length - 1];
  const lastEma20 = ema20[ema20.length - 1];
  const lastEma50 = ema50[ema50.length - 1];
  const trendRatio = lastEma20 / lastEma50;
  const trendPoints = lastPrice > lastEma20 && lastEma20 > lastEma50 ? 30 : 0;

  // Правильний cleanup: копіюємо ref у змінну
  useEffect(() => {
    const chartInstance = chartRef.current;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", marginBottom: "60px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Ціна + EMA — Тренд: {trendRatio?.toFixed(3)} ({trendPoints}/30 балів)
      </h2>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
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
          <Line ref={chartRef} data={data} options={options} />
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
          <h3 style={{ marginTop: 0 }}>📊 Як ми рахуємо бали</h3>

          <p><b>EMA20</b> — показує короткостроковий тренд.</p>
          <p>👉 Поточний розрахунок: {lastPrice?.toFixed(2)} × {(2/21).toFixed(3)} + попереднє EMA = {lastEma20?.toFixed(2)}</p>

          <p><b>EMA50</b> — показує довгостроковий тренд.</p>
          <p>👉 Поточний розрахунок: {lastPrice?.toFixed(2)} × {(2/51).toFixed(3)} + попереднє EMA = {lastEma50?.toFixed(2)}</p>

          <p><b>Тренд (EMA20 / EMA50)</b> — співвідношення короткого і довгого тренду.<br />
          👉 Поточне значення: {lastEma20?.toFixed(2)} / {lastEma50?.toFixed(2)} = {trendRatio?.toFixed(3)}</p>

          <hr style={{ borderColor: "#444" }} />
          <p><b>Бали по тренду:</b><br />
          Якщо Price &gt; EMA20 і EMA20 &gt; EMA50 → +30 балів.<br />
          Інакше → +0 балів.<br />
          <b>Зараз:</b> {trendPoints}/30</p>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
