importScripts("https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBl2YX5C7xQ6zlSIsZmLOqOpeyj0e3NGyU",
  authDomain: "movieexplorer-84f8d.firebaseapp.com",
  projectId: "movieexplorer-84f8d",
  storageBucket: "movieexplorer-84f8d.appspot.com",
  messagingSenderId: "454970476761",
  appId: "1:454970476761:web:6ac25d9cbdf570807156c8",
  measurementId: "G-GKNVHFEC3T"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/favicon.ico"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
