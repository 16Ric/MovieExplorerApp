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
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ThemeContext } from "../contexts/theme-context"; // adjust path

export default function LoginScreen() {
  const { theme } = useContext(ThemeContext); // Use theme context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  }, [email]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (emailError) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/"); // redirect to Home
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setErrorMessage("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Please try again");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Login</Text>

      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
          emailError ? styles.inputError : null,
        ]}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 10 }} />
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleLogin}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => router.push("/signup")}
          >
            <Text style={[styles.buttonText, styles.backButtonText]}>Go to Signup</Text>
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
  inputError: { borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, fontSize: 12, textAlign: "center" },
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
