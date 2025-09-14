import { useState, useContext } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemeContext } from "../contexts/theme-context";

const API_KEY = "0e6afe4a2d64477dd43060979e71b616";

export default function SearchOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { theme } = useContext(ThemeContext); // <-- use theme here

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${text}&page=1&include_adult=false`
      );
      const data = await res.json();
      const filtered = (data.results || [])
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .slice(0, 10);
      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item: any) => {
    const detailPath = item.media_type === "movie" ? "/movieDetails" : "/tvDetails";

    return (
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: theme.card }]}
        onPress={() => {
          onClose();
          router.push({ pathname: detailPath, params: { id: item.id } });
        }}
      >
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
              : "https://via.placeholder.com/50x75.png?text=No+Image",
          }}
          style={styles.poster}
        />
        <Text style={[styles.itemText, { color: theme.text }]}>
          {item.title || item.name} ({item.media_type === "movie" ? "Movie" : "TV"})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: theme.background + "ee" }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Search movies or TV shows..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.accent} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.media_type}-${item.id}`}
            renderItem={({ item }) => renderItem(item)}
            ListEmptyComponent={
              query.length > 1 ? <Text style={[styles.empty, { color: theme.text }]}>No results found</Text> : null
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  poster: { width: 50, height: 75, borderRadius: 4, marginRight: 10 },
  itemText: { fontSize: 16, flexShrink: 1 },
  empty: { textAlign: "center", marginTop: 20 },
});
