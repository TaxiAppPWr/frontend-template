export const environment = {
  requireLogin: true,
  production: false,
  backendUrl: 'https://gxmzvkhaic.execute-api.us-east-1.amazonaws.com',
  websocketUrl: 'wss://59kc55gd2f.execute-api.us-east-1.amazonaws.com/$default',
  firebaseVapidKey:
    'BAPByYebs3sr6p5g5oVlp8frTHbNKugNSYLOKHTVWcD-fGha0M4RT8hfZD8KWKOXkKrBBi1IIFWmjXTrM8PHLTA',
  firebaseConfig: {
    apiKey: 'AIzaSyBbXZkOGYK3K8kyxITqcw69UceL7581RYg',
    authDomain: 'taxiapp-pwr.firebaseapp.com',
    projectId: 'taxiapp-pwr',
    storageBucket: 'taxiapp-pwr.firebasestorage.app',
    messagingSenderId: '95786131885',
    appId: '1:95786131885:web:d5f52f73a379cf9b958124',
    measurementId: 'G-YKEBH8HVPW',
  },
  amplifyConfig: {
    aws_project_region: 'us-east-1',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'us-east-1_03Gvlmqhv',
    aws_user_pools_web_client_id: '1s5oq28rgbne7scei3iv5gl6pa',
  },
};
