import { Platform, View, Text, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useContext, useEffect, useRef, ReactNode } from "react";
import SearchOverlay from "../components/searchOverlay";
import { ThemeProvider, ThemeContext } from "../contexts/theme-context";
import { AuthProvider, AuthContext } from "../contexts/auth-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.7;

export default function LayoutWrapper() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayout>
          <Layout />
        </RootLayout>
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function Layout() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ use expo-router hook
  const [searchVisible, setSearchVisible] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const tabs: { title: string; route: "/" | "/movies" | "/tvShows" | "/myList" }[] = [
    { title: "Home", route: "/" },
    { title: "Movies", route: "/movies" },
    { title: "TV Shows", route: "/tvShows" },
    { title: "My List", route: "/myList" },
  ];

  const mobileTabs: { title: string; route: "/" | "/movies" | "/tvShows" | "/myList" | "/settings" }[] = [
    { title: "Home", route: "/" },
    { title: "Movies", route: "/movies" },
    { title: "TV Shows", route: "/tvShows" },
    { title: "My List", route: "/myList" },
    { title: "Settings", route: "/settings" }, 
  ];

  // Public routes
  const publicRoutes: string[] = ["/login", "/signup"];

  // Hide header routes
  const hideHeaderRoutes: string[] = ["/login", "/signup"];

  // ✅ Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (!publicRoutes.includes(pathname)) {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const Header = () => {
    const insets = useSafeAreaInsets(); // gets safe area insets
    return (
      <View
        style={[
          styles.header,
          { backgroundColor: theme.background, paddingTop: insets.top + 10 }, // extra 10px padding
        ]}
      >
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
              source={{
                uri: user?.profilePic || "https://i.pravatar.cc/100",
              }}
              style={[styles.avatar, { borderColor: theme.text }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const MobileHeader = () => {
    const insets = useSafeAreaInsets();
    return (
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity onPress={() => setDrawerOpen(true)}>
          <Image
            source={{ uri: user?.profilePic || "https://i.pravatar.cc/100" }}
            style={[styles.avatar, { borderColor: theme.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.accent }]}>
          Movie Explorer
        </Text>
        <TouchableOpacity onPress={() => setSearchVisible(true)}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: drawerOpen ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: false, // left/right cannot use native driver
    }).start();
  }, [drawerOpen]);

  const Drawer = () => {
    const insets = useSafeAreaInsets();

    return (
      <>
        {drawerOpen && (
          <TouchableOpacity
            style={[styles.overlay, { paddingTop: insets.top }]}
            onPress={() => setDrawerOpen(false)}
          />
        )}

        <Animated.View
          style={[
            styles.drawer,
            {
              left: drawerAnim,
              backgroundColor: theme.background,
              paddingTop: insets.top + 20,
            },
          ]}
        >
          {mobileTabs.map((mobileTab) => (
            <TouchableOpacity
              key={mobileTab.title}
              onPress={() => {
                router.push(mobileTab.route);
                setDrawerOpen(false);
              }}
              style={styles.drawerItem}
            >
              <Text style={[styles.drawerText, { color: theme.accent }]}>
                {mobileTab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </>
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    );
  }

  // Use bottom tabs for mobile, top stack + header for web
  if (Platform.OS === "web") {
    return (
      <>
        <Stack
          screenOptions={{
            header: () => {
              if (hideHeaderRoutes.includes(pathname) || !isAuthenticated) return null;
              return <Header />;
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="movies" options={{ title: "Movies" }} />
          <Stack.Screen name="tvShows" options={{ title: "TV Shows" }} />
          <Stack.Screen name="myList" options={{ title: "My List" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="signup" options={{ title: "Signup" }} />
        </Stack>
        {isAuthenticated && <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />}
      </>
    );
  } else {
    // Mobile: bottom tabs
    return (
      <>
        {!hideHeaderRoutes.includes(pathname) && isAuthenticated && <MobileHeader />}
        <Drawer/>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="movies" />
          <Stack.Screen name="tvShows" />
          <Stack.Screen name="myList" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
        {isAuthenticated && <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />}
      </>
    );
  }
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#00000066",
    zIndex: 998,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 999,
    paddingHorizontal: 20,
  },
  drawerItem: {
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  drawerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
