import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, get, ref, query, orderByChild, equalTo, push, onValue, set, remove, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVKV5yV_M5b4uB5Tw6nvAocybbBX7a0n8",
  authDomain: "webmessenger-7a32b.firebaseapp.com",
  projectId: "webmessenger-7a32b",
  storageBucket: "webmessenger-7a32b.appspot.com",
  messagingSenderId: "830250172387",
  appId: "1:830250172387:web:c2f1449b0c88ee5d172ad6",
  measurementId: "G-J2M86DTRXM",
  databaseURL: "https://webmessenger-7a32b-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, get, db, ref, query, orderByChild, equalTo, push, onValue, set, remove, update };
