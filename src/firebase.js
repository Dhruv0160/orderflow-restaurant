import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = { apiKey: "AIzaSyDEMO_REPLACE", authDomain: "demo.firebaseapp.com", projectId: "demo-id" };
export const isMockMode = true; // Hardcoded true for initial deployment safety
let app, db;
export { app, db };
