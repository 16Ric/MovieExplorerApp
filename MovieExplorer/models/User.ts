export interface UserModel {
  uid: string;
  email: string | null;
  userName?: string;
  profilePic?: string;
  password?: string; // Only for signup/login, not stored in Firestore

  watchedList?: {
    movie: string[]; 
    tv: string[];
  };

  watchLaterList?: {
    movie: string[];
    tv: string[];
  };

  favoriteList?: {
    movie: string[];
    tv: string[];
  };

  darkMode?: boolean;
  notifications?: boolean;
  pushNotifToken?: string;
}
