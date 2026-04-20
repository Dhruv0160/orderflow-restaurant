// Firebase configuration & initialization
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBpA-iOQjCJX9K0PBkLmRuweM3wX5q9-94",
    authDomain: "orderflow-restaurant.firebaseapp.com",
    projectId: "orderflow-restaurant",
    storageBucket: "orderflow-restaurant.firebasestorage.app",
    messagingSenderId: "207292795306",
    appId: "1:207292795306:web:e38f25caece554031943d3"
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
