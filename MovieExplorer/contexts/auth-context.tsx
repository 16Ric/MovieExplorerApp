import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { getUserDoc, saveUserPushToken } from "../services/userService";
import { UserModel } from "../models/User";

interface AuthContextType {
  user: UserModel | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  refreshUserData: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await getUserDoc();
      if (userData) {
        setUser({ ...userData, uid: firebaseUser.uid, email: firebaseUser.email || null });
      } else {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || null,
          watchedList: { movie: [], tv: [] },
          watchLaterList: { movie: [], tv: [] },
          favoriteList: { movie: [], tv: [] },
          darkMode: false,
          notifications: true,
        });
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || null,
        watchedList: { movie: [], tv: [] },
        watchLaterList: { movie: [], tv: [] },
        favoriteList: { movie: [], tv: [] },
        darkMode: false,
        notifications: true,
      });
    }
  };

  const refreshUserData = async () => {
    if (firebaseUser) await loadUserData(firebaseUser);
  };

  // -------------------
  // Auth State Listener
  // -------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) await loadUserData(user);
      else setUser(null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    isLoading,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};