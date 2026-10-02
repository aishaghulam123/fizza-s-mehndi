// Reads the active song for an invitation from Firestore (uploaded via the admin panel).
// Firebase config is public by design; Firestore rules protect the data.
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9a74k4IXWhq8eR62PPnuxsGUYtBUStzE",
  authDomain: "fizza-7a796.firebaseapp.com",
  projectId: "fizza-7a796",
  storageBucket: "fizza-7a796.firebasestorage.app",
  messagingSenderId: "180855693736",
  appId: "1:180855693736:web:c739b1a44fe0c21f61bd9d",
  measurementId: "G-9XZDJGKR7H",
};

export async function fetchSongUrl(invitationId: string): Promise<string | null> {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(
    query(
      collection(db, "songs"),
      where("invitationId", "==", invitationId),
      orderBy("createdAt", "desc"),
      limit(1),
    ),
  );
  const first = snapshot.docs[0];
  if (!first) return null;
  const url = first.data()["audioUrl"];
  return typeof url === "string" ? url : null;
}
