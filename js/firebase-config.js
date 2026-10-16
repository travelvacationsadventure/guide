import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp, 
  query, 
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-SO3hCgkMqzxSXZc25NYxKe4JIfXPZSo",
  authDomain: "guide-39142.firebaseapp.com",
  projectId: "guide-39142",
  storageBucket: "guide-39142.firebasestorage.app",
  messagingSenderId: "983349957623",
  appId: "1:983349957623:web:d082f8a0e1c6fbd20014f2",
  measurementId: "G-B6HCGEQ8CW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};
