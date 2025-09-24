import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform
} from "react-native";
import { useState, useEffect, useContext } from "react";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../contexts/theme-context";
import { saveUserPushToken, getUserDoc, updateUserSettings, uploadProfilePicture } from "../services/userService";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { AuthContext } from "../contexts/auth-context";
import { UserModel } from "../models/User";

export default function SettingsScreen() {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const { refreshUserData } = useContext(AuthContext);
  const router = useRouter();

  const [userData, setUserData] = useState<UserModel | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; currentPassword?: string; }>({});
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await getUserDoc();
        if (user) {
          setUserData(user);
          setUsername(user.userName || "");
          setEmail(user.email || "");
          setNotifications(user.notifications ?? true);
          setProfilePic(user.profilePic || null);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const saveProfile = async (currentPassword: string) => {
    setErrors({});
    setSuccessMsg("");

    const newErrors: typeof errors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) newErrors.email = "Please enter a valid email address.";
    if (newPassword && newPassword.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    if (!currentPassword && (auth.currentUser && (auth.currentUser.email !== email || newPassword)))
      newErrors.currentPassword = "Current password is required to change email or password.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Upload profile picture if changed
      let profilePicURL = profilePic;
      if (profilePic && profilePic.startsWith("file://")) {
        const uploadedURL = await uploadProfilePicture(profilePic);
        if (uploadedURL) profilePicURL = uploadedURL;
      }

      // Update Firestore user settings
      const updatedData: Partial<UserModel> = { userName: username, email, notifications };
      if (profilePicURL) updatedData.profilePic = profilePicURL;
      await updateUserSettings(updatedData);

      // Update Firebase Auth email/password with reauthentication
      if (auth.currentUser) {
        if (auth.currentUser.email !== email || newPassword) {
          const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);

          if (newPassword) {
            try {
              await updatePassword(auth.currentUser, newPassword);
            } catch (err: any) {
              if (err.code === "auth/weak-password")
                newErrors.password =
                  "Password is too weak. Use at least 8 characters with letters, numbers, and symbols.";
              else newErrors.password = err.message || "Failed to update password.";
            }
          }
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        await refreshUserData();
        setNewPassword("");
        setSuccessMsg("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ email: err.message || "Failed to update profile." });
    }
  };

  const toggleNotificationsHandler = async (value: boolean) => {
  setNotifications(value);

  try {
    // 1. Update Firestore settings
    await updateUserSettings({ notifications: value });
    await refreshUserData();

    // if (value) {
    //   let token: string | null = null;

    //   if (Platform.OS === "web") {
    //     token = await requestWebPushToken();
    //   } else {
    //     token = await registerForPushNotificationsAsync();
    //   }

    //   if (auth.currentUser && token) {
    //     // Save token to Firestore under the user profile
    //     await saveUserPushToken(auth.currentUser.uid, token);

    //     await sendPushNotification(token, {
    //       title: "✅ Notifications Enabled",
    //       body: "You’ll now receive updates on trending movies & reminders!",
    //       screen: "Trending", // optional deep link
    //     });
    //   }
    // }
  } catch (err) {
    console.error("Failed to update notifications:", err);
  }
};


  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.accent }]}>⚙️ Settings</Text>

      {/* Profile Picture */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
      <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={[styles.placeholderPic, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>Select Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#aaa"
      />

      <View style={[styles.input, { backgroundColor: theme.card, justifyContent: 'center' }]}>
        <Text style={{ color: theme.text }}>{email}</Text>
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current Password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      {errors.currentPassword && <Text style={styles.error}>{errors.currentPassword}</Text>}

      {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={() => saveProfile(currentPassword)}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>Save Profile</Text>
      </TouchableOpacity>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Enable Notifications</Text>
        <Switch value={notifications} onValueChange={toggleNotificationsHandler} />
      </View>

      {/* Dark Mode */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={(val) => toggleTheme(val)} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: theme.background }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  label: { fontSize: 16 },
  input: { padding: 10, borderRadius: 8, marginBottom: 10 },
  profilePicContainer: { alignSelf: "center", marginBottom: 15 },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  placeholderPic: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  button: { paddingVertical: 15, borderRadius: 8, marginVertical: 20, alignItems: "center" },
  buttonText: { fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginBottom: 10, fontSize: 12 },
  success: { color: "green", marginBottom: 10, fontSize: 12, textAlign: "center" },
});
