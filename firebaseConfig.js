// import { initializeApp } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore, collection, doc, setDoc } from "firebase/firestore"; // Use full Firestore version

// const firebaseConfig = {
//   apiKey: "AIzaSyBXu5OJd8nDwXh36Z7WYEDvDD_ck4VUdSE",
//   authDomain: "skejula-backend.firebaseapp.com",
//   projectId: "skejula-backend",
//   storageBucket: "skejula-backend.appspot.com", // Fixed storageBucket
//   messagingSenderId: "560391393810",
//   appId: "1:560391393810:web:549e47d41976ce4980fecb",
//   measurementId: "G-DV87CC576J",
// };

// // Initialize Firebase App
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Auth with persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// // Initialize Firestore Database
// const db = getFirestore(app);

// export { auth, db };
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore"; // Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBXu5OJd8nDwXh36Z7WYEDvDD_ck4VUdSE",
  authDomain: "skejula-backend.firebaseapp.com",
  projectId: "skejula-backend",
  storageBucket: "skejula-backend.appspot.com", // Correct storageBucket
  messagingSenderId: "560391393810",
  appId: "1:560391393810:web:549e47d41976ce4980fecb",
  measurementId: "G-DV87CC576J",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for session persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Also export `getAuth` for compatibility
const authInstance = getAuth(app);

// Initialize Firestore Database
const db = getFirestore(app);

export { app, auth, authInstance, db };
