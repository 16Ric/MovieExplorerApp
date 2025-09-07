import { View, Text, Button, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Link href="/signup" asChild>
        <Button title="Go to Signup" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});
