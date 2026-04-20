import React from 'react';
import { useNavigate } from 'react-router-dom';
import './kitchen.css';

export default function Kitchen() {
    const navigate = useNavigate();
    return (
          <div className="kitchen-page">
                <h1>Kitchen Display</h1>h1>
                <button onClick={() => navigate("/")}>Back</button>button>
          </div>div>
        );
</div>
