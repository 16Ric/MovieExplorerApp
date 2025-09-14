// functions/index.js
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

admin.initializeApp();

// =====================
// Simple Test Endpoint
// =====================
exports.helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase V2!");
});

// =====================
// Send Notification to a Single Device
// =====================
exports.sendNotification = onRequest(async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).send({ error: "No device token provided" });

    const message = {
      token,
      notification: {
        title: "🔥 New Trending Movie!",
        body: "Check out the latest trending movies now!",
      },
      data: {
        screen: "/movies",
      },
    };

    const response = await admin.messaging().send(message);
    logger.info("Notification sent:", response);
    res.status(200).send({ success: true, response });
  } catch (error) {
    logger.error("Error sending notification", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// =====================
// Daily Recommendations (8 AM Sydney time)
// =====================
exports.dailyRecommendations = onSchedule(
  "0 8 * * *", // 8 AM every day
  async (event) => {
    const tokens = [];
    const usersSnapshot = await admin.firestore().collection("users").get();
    usersSnapshot.forEach((doc) => {
      const token = doc.data().pushNotifToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: "🎬 Your Daily Picks",
        body: "3 trending movies and 3 trending TV shows await!",
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    logger.info("Daily notifications sent:", response);
  },
  { timeZone: "Australia/Sydney" }
);

// =====================
// Watchlist Reminders (6 PM Sydney time)
// =====================
exports.watchlistReminders = onSchedule(
  "0 18 * * *", // 6 PM
  async (event) => {
    const usersSnapshot = await admin.firestore().collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();
      const token = data.pushNotifToken;
      const watchlist = data.watchLaterList || { movie: [], tv: [] };

      if (!token || (watchlist.movie.length === 0 && watchlist.tv.length === 0)) continue;

      const firstItem = watchlist.movie[0] || watchlist.tv[0];

      const message = {
        notification: {
          title: "🍿 Don’t forget your watchlist",
          body: `Still planning to watch ${firstItem?.title || "something from your list"}?`,
        },
        token,
      };

      await admin.messaging().send(message);
      logger.info(`Watchlist reminder sent to user: ${userDoc.id}`);
    }
  },
  { timeZone: "Australia/Sydney" }
);

// =====================
// New Releases Notification (triggered on new movie added)
// =====================
exports.newReleasesNotification = onDocumentCreated(
  "movies/{movieId}",
  async (event) => {
    const newMovie = event.data;
    const tokens = [];
    const usersSnapshot = await admin.firestore().collection("users").get();

    usersSnapshot.forEach((doc) => {
      const token = doc.data().pushNotifToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: "✨ New Release Alert",
        body: `${newMovie.title} was just added! Don’t miss out.`,
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    logger.info("New release notifications sent:", response);
  }
);
