import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useContext } from "react";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "./theme-context";
import { getUserDoc, updateUserSettings, uploadProfilePicture } from "../services/userService";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await getUserDoc();
        if (user) {
          setUsername(user.username || "");
          setEmail(user.email || "");
          setNotifications(user.notifications ?? true);
          setProfilePic(user.profilePic || null);
          setPassword(""); // do not load actual password
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

  const saveProfile = async () => {
    try {
      const user = await getUserDoc();
      if (user?.password && oldPassword !== user.password) {
        Alert.alert("Error", "Old password does not match!");
        return;
      }

      let profilePicURL = profilePic;
      if (profilePic && profilePic.startsWith("file://")) {
        const uploadedURL = await uploadProfilePicture(profilePic);
        if (uploadedURL) profilePicURL = uploadedURL;
      }

      const updatedData: any = {
        username,
        email,
        notifications,
        profilePic: profilePicURL,
      };
      if (password) updatedData.password = password;

      await updateUserSettings(updatedData);
      Alert.alert("Success", "Profile updated successfully!");
      setOldPassword("");
    } catch (err) {
      Alert.alert("Error", "Failed to save profile.");
      console.error(err);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotifications(value);
    try {
      await updateUserSettings({ notifications: value });
    } catch (err) {
      console.error("Failed to update notifications:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      Alert.alert("Error", "Failed to log out");
    }
  };

  return loading ? (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>Loading settings...</Text>
    </View>
  ) : (
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
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Confirm Old Password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <Button title="Save Profile" color={theme.accent} onPress={saveProfile} />

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Enable Notifications</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>

      {/* Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={(val: boolean) => toggleTheme(val)}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={handleLogout}
      >
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
});
