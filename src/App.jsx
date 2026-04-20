import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Waiter from "./pages/Waiter";
import Kitchen from "./pages/Kitchen";
import Counter from "./pages/Counter";
import Summary from "./pages/Summary";
import Billing from "./pages/Billing";
import AdminMenu from "./pages/AdminMenu";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Home Dashboard */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Available to Waiters & Admins */}
        <Route path="/waiter" element={<ProtectedRoute><Waiter /></ProtectedRoute>} />
        
        {/* Kitchen: accessible by kitchen role & admin */}
        <Route path="/kitchen" element={<ProtectedRoute reqRole="kitchen"><Kitchen /></ProtectedRoute>} />
        <Route path="/counter" element={<ProtectedRoute reqRole="admin"><Counter /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute reqRole="admin"><Summary /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute reqRole="admin"><Billing /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute reqRole="admin"><AdminMenu /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
