import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db, isMockMode } from "../firebase";

const ORDERS_COLLECTION = "orders";

// ----------------------------------------------------
// LOCAL STORAGE MOCK HELPER
// ----------------------------------------------------
function getLocalOrders() {
  const data = localStorage.getItem("orderflow_orders");
  return data ? JSON.parse(data) : [];
}

function saveLocalOrders(orders) {
  localStorage.setItem("orderflow_orders", JSON.stringify(orders));
  // Dispatch a custom event to notify useOrders hook
  window.dispatchEvent(new Event("localOrdersUpdated"));
}

// ----------------------------------------------------
// MAIN SERVICE EXPORTS
// ----------------------------------------------------

/**
 * Generate a short readable order ID like "ORD-042"
 */
function generateOrderId(dailyNumber) {
  return `ORD-${String(dailyNumber).padStart(3, "0")}`;
}

/**
 * Count today's orders
 */
export async function getDailyOrderCount() {
  if (isMockMode) {
    const today = new Date().toDateString();
    return getLocalOrders().filter(o => new Date(o.createdAt).toDateString() === today).length;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const q = query(collection(db, ORDERS_COLLECTION), where("createdAt", ">=", Timestamp.fromDate(now)));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Create a new order
 */
export async function createOrder(items, tableNumber) {
  const dailyCount = await getDailyOrderCount();
  const dailyOrderNumber = dailyCount + 1;
  const orderId = generateOrderId(dailyOrderNumber);

  if (isMockMode) {
    const orders = getLocalOrders();
    const newOrder = {
      id: crypto.randomUUID(),
      orderId,
      items: items.filter(item => item.qty > 0),
      tableNumber: Number(tableNumber),
      status: "new",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
      dailyOrderNumber
    };
    orders.push(newOrder);
    saveLocalOrders(orders);
    return { id: newOrder.id, orderId };
  }

  const orderData = {
    orderId,
    items: items.filter(item => item.qty > 0),
    tableNumber: Number(tableNumber),
    status: "new",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
    dailyOrderNumber
  };

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
  return { id: docRef.id, orderId };
}

/**
 * Settle all unpaid orders for a specific table
 */
export async function settleTableOrders(tableNumber) {
  if (isMockMode) {
    const orders = getLocalOrders();
    let updated = false;
    for (let o of orders) {
      // Must match table and NOT be already paid
      if (o.tableNumber === Number(tableNumber) && o.paymentStatus !== "paid") {
        o.paymentStatus = "paid";
        updated = true;
      }
    }
    if (updated) saveLocalOrders(orders);
    return;
  }

  const tableQuery = query(
    collection(db, ORDERS_COLLECTION),
    where("tableNumber", "==", Number(tableNumber)),
    where("paymentStatus", "==", "unpaid")
  );
  
  const snapshot = await getDocs(tableQuery);
  const promises = snapshot.docs.map(d => updateDoc(doc(db, ORDERS_COLLECTION, d.id), { paymentStatus: "paid" }));
  await Promise.all(promises);
}

/**
 * Update order status
 */
export async function updateOrderStatus(docId, newStatus) {
  if (isMockMode) {
    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id === docId);
    if (index >= 0) {
      orders[index].status = newStatus;
      saveLocalOrders(orders);
    }
    return;
  }

  const orderRef = doc(db, ORDERS_COLLECTION, docId);
  await updateDoc(orderRef, { status: newStatus });
}
