import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase not properly initialized. Check your .env file.");
}

export const saveTransaction = async (userId, transactionData) => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/transactions`), {
      ...transactionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const subscribeToTransactions = (userId, callback) => {
  if (!db) {
    console.warn("Firestore is not initialized, cannot subscribe.");
    return () => {};
  }
  const q = query(
    collection(db, `users/${userId}/transactions`),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    callback(transactions);
  });
};
