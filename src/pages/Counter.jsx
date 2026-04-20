import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { updateOrderStatus } from "../services/orderService";
import { playSound } from "../utils/sounds";
import "./counter.css";

export default function Counter() {
  const navigate = useNavigate();

  const { orders: readyOrders, loading, error } = useOrders({
    statusFilter: ["ready"],
    todayOnly: true
  });

  // Sound notification when a new ready order appears
  useEffect(() => {
    if (readyOrders.length > 0) {
      // Play sound only when listener fires with new data
      const handler = () => playSound("orderReady");
      window.addEventListener("newOrderArrived", handler);
      return () => window.removeEventListener("newOrderArrived", handler);
    }
  }, [readyOrders.length]);

  const handleServed = async (docId) => {
    try {
      await updateOrderStatus(docId, "served");
      playSound("success");
    } catch (err) {
      console.error("Failed to mark as served:", err);
    }
  };

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading counter display...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <p className="error-text">⚠️ {error}</p>
        <p>Check your Firebase configuration</p>
      </div>
    );
  }

  return (
    <div className="counter-page">
      {/* Header */}
      <div className="counter-header">
        <div className="counter-header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="page-title">🛎️ Counter — Ready Orders</h1>
        </div>
        <div className="counter-count-display">
          <div className="ready-pulse"></div>
          <span className="ready-count-large">{readyOrders.length}</span>
          <span className="ready-count-label">
            {readyOrders.length === 1 ? "Order" : "Orders"} Ready
          </span>
        </div>
      </div>

      {/* Ready Orders Grid */}
      {readyOrders.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">☕</span>
          <p>No orders ready for serving right now.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Orders will appear here when the kitchen marks them as ready.
          </p>
        </div>
      ) : (
        <div className="ready-grid">
          {readyOrders.map((order) => (
            <div key={order.id} className="ready-card" id={`ready-${order.id}`}>
              <div className="ready-card-header">
                <span className="ready-order-id">{order.orderId}</span>
                <span className="ready-table-tag">
                  🪑 Table #{order.tableNumber}
                </span>
              </div>

              <div className="ready-items-list">
                {order.items?.map((item, i) => (
                  <div key={i} className="ready-item-row">
                    <span className="ready-item-name">{item.name}</span>
                    <span className="ready-item-qty">×{item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="ready-card-footer">
                <button
                  className="served-btn"
                  onClick={() => handleServed(order.id)}
                  id={`serve-btn-${order.id}`}
                >
                  ✅ Mark as Served
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
