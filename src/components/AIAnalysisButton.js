// src/AIAnalysisButton.js
import React, { useState } from "react";
import axios from "axios";

const AIAnalysisButton = ({ marketData }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setComment("");
    setVisible(true);
    try {
      const res = await axios.post("/api/ai-analysis", {
        prompt: "Зроби аналіз ринку кріпто пари на основі цих даних.",
        marketData
      });
      setComment(res.data.comment);
    } catch {
      setComment("❌ Не вдалося отримати висновок.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: "20px"
    }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "14px 32px",
          borderRadius: "50px",
          background: "linear-gradient(135deg, #ff512f, #dd2476)", // красивий градієнт
          color: "#fff",
          fontWeight: "700",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          transition: "transform 0.2s ease, background 0.3s ease",
          opacity: loading ? 0.7 : 1,
          border: "none"
        }}
      >
        {loading ? "Аналізую..." : "Отримати висновок експерта"}
      </button>

      <div
        style={{
          marginTop: "20px",
          maxWidth: "700px",
          width: "90%",
          overflow: "hidden",
          transition: "max-height 0.6s ease, opacity 0.6s ease",
          maxHeight: visible ? "1000px" : "0",
          opacity: visible ? 1 : 0
        }}
      >
        <div style={{
          background: "rgba(25,25,35,0.9)",
          padding: "20px",
          borderRadius: "16px",
          color: "#ddd",
          lineHeight: "1.6",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          textAlign: "center",
          animation: visible ? "fadeIn 0.6s ease" : "none"
        }}>
          <h3 style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#ff512f",
            fontSize: "22px",
            fontWeight: "700",
            letterSpacing: "0.5px"
          }}>
            Висновок експерта
          </h3>

          {loading && (
            <div style={{ marginTop: "10px" }}>
              <div className="spinner"></div>
              <p style={{ color: "#aaa", marginTop: "10px" }}>Експерт думає...</p>
            </div>
          )}

          {comment && <p style={{ fontSize: "17px" }}>{comment}</p>}

          <button
            onClick={() => setVisible(false)}
            style={{
              marginTop: "15px",
              padding: "8px 18px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              transition: "background 0.3s ease"
            }}
          >
            ✖ Сховати висновок
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisButton;
