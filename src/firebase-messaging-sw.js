import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-sw.js";

// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');



initializeApp({
  apiKey: 'AIzaSyBbXZkOGYK3K8kyxITqcw69UceL7581RYg',
  authDomain: 'taxiapp-pwr.firebaseapp.com',
  projectId: 'taxiapp-pwr',
  storageBucket: 'taxiapp-pwr.firebasestorage.app',
  messagingSenderId: '95786131885',
  appId: '1:95786131885:web:d5f52f73a379cf9b958124',
  measurementId: 'G-YKEBH8HVPW',
});

const messaging = getMessaging();

onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  let data = payload.data || {};
  console.log('[firebase-messaging-sw.js] Received data ', data);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/favicon.ico'
  };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
