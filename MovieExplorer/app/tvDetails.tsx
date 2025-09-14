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

export default function TVDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const [tvShow, setTvShow] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<ListKey, boolean>>({
    favorite: false,
    watched: false,
    watchLater: false,
  });

  const fetchTVDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
      );
      const data = await res.json();
      setTvShow(data);

      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${API_KEY}&language=en-US`
      );
      const creditsData = await creditsRes.json();
      setCast(creditsData.cast?.slice(0, 10) || []);

      // Firestore: check if TV show is in user lists
      const user: UserModel | null = await getUserDoc();
      setStatus({
        favorite: user?.favoriteList?.tv?.includes(data.id.toString()) ?? false,
        watched: user?.watchedList?.tv?.includes(data.id.toString()) ?? false,
        watchLater: user?.watchLaterList?.tv?.includes(data.id.toString()) ?? false,
      });
    } catch (error) {
      console.error("Error fetching TV details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTVDetails();
  }, [fetchTVDetails]);

  const updateLists = async (tvShow: any, updates: Record<ListKey, boolean>) => {
    const type: "tv" = "tv";
    const promises: Promise<void>[] = [];

    for (const key of ["favorite", "watched", "watchLater"] as ListKey[]) {
      const shouldAdd = updates[key];
      if (shouldAdd) {
        promises.push(addItemToList(tvShow.id.toString(), key, type));
      } else {
        promises.push(removeItemFromList(tvShow.id.toString(), key, type));
      }
    }

    await Promise.all(promises);
  };

  const toggleList = async (key: ListKey) => {
    if (!tvShow) return;

    let updated = { ...status, [key]: !status[key] };

    // Rules: only one active list at a time
    if (key === "favorite" && updated.favorite) {
      updated.watched = true;
      updated.watchLater = false;
    } else if (key === "watched") {
      if (updated.watched) updated.watchLater = false;
      else updated.favorite = false;
    } else if (key === "watchLater" && updated.watchLater) {
      updated.favorite = false;
      updated.watched = false;
    }

    try {
      await updateLists(tvShow, updated);
      setStatus(updated);
    } catch (err) {
      console.error("Failed to update lists:", err);
    }
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading TV details...</Text>
      </View>
    );

  if (!tvShow)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>TV show not found.</Text>
      </View>
    );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w780${tvShow.backdrop_path}` }}
        style={styles.backdrop}
      />

      <View style={styles.infoSection}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` }}
          style={[styles.poster, { borderColor: theme.text }]}
        />
        <View style={styles.textInfo}>
          <Text style={[styles.title, { color: theme.text }]}>{tvShow.name}</Text>
          <Text style={[styles.meta, { color: theme.text }]}>
            {tvShow.first_air_date?.slice(0, 4)} • {tvShow.episode_run_time?.[0] || "N/A"} min/ep
          </Text>
          <Text style={[styles.meta, { color: theme.text }]}>
            {tvShow.genres?.map((g: any) => g.name).join(", ")}
          </Text>
          <Text style={[styles.rating, { color: tvShow.vote_average > 7 ? "limegreen" : "orange" }]}>
            ⭐ {tvShow.vote_average.toFixed(1)} / 10
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
      <Text style={[styles.overview, { color: theme.text }]}>{tvShow.overview}</Text>

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
