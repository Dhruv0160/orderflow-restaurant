import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login.css";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePadClick = (number) => {
    if (pin.length < 4) {
      setPin((prev) => prev + number);
      setError(false);
    }
  };

  // Physical keyboard + numpad support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Digit row (Digit0–Digit9) and numpad (Numpad0–Numpad9)
      if (/^(Digit|Numpad)\d$/.test(e.code)) {
        const num = e.code.slice(-1); // last character is the digit
        handlePadClick(num);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, error]);

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;

    const success = login(pin);
    if (!success) {
      setError(true);
      setPin("");
    } else {
      navigate("/");
    }
  };

  // Auto-submit when length reaches 4
  if (pin.length === 4 && !error) {
    handleSubmit();
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-logo">🍔 OrderFlow</h1>
        <h2 style={{ fontSize: "1.1rem", color: "var(--primary)", marginTop: "-10px", marginBottom: "15px", fontWeight: "700" }}>by Nexora AI</h2>
        <p className="login-subtitle">Enter your access PIN</p>

        <div className={`pin-display ${error ? "error" : ""}`}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className={`pin-dot ${pin[i] ? "filled" : ""}`}>
              {pin[i] ? "•" : ""}
            </span>
          ))}
        </div>
        {error && <p className="error-text">Invalid PIN, try again.</p>}

        <div className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handlePadClick(num.toString())} className="num-btn">
              {num}
            </button>
          ))}
          <button className="num-btn invisible"></button>
          <button onClick={() => handlePadClick("0")} className="num-btn">0</button>
          <button onClick={handleDelete} className="num-btn action">⌫</button>
        </div>

        <div className="demo-hint">
          <p>Admin: <strong>0000</strong></p>
          <p>Waiters: <strong>1111</strong>, <strong>2222</strong>, <strong>3333</strong></p>
          <p>Chef (Kitchen): <strong>4444</strong></p>
        </div>

        <p className="powered-by">Powered by <strong>Nexora AI</strong></p>
      </div>
    </div>
  );
}
