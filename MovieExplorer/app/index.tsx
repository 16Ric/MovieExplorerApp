import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../contexts/theme-context"; // <-- import theme context

const API_KEY = "0e6afe4a2d64477dd43060979e71b616";

const endpoints = {
  "New Released Movies": `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`,
  "New Released TV Shows": `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`,
  "Trending Movies": `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`,
  "Trending TV Shows": `https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`,
  "Popular Movies": `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
  "Popular TV Shows": `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`,
};

export default function HomeScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchSection = async (title: string, url: string) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        return { title, data: data.results || [] };
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        return { title, data: [] };
      }
    };

    const fetchAllSections = async () => {
      setLoading(true);
      const results = await Promise.all(
        Object.entries(endpoints).map(([key, url]) =>
          fetchSection(key.charAt(0).toUpperCase() + key.slice(1), url)
        )
      );
      setSections(results);
      setLoading(false);
    };

    fetchAllSections();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading content...</Text>
      </View>
    );
  }

  const renderCard = (item: any, sectionTitle: string) => {
    const type = sectionTitle.toLowerCase().includes("movie") ? "movie" : "tv";
    const detailPath = type === "movie" ? "/movieDetails" : "/tvDetails";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: detailPath, params: { id: item.id } })}
      >
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "https://via.placeholder.com/140x200.png?text=No+Image",
          }}
          style={styles.poster}
        />
        <Text style={[styles.movieTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title || item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <Text style={[styles.seeAll, { color: theme.accent }]}>See All →</Text>
          </View>
          <FlatList
            data={section.data}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 10, paddingRight: 10 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderCard(item, section.title)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold" },
  seeAll: { fontSize: 14 },
  card: {
    width: 140,
    marginHorizontal: 5,
    alignItems: "center",
  },
  poster: { width: 140, height: 200, borderRadius: 8, marginBottom: 5 },
  movieTitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
