import { useState, useContext, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../contexts/theme-context";
import { auth } from "../firebase/firebaseConfig";
import { getUserDoc, removeItemFromList } from "../services/userService";
import { UserModel } from "../models/User";

const API_KEY = "0e6afe4a2d64477dd43060979e71b616";

type ListKey = "favorite" | "watched" | "watchLater";

export default function MyListScreen() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [wantToWatch, setWantToWatch] = useState<any[]>([]);
  const userId = auth.currentUser?.uid;

  // Fetch full TMDB data for each ID
  const fetchItems = async (ids: string[], type: "movie" | "tv") => {
    if (!ids || ids.length === 0) return [];
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=en-US`
          );
          return res.json();
        })
      );
      return results;
    } catch (err) {
      console.error(`Failed to fetch ${type} items:`, err);
      return [];
    }
  };

  const fetchLists = useCallback(async () => {
    if (!userId) return;

    const user: UserModel | null = await getUserDoc();

    const favMovies = await fetchItems(user?.favoriteList?.movie || [], "movie");
    const favTV = await fetchItems(user?.favoriteList?.tv || [], "tv");
    setFavorites([...favMovies, ...favTV]);

    const watchedMovies = await fetchItems(user?.watchedList?.movie || [], "movie");
    const watchedTV = await fetchItems(user?.watchedList?.tv || [], "tv");
    setWatched([...watchedMovies, ...watchedTV]);

    const watchLaterMovies = await fetchItems(user?.watchLaterList?.movie || [], "movie");
    const watchLaterTV = await fetchItems(user?.watchLaterList?.tv || [], "tv");
    setWantToWatch([...watchLaterMovies, ...watchLaterTV]);
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleRemove = async (listKey: ListKey, item: any) => {
    if (!userId) return;
    const type: "movie" | "tv" = item.title ? "movie" : "tv";
    await removeItemFromList(item.id.toString(), listKey, type);
    fetchLists();
  };

  const renderCard = (item: any, listKey: ListKey) => {
    const isMovie = !!item.title;
    const detailPath = isMovie ? "/movieDetails" : "/tvDetails";
    const itemId = item.id ?? "unknown";
    const itemTitle = item.title || item.name || "Untitled";
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "https://via.placeholder.com/140x200.png?text=No+Image";

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: detailPath, params: { id: itemId } })
          }
        >
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
          />
          <Text style={[styles.movieTitle, { color: theme.text }]} numberOfLines={1}>
            {itemTitle}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.accent }]}
          onPress={() => handleRemove(listKey, item)}
        >
          <Text style={{ color: theme.background, fontSize: 12 }}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const sections: { title: string; data: any[]; key: ListKey }[] = [
    { title: "Favorites", data: favorites, key: "favorite" },
    { title: "Watched", data: watched, key: "watched" },
    { title: "Want to Watch", data: wantToWatch, key: "watchLater" },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>{section.title}</Text>
          {section.data.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.text }]}>No items here yet.</Text>
          ) : (
            <FlatList
              data={section.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
              renderItem={({ item }) => renderCard(item, section.key)}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 10, marginBottom: 10 },
  emptyText: { fontStyle: "italic", marginLeft: 15 },
  card: { width: 140, marginRight: 10, alignItems: "center", borderRadius: 8, overflow: "hidden" },
  poster: { width: 140, height: 200, borderRadius: 8, marginBottom: 5 },
  movieTitle: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  removeButton: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 4 },
});
