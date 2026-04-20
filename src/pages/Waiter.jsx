import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderService";
import { useMenu } from "../hooks/useMenu";
import { playSound } from "../utils/sounds";
import "./waiter.css";

const TABLE_COUNT = 15;

export default function Waiter() {
  const navigate = useNavigate();
  const { menuItems, loading } = useMenu();
  const [activeCategory, setActiveCategory] = useState("");
  const [quantities, setQuantities] = useState({});
  const [tableNumber, setTableNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const categories = useMemo(() => {
    return [...new Set(menuItems.map(m => m.category))];
  }, [menuItems]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const displayedItems = useMemo(() => {
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  const updateQty = useCallback((name, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta)
    }));
  }, []);

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = menuItems.reduce((sum, item) => sum + (item.price * (quantities[item.name] || 0)), 0);
  const selectedItems = menuItems.filter((item) => quantities[item.name] > 0);

  const handleSubmit = async () => {
    if (totalItems === 0 || !tableNumber) return;
    setSubmitting(true);
    
    try {
      const items = selectedItems.map((item) => ({
        name: item.name,
        qty: quantities[item.name]
      }));

      const result = await createOrder(items, tableNumber);
      playSound("success");
      setSuccessOrder(result);

      // Reset form after 2.5 seconds
      setTimeout(() => {
        setQuantities({});
        setTableNumber("");
        setSuccessOrder(null);
      }, 2500);
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waiter-page">
      {/* Header */}
      <div className="waiter-header-wrap">
        <div className="page-header" style={{ padding: 0, marginBottom: 0 }}>
          <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
          <h1 className="page-title">📝 Order Panel</h1>
          <div></div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="categories-nav">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div className="menu-cards-grid">
        {displayedItems.map((item, index) => {
          const qty = quantities[item.name];
          return (
            <div
              key={item.name}
              className="menu-item-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img src={item.image} alt={item.name} className="menu-item-image" loading="lazy" />
              
              <div className="menu-item-content">
                <h3 className="menu-item-name">{item.name}</h3>
                <p className="menu-item-desc">{item.description}</p>
                
                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price.toFixed(2)}</span>
                  
                  {qty === 0 ? (
                    <button className="add-btn" onClick={() => updateQty(item.name, 1)}>
                      Add
                    </button>
                  ) : (
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.name, -1)}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.name, 1)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Number Section */}
      <div className="table-section">
        <label>Select Table Number</label>
        <div className="table-number-grid">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`table-btn ${tableNumber === String(num) ? "selected" : ""}`}
              onClick={() => setTableNumber(String(num))}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="custom-table-row">
          <input
            type="number"
            className="custom-table-input"
            placeholder="Or type custom number..."
            value={tableNumber > 10 ? tableNumber : ""}
            onChange={(e) => setTableNumber(e.target.value)}
            min="1"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Fixed Order Bar */}
      <div className="order-bar">
        <div className="order-bar-content">
          {selectedItems.length > 0 && (
            <div className="order-summary">
              <span>{totalItems} item{totalItems !== 1 ? "s" : ""} selected</span>
              <span>Total: ₹{totalPrice.toFixed(2)}</span>
            </div>
          )}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={totalItems === 0 || !tableNumber || submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                Sending...
              </>
            ) : (
              <>🚀 Send to Kitchen</>
            )}
          </button>
        </div>
      </div>

      {/* Success Overlay */}
      {successOrder && (
        <div className="success-overlay">
          <div className="success-card">
            <span className="success-icon">✅</span>
            <h2>Order Sent!</h2>
            <span className="order-id">{successOrder.orderId}</span>
            <p>Sent to kitchen • Table #{tableNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
