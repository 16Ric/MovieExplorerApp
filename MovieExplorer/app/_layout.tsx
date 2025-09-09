// app/_layout.tsx
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useContext } from "react";
import SearchOverlay from "../components/searchOverlay";
import { ThemeProvider, ThemeContext } from "./theme-context";

export default function LayoutWrapper() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

function Layout() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const { theme } = useContext(ThemeContext);

  const tabs: { title: string; route: "/" | "/movies" | "/tvShows" | "/myList" }[] = [
    { title: "Home", route: "/" },
    { title: "Movies", route: "/movies" },
    { title: "TV Shows", route: "/tvShows" },
    { title: "My List", route: "/myList" },
  ];

  // Routes where we want to hide the header
  const hideHeaderRoutes: ("/login" | "/signup")[] = ["/login", "/signup"];

  const Header = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.leftTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.title}
            onPress={() => router.push(tab.route)}
            style={styles.tabButton}
          >
            <Text style={[styles.tabText, { color: theme.accent }]}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={() => setSearchVisible(true)}>
          <Ionicons
            name="search-outline"
            size={24}
            color={theme.text}
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={[styles.avatar, { borderColor: theme.text }]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack
        screenOptions={{
          header: ({ route }) => {
            // Convert route.name to full path
            const path = `/${route.name}` as
              | "/login"
              | "/signup"
              | "/index"
              | "/movies"
              | "/tvShows"
              | "/myList"
              | "/settings";

            // Hide header for login/signup
            if (hideHeaderRoutes.includes(path as "/login" | "/signup")) return null;

            return <Header />;
          },
        }}
      >
        {/* Screens */}
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="movies" options={{ title: "Movies" }} />
        <Stack.Screen name="tvShows" options={{ title: "TV Shows" }} />
        <Stack.Screen name="myList" options={{ title: "My List" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="signup" options={{ title: "Signup" }} />
      </Stack>

      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  leftTabs: { flexDirection: "row" },
  tabButton: { marginRight: 20 },
  tabText: { fontSize: 18, fontWeight: "bold" },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
});
