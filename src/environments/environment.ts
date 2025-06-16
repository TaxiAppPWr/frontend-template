export const environment = {
  requireLogin: true,
  production: true,
  backendUrl: '<!--# echo var="backend_url" -->',
  websocketUrl: '<!--# echo var="websocket_url" -->/$default',
  firebaseVapidKey: '<!--# echo var="firebase_vapid_key" -->',
  firebaseConfig: {
    apiKey: '<!--# echo var="firebase_api_key" -->',
    authDomain: '<!--# echo var="firebase_auth_domain" -->',
    projectId: '<!--# echo var="firebase_project_id" -->',
    storageBucket: '<!--# echo var="firebase_storage_bucket" -->',
    messagingSenderId: '<!--# echo var="firebase_messaging_sender_id" -->',
    appId: '<!--# echo var="firebase_app_id" -->',
    measurementId: '<!--# echo var="firebase_measurement_id" -->',
  },
  amplifyConfig: {
    aws_project_region: "<!--# echo var='aws_project_region' -->",
    aws_cognito_region: "<!--# echo var='aws_cognito_region' -->",
    aws_user_pools_id: "<!--# echo var='aws_user_pools_id' -->",
    aws_user_pools_web_client_id:
      "<!--# echo var='aws_user_pool_web_client_id' -->",
  },
};
