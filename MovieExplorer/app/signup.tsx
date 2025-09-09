import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ThemeContext } from "./theme-context"; // adjust path

export default function SignupScreen() {
  const { theme } = useContext(ThemeContext); // use theme context
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const router = useRouter();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);

  useEffect(() => {
    const newErrors: typeof errors = {};
    if (email && !validateEmail(email)) newErrors.email = "Invalid email format";
    if (password && !validatePassword(password))
      newErrors.password =
        "Password must be at least 8 characters, include a letter, a number, and a special character";
    if (confirmPassword && confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
  }, [email, password, confirmPassword]);

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) return;
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        favorites: [],
        watched: [],
        watchLater: [],
        preferences: { darkMode: false, notifications: true },
      });

      router.push("/login");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Email already registered" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email address" });
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 10 }} />
      ) : (
        <>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSignup}>
            <Text style={[styles.buttonText, { color: theme.background }]}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.buttonText, styles.backButtonText]}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#444", marginBottom: 5, padding: 12, borderRadius: 8 },
  error: { color: "red", marginBottom: 10, fontSize: 12 },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 16 },
  backButton: { backgroundColor: "#444" },
  backButtonText: { color: "#fff" },
});
