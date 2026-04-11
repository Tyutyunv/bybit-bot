import React from "react";

const TopPanel = ({ liveData, trendStrength }) => {
  return (
    <div style={{
      background: "rgba(30, 30, 30, 0.75)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "16px",
      padding: "18px 24px",
      display: "flex",
      flexWrap: "wrap",
      gap: "24px",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      marginBottom: "25px",
      fontSize: "15.5px"
    }}>
      <div><b>24h High:</b> {liveData.high24h?.toFixed(2) ?? "—"}</div>
      <div><b>24h Low:</b> {liveData.low24h?.toFixed(2) ?? "—"}</div>
      <div style={{ color: liveData.change24hPct >= 0 ? "lime" : "red" }}>
        <b>24h Change:</b> {liveData.change24hPct?.toFixed(2) ?? "—"}%
      </div>
      <div><b>Volume 24h:</b> {liveData.volume24h?.toLocaleString("uk-UA") ?? "—"}</div>
      <div><b>Funding:</b> <span style={{ color: liveData.fundingRate >= 0 ? "lime" : "red" }}>{liveData.fundingRate?.toFixed(4) ?? "—"}%</span></div>
      <div><b>OI:</b> {liveData.openInterest?.toLocaleString("uk-UA") ?? "—"}</div>

      {/* Показник сили тренду */}
      <div style={{
        flexBasis: "100%",
        marginTop: "10px",
        textAlign: "center",
        fontWeight: "700",
        fontSize: "18px",
        color: "#00ff88",
        textShadow: "0 0 10px #00ff8840"
      }}>
        ⚡ Сила тренду: {trendStrength}/100
      </div>
    </div>
  );
};

export default TopPanel;
