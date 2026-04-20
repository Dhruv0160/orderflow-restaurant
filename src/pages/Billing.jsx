import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { settleTableOrders } from "../services/orderService";
import { useMenu } from "../hooks/useMenu";
import { playSound } from "../utils/sounds";
import "./billing.css";

export default function Billing() {
  const navigate = useNavigate();

  // Fetch all orders that are exactly "unpaid"
  const { orders, loading: ordersLoading, error: ordersError } = useOrders({ paymentFilter: "unpaid", todayOnly: true });
  const { menuItems, loading: menuLoading } = useMenu();

  // Group orders by table number and aggregate their items
  const tableBills = useMemo(() => {
    const tablesMap = new Map();

    orders.forEach((order) => {
      const table = order.tableNumber;
      if (!tablesMap.has(table)) {
        tablesMap.set(table, {
          tableNumber: table,
          items: new Map(),
          totalAmount: 0,
          ordersList: [],
          firstOrderTime: new Date(order.createdAt)
        });
      }

      const tableData = tablesMap.get(table);
      tableData.ordersList.push(order.orderId);

      order.items?.forEach((item) => {
        // Find price from dynamic menu or fallback to 0
        const menuItem = menuItems.find((m) => m.name === item.name);
        const price = menuItem ? menuItem.price : 0;
        
        if (tableData.items.has(item.name)) {
          const existing = tableData.items.get(item.name);
          existing.qty += item.qty;
          existing.totalPrice += (price * item.qty);
        } else {
          tableData.items.set(item.name, {
            name: item.name,
            qty: item.qty,
            unitPrice: price,
            totalPrice: price * item.qty
          });
        }
        
        tableData.totalAmount += (price * item.qty);
      });
    });

    // Convert Map back to array and sort by table number
    return Array.from(tablesMap.values()).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders, menuItems]);

  const handleSettle = async (tableNumber) => {
    if (!window.confirm(`Settle bill for Table #${tableNumber}? This will clear the table.`)) return;
    
    try {
      await settleTableOrders(tableNumber);
      playSound("success");
    } catch (err) {
      console.error("Failed to settle table:", err);
      alert("Error settling table. Please try again.");
    }
  };

  if (ordersLoading || menuLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Calculating bills...</p>
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
    <div className="billing-page">
      <div className="billing-header">
        <div className="billing-header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="page-title">💳 Billing & Tables</h1>
        </div>
      </div>

      {tableBills.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🧾</span>
          <p>No open tables found.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            When waiters submit orders, the tables will appear here for checkout.
          </p>
        </div>
      ) : (
        <div className="tables-grid">
          {tableBills.map((bill, index) => {
            const timeStr = bill.firstOrderTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            
            return (
              <div key={bill.tableNumber} className="table-bill-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="bill-card-header">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="bill-table-name">Table #{bill.tableNumber}</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.85, fontWeight: 500, marginTop: "2px" }}>Seated: {timeStr}</span>
                  </div>
                  <span className="bill-status">Occupied</span>
                </div>
              
              <div className="bill-items-container">
                {Array.from(bill.items.values()).map((item, idx) => (
                  <div key={idx} className="bill-item-row">
                    <span className="bill-item-qty">{item.qty}×</span>
                    <span className="bill-item-name">{item.name}</span>
                    <span className="bill-item-price">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bill-card-footer">
                <div className="bill-total-row">
                  <span>Grand Total</span>
                  <span>₹{bill.totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  className="settle-btn"
                  onClick={() => handleSettle(bill.tableNumber)}
                >
                  ✓ Settle & Clear Table
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
