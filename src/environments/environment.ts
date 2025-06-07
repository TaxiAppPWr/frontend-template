export const environment = {
  production: true,
  backendUrl: '<!--# echo var="backend_url" -->',
  websocketUrl: '<!--# echo var="websocket_url" -->',
  firebaseVapidKey: '<!--# echo var="firebase_vapid_key" -->',
  firebaseConfig: {
    apiKey: '<!--# echo var="firebase_api_key" -->',
    authDomain: '<!--# echo var="firebase_auth_domain" -->',
    projectId: '<!--# echo var="firebase_project_id" -->',
    storageBucket: '<!--# echo var="firebase_storage_bucket" -->',
    messagingSenderId: '<!--# echo var="firebase_messaging_sender_id" -->',
    appId: '<!--# echo var="firebase_app_id" -->',
    measurementId: '<!--# echo var="firebase_measurement_id" -->'
  },
};
