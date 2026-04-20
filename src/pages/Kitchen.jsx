import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { updateOrderStatus } from "../services/orderService";
import { setupNewOrderSound } from "../utils/sounds";
import "./kitchen.css";

function ElapsedTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${String(secs).padStart(2, "0")}`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const diffSec = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const isUrgent = diffSec > 300; // > 5 minutes

  return (
    <span className={`order-timer ${isUrgent ? "urgent" : "normal"}`}>
      <span className="timer-icon">⏱️</span>
      {elapsed}
    </span>
  );
}

const STATUS_FLOW = {
  new: { next: "preparing", label: "Start Preparing", icon: "🔥", btnClass: "btn-new" },
  preparing: { next: "ready", label: "Mark Ready", icon: "✅", btnClass: "btn-preparing" },
  ready: { next: null, label: "Ready to Serve", icon: "🛎️", btnClass: "btn-ready" }
};

const FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "new", label: "🔴 New" },
  { key: "preparing", label: "🟡 Preparing" },
  { key: "ready", label: "🟢 Ready" }
];

export default function Kitchen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  // Force dark mode on kitchen screen
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    const cleanup = setupNewOrderSound();
    return () => {
      document.documentElement.removeAttribute("data-theme");
      cleanup();
    };
  }, []);

  const { orders, loading, error } = useOrders({
    statusFilter: ["new", "preparing", "ready"],
    todayOnly: true
  });

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const stats = useMemo(() => ({
    new: orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length
  }), [orders]);

  const handleStatusChange = async (docId, currentStatus) => {
    const flow = STATUS_FLOW[currentStatus];
    if (!flow?.next) return;
    try {
      await updateOrderStatus(docId, flow.next);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading kitchen display...</p>
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
    <div className="kitchen-page">
      {/* Header */}
      <div className="kitchen-header">
        <div className="kitchen-header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="page-title">👨‍🍳 Kitchen Display</h1>
        </div>
        <div className="kitchen-stats">
          <span className="stat-pill">
            <span className="dot new"></span> {stats.new} New
          </span>
          <span className="stat-pill">
            <span className="dot preparing"></span> {stats.preparing} Cooking
          </span>
          <span className="stat-pill">
            <span className="dot ready"></span> {stats.ready} Ready
          </span>
          <span className="summary-badge">
            Today <span className="count">{orders.length}</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🧘</span>
          <p>
            {filter === "all"
              ? "No orders yet. Relax!"
              : `No ${filter} orders right now.`}
          </p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const flow = STATUS_FLOW[order.status];
            return (
              <div
                key={order.id}
                className={`order-card status-${order.status}`}
                id={`order-${order.id}`}
              >
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-id">{order.orderId}</span>
                    <span className={`badge badge-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <ElapsedTimer createdAt={order.createdAt} />
                </div>

                <div className="order-items-list">
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">×{item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-header" style={{ paddingTop: 0 }}>
                  <span className="table-tag">🪑 Table #{order.tableNumber}</span>
                </div>

                {flow?.next && (
                  <div className="order-card-footer">
                    <button
                      className={`status-btn ${flow.btnClass}`}
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      {flow.icon} {flow.label}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
