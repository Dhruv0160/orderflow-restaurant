import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
import { MENU_ITEMS as DEFAULT_MENU } from "../utils/menuItems";

const MENU_COLLECTION = "menu";

function getLocalMenu() {
  const data = localStorage.getItem("orderflow_menu");
  // If no data exists, seed it with the hardcoded menu, giving each item a UUID
  if (!data) {
    const seeded = DEFAULT_MENU.map((item) => ({ id: crypto.randomUUID(), ...item }));
    localStorage.setItem("orderflow_menu", JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(data);
}

function saveLocalMenu(menu) {
  localStorage.setItem("orderflow_menu", JSON.stringify(menu));
  window.dispatchEvent(new Event("localMenuUpdated"));
}

export async function addMenuItem(item) {
  // Ensure price is stored as a number
  const parsedItem = { ...item, price: Number(item.price) };

  if (isMockMode) {
    const menu = getLocalMenu();
    const newItem = { id: crypto.randomUUID(), ...parsedItem };
    menu.push(newItem);
    saveLocalMenu(menu);
    return newItem;
  }
  
  const ref = await addDoc(collection(db, MENU_COLLECTION), parsedItem);
  return { id: ref.id, ...parsedItem };
}

export async function updateMenuItem(id, updates) {
  const parsedUpdates = { ...updates };
  if (parsedUpdates.price !== undefined) {
    parsedUpdates.price = Number(parsedUpdates.price);
  }

  if (isMockMode) {
    const menu = getLocalMenu();
    const idx = menu.findIndex((m) => m.id === id);
    if (idx !== -1) {
      menu[idx] = { ...menu[idx], ...parsedUpdates };
      saveLocalMenu(menu);
    }
    return;
  }
  
  await updateDoc(doc(db, MENU_COLLECTION, id), parsedUpdates);
}

export async function deleteMenuItem(id) {
  if (isMockMode) {
    const menu = getLocalMenu();
    saveLocalMenu(menu.filter((m) => m.id !== id));
    return;
  }
  
  await deleteDoc(doc(db, MENU_COLLECTION, id));
}
