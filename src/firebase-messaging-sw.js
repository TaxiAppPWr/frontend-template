import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-sw.js";

// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');



initializeApp({
  apiKey: '<!--# echo var="firebase_api_key" -->',
  authDomain: '<!--# echo var="firebase_auth_domain" -->',
  projectId: '<!--# echo var="firebase_project_id" -->',
  storageBucket: '<!--# echo var="firebase_storage_bucket" -->',
  messagingSenderId: '<!--# echo var="firebase_messaging_sender_id" -->',
  appId: '<!--# echo var="firebase_app_id" -->',
  measurementId: '<!--# echo var="firebase_measurement_id" -->'
});

const messaging = getMessaging();

onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
