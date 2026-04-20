import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './home.css';

const Home = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogout = async () => {
          try {
                  await logout();
                  navigate('/login');
          } catch (err) {
                  setError('Failed to log out');
          }
    };

    return (
          <div className="home-container">
                <div className="home-header">
                        <h1>OrderFlow Dashboard</h1>h1>
                        <div className="user-info">
                                  <span>{currentUser?.email}</span>span>
                                  <button onClick={handleLogout} className="logout-btn">Logout</button>button>
                        </div>div>
                </div>div>
                
            {error && <div className="error-alert">{error}</div>div>}
          
                <div className="dashboard-grid">
                        <div className="dashboard-card" onClick={() => navigate('/waiter')}>
                                  <div className="card-icon">>Waiter Station
                                            <h2>Waiter Station</h2>h2>
                                            <p>Take new orders and manage tables</p>p>
                                  </div>div>
                        
                                <div className="dashboard-card" onClick={() => navigate('/kitchen')}>
                                          <div className="card-icon">Kitchen Station</div>div>
                                          <h2>Kitchen Station</h2>h2>
                                          <p>View and manage incoming orders</p>p>
                                </div>div>
                        
                                <div className="dashboard-card" onClick={() => navigate('/counter')}>
                                          <div className="card-icon">Counter & Billing</div>div>
                                          <h2>Counter & Billing</h2>h2>
                                          <p>Manage payment and final billing</p>p>
                                </div>div>
                        
                                <div className="dashboard-card" onClick={() => navigate('/admin-menu')}>
                                          <div className="card-icon">Menu Management</div>div>
                                          <h2>Menu Management</h2>h2>
                                          <p>Update items, prices, and availability</p>p>
                                </div>div>
                        </div>div>
                
                      <div className="system-status">
                              <div className="status-item">
                                        <span className="dot online"></span>span>
                                        <span>Database Connected</span>span>
                              </div>div>
                              <div className="status-item">
                                        <span className="dot online"></span>span>
                                        <span>Real-time Updates Active</span>span>
                              </div>div>
                      </div>div>
                </div>div>
            );
            };
          
          export default Home;</div>
