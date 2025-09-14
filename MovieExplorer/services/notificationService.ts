import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from "axios";
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase/firebaseConfig';

export const sendPushNotification = async (
  token: string,
  { title, body, screen }: { title: string; body: string; screen?: string }
) => {
  try {
    const url = "https://us-central1-MOVIEEXPLORER_PROJECT.cloudfunctions.net/sendNotification";

    await axios.post(url, {
      token,
      notification: { title, body },
      data: { screen },
    });
    console.log("Push notification triggered successfully");
  } catch (err) {
    console.error("Error sending push notification:", err);
  }
};

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.warn('Push notifications on web are handled via Firebase Cloud Messaging.');
    return null;
  }

  if (!Constants.isDevice) {
    console.warn('Must use a physical device for push notifications.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for notifications!');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Push notification token:', tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.error('Error registering for push notifications:', err);
    return null;
  }
};

export const requestWebPushToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Web push permission not granted");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
    });

    console.log("Web push token:", token);
    return token;
  } catch (err) {
    console.error("Error getting web push token:", err);
    return null;
  }
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // required for iOS 15+
    shouldShowList: true,   // required for Android 13+ or list-style notifications
  }),
});
