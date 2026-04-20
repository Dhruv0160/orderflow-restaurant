// Firebase configuration & initialization
// Replace these values with your own Firebase project config
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEMO_REPLACE_WITH_YOUR_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// If the API key is the demo one, enable Local Mock Mode
export const isMockMode = firebaseConfig.apiKey === "AIzaSyDEMO_REPLACE_WITH_YOUR_KEY";

// Only initialize Firebase if we are not in Mock Mode to prevent annoying infinite connection loops
let app, db;
if (!isMockMode) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  console.warn("Firebase config not found! Using LocalStorage fallback mode.");
}

export { app, db };
