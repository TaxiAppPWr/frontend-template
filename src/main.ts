import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {Amplify} from "aws-amplify";
import {environment} from "./environments/environment";

Amplify.configure(environment.amplifyConfig)

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/firebase-messaging-sw.js');
// }
