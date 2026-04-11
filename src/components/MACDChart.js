import React from "react";
import { Line } from "react-chartjs-2";

const MACDChart = ({ timestamps, macd }) => {
  const data = {
    labels: timestamps,
    datasets: [
      { label: "MACD", data: macd.macdLine, borderColor: "lime", tension: 0.2 },
      { label: "Signal", data: macd.signalLine, borderColor: "yellow", tension: 0.2 },
      {
        label: "Histogram",
        data: macd.histogram,
        type: "bar",
        backgroundColor: (ctx) => (ctx.raw > 0 ? "lime" : "red"),
      },
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
      },
    },
  };

  const lastMacdVal = macd.macdLine[macd.macdLine.length - 1];
  const macdScore = lastMacdVal > 0 ? 25 : 0;

  return (
    <div style={{ width: "100%", marginBottom: "60px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        MACD — Поточне значення: {lastMacdVal?.toFixed(3)} ({macdScore}/25 балів)
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
          <h3 style={{ marginTop: 0 }}>📊 Як ми враховуємо MACD</h3>

          <p><b>MACD (Moving Average Convergence Divergence)</b> — індикатор моментуму, який показує різницю між EMA12 та EMA26.</p>

          <p><b>Формула для балів:</b><br />
          Якщо <code>MACD &gt; 0</code> → +25 балів.<br />
          Інакше → +0.</p>

          <p>👉 Поточний розрахунок:<br />
          Останнє значення MACD = {lastMacdVal?.toFixed(3)}.<br />
          Результат: {macdScore}/25 балів.</p>

          <hr style={{ borderColor: "#444" }} />
          <p><b>Як інтерпретувати:</b><br />
          - MACD перетинає Signal знизу вверх → сигнал на покупку.<br />
          - MACD перетинає Signal зверху вниз → сигнал на продаж.<br />
          - Зростаюча гістограма → сильний імпульс.</p>
        </div>
      </div>
    </div>
  );
};

export default MACDChart;
