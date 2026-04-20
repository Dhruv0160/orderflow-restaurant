import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
import { MENU_ITEMS as DEFAULT_MENU } from "../utils/menuItems";
export function useMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
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
          const q = query(collection(db, "menu"));
          const unsubscribe = onSnapshot(q, (sn) => {
                  setMenuItems(sn.docs.map(d => ({ id: d.id, ...d.data() })));
                  setLoading(false);
          }, (err) => { setError(err.message); setLoading(false); });
          return () => unsubscribe();
    }, []);
    return { menuItems, loading, error };
}
