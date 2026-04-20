import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const roles = [
    {
      title: "Order Panel",
      subtitle: "Waiter Mode",
      description: "Take orders quickly with touch-friendly buttons. Submit in under 5 seconds.",
      icon: "📝",
      path: "/waiter"
    },
    {
      title: "Kitchen Display",
      subtitle: "Kitchen Mode",
      description: "View incoming orders in real-time. Update status as you cook.",
      icon: "👨‍🍳",
      path: "/kitchen"
    },
    {
      title: "Counter Screen",
      subtitle: "Serving Mode",
      description: "See ready orders. Mark as served when handed to customer.",
      icon: "🛎️",
      path: "/counter"
    },
    {
      title: "Daily Summary",
      subtitle: "Manager Mode",
      description: "Track total orders, see how many are served, and review history.",
      icon: "📊",
      path: "/summary"
    },
    {
      title: "Billing & Tables",
      subtitle: "Cashier Mode",
      description: "View active tables, aggregate orders into a final bill, and settle payments.",
      icon: "💳",
      path: "/billing"
    }
  ];

  const availableRoles = currentUser?.role === "admin" 
    ? [...roles, {
        title: "Menu Editor",
        subtitle: "Admin Mode",
        description: "Add or edit menu items, prices, and upload custom photo links.",
        icon: "⚙️",
        path: "/admin/menu"
      }]
    : currentUser?.role === "kitchen"
    ? roles.filter(r => r.path === "/kitchen")
    : roles.filter(r => r.path === "/waiter"); // waiter

  return (
    <div className="home-page">
      <div className="home-brand">
        <span className="home-logo">🍽️</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>OrderFlow</h1>
          <h2 style={{ fontSize: "1rem", color: "var(--primary)", marginTop: "0", marginBottom: "10px", fontWeight: "700" }}>by Nexora AI</h2>
        </div>
        <p>Real-time restaurant order management</p>
        
        {currentUser && (
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '16px' }}>
              Logged in as: <strong>{currentUser.name}</strong>
            </span>
            <button onClick={logout} style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600
            }}>Log Out</button>
          </div>
        )}
      </div>

      <div className="role-grid">
        {availableRoles.map((role, index) => (
          <div
            key={role.path}
            className="role-card"
            onClick={() => navigate(role.path)}
            id={`role-card-${role.path.slice(1).replace('/', '-')}`}
          >
            <div className="role-icon">{role.icon}</div>
            <h2>{role.title}</h2>
            <p className="role-subtitle" style={{ 
              color: 'var(--primary-light)', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {role.subtitle}
            </p>
            <p>{role.description}</p>
            <div className="role-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="home-footer">
        <p>Protected System • {currentUser?.name || "Unauthorized"} &nbsp;|&nbsp; Powered by <strong style={{ color: 'var(--primary)' }}>Nexora AI</strong></p>
      </div>
    </div>
  );
}
