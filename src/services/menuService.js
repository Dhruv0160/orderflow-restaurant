import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, isMockMode } from "../firebase";
export async function addMenuItem(item) {
    if (isMockMode) { /* mock logic */ return; }
    return addDoc(collection(db, "menu"), item);
}
export async function updateMenuItem(id, up) {
    if (isMockMode) { /* mock logic */ return; }
    return updateDoc(doc(db, "menu", id), up);
}
export async function deleteMenuItem(id) {
    if (isMockMode) { /* mock logic */ return; }
    return deleteDoc(doc(db, "menu", id));
}
