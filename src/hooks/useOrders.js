import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db, isMockMode } from "../firebase";

export function useOrders(options = { statusFilter: null, timeRange: 'day', paymentFilter: null, customDate: null }) {
  // mapping todayOnly to timeRange for retro-compatibility
  let timeRange = options.timeRange || (options.todayOnly ? 'day' : null);
  const { statusFilter, customDate } = options;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevOrderIdsRef = useRef(new Set());

  useEffect(() => {
    // ----------------------------------------------------
    // LOCAL STORAGE MOCK MODE
    // ----------------------------------------------------
    if (isMockMode) {
      const getFilteredLocalOrders = () => {
        let localData = localStorage.getItem("orderflow_orders");
        let allOrders = localData ? JSON.parse(localData) : [];
        
        // Ensure dates are parsed
        allOrders = allOrders.map(o => ({
          ...o,
          createdAt: new Date(o.createdAt)
        }));

        if (timeRange === 'day' || timeRange === undefined) {
          const todayForm = new Date().toDateString();
          allOrders = allOrders.filter(o => o.createdAt.toDateString() === todayForm);
        } else if (timeRange === 'month') {
          const now = new Date();
          allOrders = allOrders.filter(o => o.createdAt.getMonth() === now.getMonth() && o.createdAt.getFullYear() === now.getFullYear());
        } else if (timeRange === 'custom' && customDate) {
          // Add timezone offset to match local selection correctly
          const [y, m, d] = customDate.split("-");
          const target = new Date(y, m - 1, d).toDateString();
          allOrders = allOrders.filter(o => o.createdAt.toDateString() === target);
        }

        if (statusFilter && statusFilter.length > 0) {
          allOrders = allOrders.filter(o => statusFilter.includes(o.status));
        }

        // Filter out paid orders by default for operations unless requested
        if (options?.paymentFilter === "unpaid") {
          allOrders = allOrders.filter(o => o.paymentStatus === "unpaid" || o.paymentStatus === undefined);
        }

        allOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return allOrders;
      };

      const handler = () => {
        const newOrders = getFilteredLocalOrders();
        
        // Detect naturally new orders
        const currentIds = new Set(newOrders.map(o => o.id));
        const newArrivals = newOrders.filter(o => !prevOrderIdsRef.current.has(o.id));
        prevOrderIdsRef.current = currentIds;

        if (newArrivals.length > 0 && newOrders.length > Object.keys(prevOrderIdsRef.current || {}).length) {
          window.dispatchEvent(new CustomEvent("newOrderArrived", { detail: { orders: newArrivals } }));
        }

        setOrders(newOrders);
        setLoading(false);
      };

      // Initial run
      handler();

      // Listen for our custom save event
      window.addEventListener("localOrdersUpdated", handler);
      return () => window.removeEventListener("localOrdersUpdated", handler);
    }

    // ----------------------------------------------------
    // FIREBASE REAL MODE
    // ----------------------------------------------------
    let constraints = [];
    if (timeRange === 'day' || timeRange === undefined) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      constraints.push(where("createdAt", ">=", Timestamp.fromDate(todayStart)));
    } else if (timeRange === 'month') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      constraints.push(where("createdAt", ">=", Timestamp.fromDate(monthStart)));
    } else if (timeRange === 'custom' && customDate) {
      const [y, m, d] = customDate.split("-");
      const selectedStart = new Date(y, m - 1, d);
      selectedStart.setHours(0, 0, 0, 0);
      
      const selectedEnd = new Date(selectedStart);
      selectedEnd.setHours(23, 59, 59, 999);
      
      constraints.push(where("createdAt", ">=", Timestamp.fromDate(selectedStart)));
      constraints.push(where("createdAt", "<=", Timestamp.fromDate(selectedEnd)));
    }

    if (statusFilter && statusFilter.length > 0) {
      constraints.push(where("status", "in", statusFilter));
    }
    if (options && options.paymentFilter === "unpaid") {
      constraints.push(where("paymentStatus", "in", ["unpaid", null])); // Fallback for old orders
    }
    constraints.push(orderBy("createdAt", "asc"));

    const q = query(collection(db, "orders"), ...constraints);
    
    // Safety check just in case db is somehow undefined 
    if (!db) {
      setError("Database is undefined.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        const currentIds = new Set(newOrders.map(o => o.id));
        const newArrivals = newOrders.filter(o => !prevOrderIdsRef.current.has(o.id));
        prevOrderIdsRef.current = currentIds;

        if (newArrivals.length > 0 && orders.length > 0) {
          window.dispatchEvent(new CustomEvent("newOrderArrived", { detail: { orders: newArrivals } }));
        }

        setOrders(newOrders);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter?.join(","), timeRange, customDate]);

  return { orders, loading, error, todayCount: orders.length };
}
