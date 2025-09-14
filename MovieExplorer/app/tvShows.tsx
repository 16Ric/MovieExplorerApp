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
import { ThemeContext } from "../contexts/theme-context"; // adjust path if needed

const API_KEY = "0e6afe4a2d64477dd43060979e71b616";

export default function TVShowsScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useContext(ThemeContext); // 👈 get theme from context

  const endpoints = {
    "New Releases": `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`,
    trending: `https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`,
    popular: `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`,
    topRated: `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`,
  };

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
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading TV shows...</Text>
      </View>
    );
  }

  const renderCard = (item: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/tvDetails", params: { id: item.id } })}
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
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>
          </View>
          <FlatList
            data={section.data}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 10, paddingRight: 10 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderCard(item)}
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
  sectionHeader: { marginHorizontal: 10, marginBottom: 5 },
  sectionTitle: { fontSize: 22, fontWeight: "bold" },
  card: { width: 140, marginHorizontal: 5, alignItems: "center" },
  poster: { width: 140, height: 200, borderRadius: 8, marginBottom: 5 },
  movieTitle: { fontSize: 12, fontWeight: "500", textAlign: "center" },
});
