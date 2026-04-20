import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
import { MENU_ITEMS as DEFAULT_MENU } from "../utils/menuItems";

export function useMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ----------------------------------------------------
    // LOCAL STORAGE MOCK MODE
    // ----------------------------------------------------
    if (isMockMode) {
      const handler = () => {
        let data = localStorage.getItem("orderflow_menu");
        if (!data) {
          const seeded = DEFAULT_MENU.map((item) => ({ id: crypto.randomUUID(), ...item }));
          localStorage.setItem("orderflow_menu", JSON.stringify(seeded));
          data = JSON.stringify(seeded);
        }
        setMenuItems(JSON.parse(data));
        setLoading(false);
      };

      handler();
      window.addEventListener("localMenuUpdated", handler);
      return () => window.removeEventListener("localMenuUpdated", handler);
    }

    // ----------------------------------------------------
    // FIREBASE REAL MODE
    // ----------------------------------------------------
    if (!db) {
      setError("Database undefined.");
      setLoading(false);
      return;
    }

    const q = query(collection(db, "menu"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // If real DB is completely empty and developer wants to seed, they can manually add.
        // For production, we just accept the DB source of truth.
        setMenuItems(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore listener error on Menu:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { menuItems, loading, error };
}
