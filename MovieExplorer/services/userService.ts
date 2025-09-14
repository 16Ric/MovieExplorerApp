import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserModel } from "../models/User";

// Get the current user's document as UserModel
export const getUserDoc = async (): Promise<UserModel | null> => {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserModel) : null;
};

// Helper to get the right list key
const getListKey = (key: "favorite" | "watched" | "watchLater"): keyof UserModel => {
  switch (key) {
    case "favorite":
      return "favoriteList";
    case "watched":
      return "watchedList";
    case "watchLater":
      return "watchLaterList";
  }
};

// Add an item to a list safely
export const addItemToList = async (
  itemId: string,
  key: "favorite" | "watched" | "watchLater",
  type: "movie" | "tv"
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  const user = await getUserDoc();
  if (!user) return;

  const listKey = getListKey(key);

  // Type guard to ensure we're working with the correct structure
  const currentList = user[listKey] as { movie: string[]; tv: string[] } | undefined;

  const updatedList = {
    movie: currentList?.movie ?? [],
    tv: currentList?.tv ?? [],
  };

  if (!updatedList[type].includes(itemId)) {
    updatedList[type].push(itemId);
  }

  await setDoc(docRef, { [listKey]: updatedList }, { merge: true });

};

// Remove an item from a list safely
export const removeItemFromList = async (
  itemId: string,
  key: "favorite" | "watched" | "watchLater",
  type: "movie" | "tv"
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  const user = await getUserDoc();
  if (!user) return;

  const listKey = getListKey(key);
  const currentList = user[listKey] as { movie: string[]; tv: string[] } | undefined;

  const updatedList = {
    movie: currentList?.movie.filter((id) => id !== itemId) ?? [],
    tv: currentList?.tv.filter((id) => id !== itemId) ?? [],
  };

  await setDoc(docRef, { [listKey]: updatedList }, { merge: true });

};

// Update user settings
export const updateUserSettings = async (settings: Partial<UserModel>) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  await setDoc(docRef, settings, { merge: true });
};

// Upload profile picture
export const uploadProfilePicture = async (uri: string): Promise<string | null> => {
  if (!auth.currentUser) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, blob);

    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};

export const saveUserPushToken = async (uid: string, token: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { pushToken: token });
};