import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useMenu } from "../hooks/useMenu";
import "./summary.css";

export default function Summary() {
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [timeRange, setTimeRange] = useState("day");
  const [customDate, setCustomDate] = useState("");

  const { orders, loading: ordersLoading, error: ordersError } = useOrders({
    timeRange: timeRange,
    customDate: customDate
    // no status filter = fetch all statuses including served
  });

  const { menuItems, loading: menuLoading } = useMenu();

  const stats = useMemo(() => {
    let rawRevenue = 0;
    
    orders.forEach((o) => {
      // Only attribute revenue to correctly paid or successfully served items
      if (o.paymentStatus === "paid" || o.status === "served") {
        o.items?.forEach((i) => {
          const menuItem = menuItems.find((m) => m.name === i.name);
          if (menuItem) {
            rawRevenue += menuItem.price * i.qty;
          }
        });
      }
    });

    return {
      total: orders.length,
      served: orders.filter((o) => o.status === "served").length,
      preparing: orders.filter((o) => o.status === "preparing" || o.status === "ready").length,
      new: orders.filter((o) => o.status === "new").length,
      revenue: rawRevenue
    };
  }, [orders, menuItems]);

  const toggleRow = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (ordersLoading || menuLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading summary data...</p>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="state-container">
        <p className="error-text">⚠️ {ordersError}</p>
      </div>
    );
  }

  return (
    <div className="summary-page">
      {/* Header */}
      <div className="summary-header">
        <div className="summary-header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="page-title">
            📊 {timeRange === "day" ? "Daily" : timeRange === "month" ? "Monthly" : "Custom Date"} Summary
          </h1>
        </div>
        <div className="summary-tabs">
          <button 
            className={`summary-tab-btn ${timeRange === "day" ? "active" : ""}`}
            onClick={() => { setTimeRange("day"); setCustomDate(""); }}
          >
            Today
          </button>
          <button 
            className={`summary-tab-btn ${timeRange === "month" ? "active" : ""}`}
            onClick={() => { setTimeRange("month"); setCustomDate(""); }}
          >
            This Month
          </button>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "4px" }}>
            <input 
              type="date" 
              className={`summary-tab-btn ${timeRange === "custom" ? "active" : ""}`}
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setTimeRange("custom");
                else setTimeRange("day");
              }}
              style={{ padding: "6px 12px", border: "1px solid var(--border-color)" }}
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card stat-revenue">
          <span className="stat-value">₹{stats.revenue.toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card stat-total">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Received</span>
        </div>
        <div className="stat-card stat-served">
          <span className="stat-value">{stats.served}</span>
          <span className="stat-label">Successfully Served</span>
        </div>
        <div className="stat-card stat-preparing">
          <span className="stat-value">{stats.preparing}</span>
          <span className="stat-label">In Progress / Ready</span>
        </div>
        <div className="stat-card stat-new">
          <span className="stat-value">{stats.new}</span>
          <span className="stat-label">Pending (New)</span>
        </div>
      </div>

      {/* History Log */}
      <div className="history-section">
        <h2 className="history-title">
          {timeRange === "day" ? "Today's" : timeRange === "month" ? "This Month's" : "Selected Date's"} History Log
        </h2>
        {orders.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No orders have been placed today.</p>
        ) : (
          <div className="history-list">
            {[...orders].reverse().map((order) => {
              const dateObj = new Date(order.createdAt);
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = dateObj.toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric'
              });
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className={`history-row-container ${isExpanded ? 'expanded' : ''}`}>
                  <div className="history-row" onClick={() => toggleRow(order.id)}>
                    <div className="history-row-main">
                      <span className="history-toggle-icon">{isExpanded ? "▾" : "▸"}</span>
                      <span className="history-id">{order.orderId}</span>
                      <span className="history-time">{timeStr}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                        Table #{order.tableNumber}
                      </span>
                      <span className={`badge badge-${order.status === "served" ? "ready" : order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="history-details">
                      <div className="history-details-meta">
                        <div>
                          <strong>Date:</strong> {dateStr}
                        </div>
                        <div>
                          <strong>Time:</strong> {timeStr}
                        </div>
                        <div>
                          <strong>Table:</strong> {order.tableNumber}
                        </div>
                      </div>
                      
                      <div className="history-details-items">
                        <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>Order List:</strong>
                        <ul className="items-list-bullet">
                          {order.items?.map((i, idx) => (
                            <li key={idx} className="item-bullet-point">
                              <span className="item-bullet-qty">{i.qty}×</span> {i.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
