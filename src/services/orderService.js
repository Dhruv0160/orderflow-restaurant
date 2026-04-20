import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
export async function createOrder(items, table) {
    const data = { items, tableNumber: Number(table), status: "new", createdAt: serverTimestamp() };
    if (isMockMode) { /* mock */ return { orderId: "MOCK" }; }
    return addDoc(collection(db, "orders"), data);
}
export async function updateOrderStatus(id, status) {
    if (isMockMode) { /* mock */ return; }
    return updateDoc(doc(db, "orders", id), { status });
}
