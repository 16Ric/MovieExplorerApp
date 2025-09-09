import { useState, useContext, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "./theme-context";
import { auth } from "../firebase/firebaseConfig";
import { getUserDoc, removeItemFromList } from "../services/userService";

type ListKey = "favorite" | "watched" | "watchLater";

export default function MyListScreen() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [wantToWatch, setWantToWatch] = useState<any[]>([]);
  const userId = auth.currentUser?.uid;

  // Fetch all lists from Firestore
  const fetchLists = useCallback(async () => {
    if (!userId) return;

    const user = await getUserDoc();
    setFavorites([...(user?.favoriteMovies || []), ...(user?.favoriteTVShows || [])]);
    setWatched([...(user?.watchedMovies || []), ...(user?.watchedTVShows || [])]);
    setWantToWatch([...(user?.watchLaterMovies || []), ...(user?.watchLaterTVShows || [])]);
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Handle remove action
  const handleRemove = async (listKey: ListKey, item: any) => {
    if (!userId) return;
    const type = item.title ? "movie" : "tv"; // Determine if item is movie or TV
    await removeItemFromList(item.id, listKey, type);
    fetchLists();
  };

  // Render each card
  const renderCard = (item: any, listKey: ListKey) => {
    const isMovie = !!item.title;
    const detailPath = isMovie ? "/movieDetails" : "/tvDetails";

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.push({ pathname: detailPath, params: { id: item.id } })}>
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
              keyExtractor={(item) => item.id.toString()}
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
