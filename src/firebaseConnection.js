
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARD_2GIyNC8nXeDSsD289hOWL_wdzaW4o",
  authDomain: "feed-c88fc.firebaseapp.com",
  databaseURL: "https://feed-c88fc-default-rtdb.firebaseio.com",
  projectId: "feed-c88fc",
  storageBucket: "feed-c88fc.appspot.com",
  messagingSenderId: "101884957238",
  appId: "1:101884957238:web:2df1ac28dfd344aa797e97",
  measurementId: "G-3Z99RJSPXP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export{db, storage}