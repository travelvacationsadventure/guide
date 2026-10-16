import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-SO3hCgkMqzxSXZc25NYxKe4JIfXPZSo",
  authDomain: "guide-39142.firebaseapp.com",
  projectId: "guide-39142",
  storageBucket: "guide-39142.firebasestorage.app",
  messagingSenderId: "983349957623",
  appId: "1:983349957623:web:d082f8a0e1c6fbd20014f2",
  measurementId: "G-B6HCGEQ8CW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  app, 
  analytics, 
  db, 
  auth, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};
