import { Injectable } from '@angular/core';
import { getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { Messaging } from '@angular/fire/messaging';
import { map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  message$: Observable<{ body: string; title: string }> | undefined;

  constructor(
    private readonly msg: Messaging,
    private readonly http: HttpClient,
  ) {}

  init() {
    Notification.requestPermission().then(
      (notificationPermissions: NotificationPermission) => {
        if (notificationPermissions === 'granted') {
          console.log('Granted');
        }
        if (notificationPermissions === 'denied') {
          console.log('Denied');
        }
      },
    );
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', {
        type: 'module',
      })
      .then((serviceWorkerRegistration) => {
        getToken(this.msg, {
          vapidKey: environment.firebaseVapidKey,
          serviceWorkerRegistration: serviceWorkerRegistration,
        }).then((token) => {
          this.http
            .post(`${environment.backendUrl}/api/notification/user/token`, {
              token,
            })
            .subscribe({
              next: (response) => {
                console.log('FCM Token registered successfully', response);
              },
              error: (error) => {
                console.error('Error registering FCM Token', error);
              },
            });
        });
      });

    this.message$ = new Observable((sub) =>
      onMessage(this.msg, (msg) => sub.next(msg)),
    ).pipe(
      tap((msg) => {
        console.log('My Firebase Cloud Message', msg);
      }),
      map((msg: any) => msg.data),
    );
  }
}
