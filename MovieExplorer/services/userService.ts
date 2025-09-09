import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db, auth, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const getUserDoc = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const getListName = (key: "favorite" | "watched" | "watchLater", type: "movie" | "tv") => {
  switch (key) {
    case "favorite":
      return type === "movie" ? "favoriteMovies" : "favoriteTVShows";
    case "watched":
      return type === "movie" ? "watchedMovies" : "watchedTVShows";
    case "watchLater":
      return type === "movie" ? "watchLaterMovies" : "watchLaterTVShows";
  }
};

// Add item safely
export const addItemToList = async (item: any, key: "favorite" | "watched" | "watchLater", type: "movie" | "tv") => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const listName = getListName(key, type);
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, { [listName]: arrayUnion(item) }, { merge: true });
};

// Remove item safely
export const removeItemFromList = async (itemId: number | string, key: "favorite" | "watched" | "watchLater", type: "movie" | "tv") => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const listName = getListName(key, type);
  const docRef = doc(db, "users", uid);

  const userData = await getUserDoc();
  const list = userData?.[listName] || [];
  const updatedList = list.filter((m: any) => m.id !== itemId);

  await setDoc(docRef, { [listName]: updatedList }, { merge: true });
};

export const updateUserSettings = async (settings: {
  username?: string;
  email?: string;
  password?: string;
  notifications?: boolean;
  profilePic?: string;
  darkMode?: boolean;
}) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  await setDoc(docRef, settings, { merge: true });
};

export const uploadProfilePicture = async (uri: string): Promise<string | null> => {
  try {
    if (!auth.currentUser) return null;

    // Fetch local file and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Extract file extension from URI
    const uriParts = uri.split(".");
    const extension = uriParts[uriParts.length - 1]; // jpg, png, etc.

    // Use UID + extension as storage filename
    const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}.${extension}`);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err) {
    console.error("Failed to upload profile picture:", err);
    return null;
  }
};
