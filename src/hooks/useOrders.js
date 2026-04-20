import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
export function useOrders(options) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const prevOrderIdsRef = useRef(new Set());
    useEffect(() => {
          if (isMockMode) {
                  const handler = () => {
                            const data = localStorage.getItem("orderflow_orders");
                            const all = data ? JSON.parse(data).map(o => ({ ...o, createdAt: new Date(o.createdAt) })) : [];
                            setOrders(all);
                            setLoading(false);
                  };
                  handler();
                  window.addEventListener("localOrdersUpdated", handler);
                  return () => window.removeEventListener("localOrdersUpdated", handler);
          }
          const q = query(collection(db, "orders"), orderBy("createdAt", "asc"));
          return onSnapshot(q, (sn) => {
                  setOrders(sn.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() })));
                  setLoading(false);
          });
    }, []);
    return { orders, loading };
}
