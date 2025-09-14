import { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemeContext } from "../contexts/theme-context";
import { getUserDoc, addItemToList, removeItemFromList } from "../services/userService";
import { UserModel } from "../models/User";

const API_KEY = "0e6afe4a2d64477dd43060979e71b616";

type ListKey = "favorite" | "watched" | "watchLater";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<ListKey, boolean>>({
    favorite: false,
    watched: false,
    watchLater: false,
  });

  const fetchMovieDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
      );
      const data = await res.json();
      setMovie(data);

      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=en-US`
      );
      const creditsData = await creditsRes.json();
      setCast(creditsData.cast?.slice(0, 10) || []);

      // Fetch user lists from Firestore
      const user: UserModel | null = await getUserDoc();
      const isFavorite = user?.favoriteList?.movie?.includes(data.id.toString()) ?? false;
      const isWatched = user?.watchedList?.movie?.includes(data.id.toString()) ?? false;
      const isWatchLater = user?.watchLaterList?.movie?.includes(data.id.toString()) ?? false;

      setStatus({ favorite: isFavorite, watched: isWatched, watchLater: isWatchLater });
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  const updateLists = async (movie: any, updates: Record<ListKey, boolean>) => {
    const type: "movie" = "movie"; // currently only handling movies
    const promises: Promise<void>[] = [];

    for (const key of ["favorite", "watched", "watchLater"] as ListKey[]) {
      const shouldAdd = updates[key];
      if (shouldAdd) {
        promises.push(addItemToList(
          movie.id.toString(),
          key,
          type
        ));
      } else {
        promises.push(removeItemFromList(movie.id.toString(), key, type));
      }
    }

    await Promise.all(promises);
  };

  const toggleList = async (key: ListKey) => {
    if (!movie) return;

    let updated = { ...status, [key]: !status[key] };

    if (key === "favorite" && updated.favorite) {
      updated.watched = true;
      updated.watchLater = false;
    } else if (key === "watched") {
      if (updated.watched) {
        updated.watchLater = false;
      } else {
        updated.favorite = false;
      }
    } else if (key === "watchLater" && updated.watchLater) {
      updated.favorite = false;
      updated.watched = false;
    }

    try {
      await updateLists(movie, updated);
      setStatus(updated);
    } catch (err) {
      console.error("Failed to update lists:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading movie details...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Movie not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }}
        style={styles.backdrop}
      />

      <View style={styles.infoSection}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={[styles.poster, { borderColor: theme.text }]}
        />
        <View style={styles.textInfo}>
          <Text style={[styles.title, { color: theme.text }]}>{movie.title}</Text>
          <Text style={[styles.meta, { color: theme.text }]}>
            {movie.release_date?.slice(0, 4)} • {movie.runtime} min
          </Text>
          <Text style={[styles.meta, { color: theme.text }]}>
            {movie.genres?.map((g: any) => g.name).join(", ")}
          </Text>
          <Text style={[styles.rating, { color: movie.vote_average > 7 ? "limegreen" : "orange" }]}>
            ⭐ {movie.vote_average.toFixed(1)} / 10
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: status.favorite ? theme.accent : theme.card }]}
              onPress={() => toggleList("favorite")}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>
                {status.favorite ? "❤️ Favorited" : "🤍 Favorite"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: status.watched ? theme.accent : theme.card }]}
              onPress={() => toggleList("watched")}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>
                {status.watched ? "✔️ Watched" : "▶️ Mark Watched"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: status.watchLater ? theme.accent : theme.card }]}
              onPress={() => toggleList("watchLater")}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>
                {status.watchLater ? "⏳ Saved" : "➕ Watch Later"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Overview</Text>
      <Text style={[styles.overview, { color: theme.text }]}>{movie.overview}</Text>

      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Cast</Text>
      <FlatList
        data={cast}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.castCard}>
            <Image
              source={{
                uri: item.profile_path
                  ? `https://image.tmdb.org/t/p/w200${item.profile_path}`
                  : "https://via.placeholder.com/80x120.png?text=No+Image",
              }}
              style={styles.castImage}
            />
            <Text style={[styles.castName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.castRole, { color: theme.text }]} numberOfLines={1}>
              {item.character}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: { width: "100%", height: 220, opacity: 0.8 },
  infoSection: { flexDirection: "row", padding: 15, marginTop: -80 },
  poster: { width: 120, height: 180, borderRadius: 10, marginRight: 15, borderWidth: 2 },
  textInfo: { flex: 1, justifyContent: "flex-end" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  meta: { fontSize: 14, marginBottom: 5 },
  rating: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  buttonsRow: { marginTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginVertical: 5 },
  btnText: { fontWeight: "600", textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10, paddingHorizontal: 15 },
  overview: { fontSize: 14, paddingHorizontal: 15, lineHeight: 20 },
  castCard: { width: 100, marginRight: 10, alignItems: "center" },
  castImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 5 },
  castName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  castRole: { fontSize: 11, textAlign: "center" },
});
