import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "./firebaseConfig";

/**
 * Requests a web push token and saves it to Firestore automatically.
 */
export const requestWebPushToken = async (): Promise<string | null> => {
  if (!("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { pushNotifToken: token }, { merge: true });
      console.log("Web push token saved to Firestore:", token);
    }

    return token;
  } catch (err) {
    console.error("Error requesting web push token:", err);
    return null;
  }
};

/**
 * Listen to messages when app is in foreground
 */
export const listenForegroundMessages = (callback: (payload: any) => void) => {
  const messaging = getMessaging();
  onMessage(messaging, callback);
};
