import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

const Login = () => {
      const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
          const [error, setError] = useState('');
            const [loading, setLoading] = useState(false);
              const { login } = useAuth();
                const navigate = useNavigate();

                  const handleSubmit = async (e) => {
                        e.preventDefault();
                            try {
                                      setError('');
                                            setLoading(true);
                                                  await login(email, password);
                                                        navigate('/');
                                                            } catch (err) {
                                                                      setError('Failed to sign in. Please check your credentials.');
                                                            } finally {
                                                                      setLoading(false);
                                                            }
                                                              };

                                                                return (
                                                                        <div className="login-container">
                                                                                  <div className="login-card">
                                                                                            <div className="login-header">
                                                                                                          <div className="logo">ORDERFLOW</div>
                                                                                                                    <h1>OrderFlow</h1>
                                                                                                                              <p>Restaurant Management System</p>
                                                                                                                                      </div>

                                                                                                                                              {error && <div className="error-alert">{error}</div>}

                                                                                                                                                      <form onSubmit={handleSubmit}>
                                                                                                                                                                  <div className="form-group">
                                                                                                                                                                                <label>Email Address</label>
                                                                                                                                                                                            <input
                                                                                                                                                                                                          type="email"
                                                                                                                                                                                                                        value={email}
                                                                                                                                                                                                                                      onChange={(e) => setEmail(e.target.value)}
                                                                                                                                                                                                                                                    required
                                                                                                                                                                                                                                                                  placeholder="admin@orderflow.com"
                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                  <div className="form-group">
                                                                                                                                                                                                                                                                                                                <label>Password</label>
                                                                                                                                                                                                                                                                                                                            <input
                                                                                                                                                                                                                                                                                                                                          type="password"
                                                                                                                                                                                                                                                                                                                                                        value={password}
                                                                                                                                                                                                                                                                                                                                                                      onChange={(e) => setPassword(e.target.value)}
                                                                                                                                                                                                                                                                                                                                                                                    required
                                                                                                                                                                                                                                                                                                                                                                                                  placeholder="********"
                                                                                                                                                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                  <button disabled={loading} type="submit" className="login-btn">
                                                                                                                                                                                                                                                                                                                                                                                                                                                {loading ? 'Logging in...' : 'Sign In'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </form>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <div className="login-footer">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <p>Demo accounts: admin@test.com / waiter@test.com</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        };

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        export default Login;
                                                                )
                                                            }
                                                            }
                            }
                  }
}