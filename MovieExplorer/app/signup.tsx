import { View, Text, Button, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup Screen</Text>
      <Link href="/login" asChild>
        <Button title="Go to Login" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});
