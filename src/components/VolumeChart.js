import React from "react";
import { Bar } from "react-chartjs-2";

const VolumeChart = ({ timestamps, volumes, prices }) => {
  const data = {
    labels: timestamps,
    datasets: [
      { label: "Об’єм", data: volumes, backgroundColor: "rgba(0, 255, 100, 0.5)" },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.08)" },
        reverse: false,
      },
      y: {
        position: "right", // шкала справа
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const lastVolume = volumes?.[volumes.length - 1] || 0;
  const prevVolume = volumes?.[volumes.length - 2] || 0;
  const lastPrice = prices?.[prices.length - 1] || 0;
  const prevPrice = prices?.[prices.length - 2] || 0;

  const volumeScore = (lastVolume > prevVolume && lastPrice > prevPrice) ? 15 : 0;

  return (
    <div style={{ width: "100%", marginBottom: "60px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Об’єм торгів — Поточне значення: {lastVolume} ({volumeScore}/15 балів)
      </h2>

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
          <Bar data={data} options={options} />
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
          <h3 style={{ marginTop: 0 }}>📊 Як ми враховуємо об’єм</h3>

          <p><b>Об’єм торгів</b> — кількість активів, які були куплені або продані за свічку.  
          Він показує силу грошового потоку.</p>

          <p><b>Формула для балів:</b><br />
          Якщо <code>lastVolume &gt; prevVolume</code> і <code>lastPrice &gt; prevPrice</code> → +15 балів.<br />
          Інакше → +0.</p>

          <p>👉 Поточний розрахунок:<br />
          Останній об’єм = {lastVolume}, попередній = {prevVolume}.<br />
          Остання ціна = {lastPrice}, попередня = {prevPrice}.<br />
          Результат: {volumeScore}/15 балів.</p>
        </div>
      </div>
    </div>
  );
};

export default VolumeChart;
