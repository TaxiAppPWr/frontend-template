import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import {
  filter,
  map,
  Observable, sampleTime, startWith,
  Subject,
  Subscription,
  tap,
  throttleTime,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import {
  AccountStatus,
  DriverAuthData,
  Ride,
  RideCancelled,
  RideProposal,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private reporting = false;
  private hasRide = false;

  private reportingSub: Subscription | undefined = undefined;

  public error$: Subject<{ msg: string; severe: boolean }> = new Subject<{
    msg: string;
    severe: boolean;
  }>();

  public rideCancelled$: Observable<RideCancelled> | null = null;
  public newRideProposal$: Observable<RideProposal> | null = null;

  constructor(
    private readonly websocket: WebsocketService,
    private http: HttpClient,
  ) {}

  getDriverAuthenticationStatus(): Observable<string> {
    return this.http
      .get<{
        status: string;
      }>(`${environment.backendUrl}/api/driver-auth/status`)
      .pipe(map((response) => response.status));
  }

  public async startReporting(): Promise<boolean> {
    if (!navigator.geolocation) {
      this.error$.next({
        msg: 'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.',
        severe: true,
      });
      return false;
    }
    await this.websocket.connect();
    if (this.websocket.getObservable()) {
      this.websocket.getObservable()?.subscribe({
        error: (err) => {
          console.error('WebSocket error:', err);
          this.error$.next({
            msg: 'Błąd połączenia z serwerem.',
            severe: true,
          });
        },
      });
      this.websocket.getObservable()?.subscribe({
        next: (message) => console.log(message),
      });
      this.newRideProposal$ = this.websocket.getObservable()!.pipe(
        tap((event) => {
          console.log('New ride proposal received:', event);
        }),
        filter((event) => event.eventType === 'RIDE_OFFER'),
        tap((event) => {
          console.log('New ride proposal received:', event);
        }),
      );
      this.rideCancelled$ = this.websocket
        .getObservable()!
        .pipe(filter((event) => event.eventType === 'RIDE_CANCELLED'));
    }

    this.reporting = true;
    this.reportingSub = new Observable<GeolocationPosition>((observer) => {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          observer.next(pos);
        },
        (err) => {
          observer.error(err);
        },
        {
          enableHighAccuracy: true,
        },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    })
      .pipe(sampleTime(10000))
      .subscribe({
        next: (position: GeolocationPosition) => {
          if (!this.sendLocation(position)) {
            this.error$.next({
              msg: 'Nie udało się wysłać pozycji.',
              severe: true,
            });
          }
        },
        error: (error) => {
          this.error$.next({
            msg: `Błąd geolokalizacji: ${error.message}`,
            severe: false,
          });
        },
        complete: () => {
          this.error$.next({
            msg: '',
            severe: true,
          });
        },
      });
    return true;
  }

  public stopReporting(): boolean {
    if (this.hasRide) {
      this.error$.next({
        msg: 'Nie możesz zakończyć pracy w trakcie przejazdu!',
        severe: false,
      });
      return false;
    }
    if (this.reportingSub) {
      this.reportingSub.unsubscribe();
      this.reportingSub = undefined;
    }
    this.websocket.disconnect();
    this.reporting = false;
    return true;
  }

  getAccountStatus(): Observable<AccountStatus> {
    return this.http.get<AccountStatus>(
      `${environment.backendUrl}/api/paycheck/balance`,
    );
  }

  public getCurrentRide(): Observable<Ride> {
    return this.http.get<Ride>(`${environment.backendUrl}/api/ride/driver`);
  }

  public sendRideConfirmation(
    rideId: number,
    accepted: boolean,
  ): Observable<any> {
    return this.http.post(`${environment.backendUrl}/api/matching/confirm`, {
      rideId: rideId,
      accepted: accepted,
    });
  }

  public confirmArrival(rideId: number): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/ride/arrived?rideId=${rideId}`,
      {},
    );
  }

  public finishRide(rideId: number): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/ride/finish?rideId=${rideId}`,
      {},
    );
  }

  private sendLocation(position: GeolocationPosition) {
    if (
      !this.websocket.sendMessage({
        action: 'location-update',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        isActive: true,
      })
    ) {
      console.error('Failed to send position');
      return false;
    }
    return true;
  }

  submitDriverAuthentication(
    driverData: DriverAuthData,
    driverLicenseFrontPhoto: File,
    driverLicenseBackPhoto: File,
  ): Observable<any> {
    const formData = new FormData();

    // Add JSON data as a blob
    const jsonBlob = new Blob([JSON.stringify(driverData)], {
      type: 'application/json',
    });
    formData.append('request', jsonBlob, 'data');

    // Add files
    formData.append(
      'driverLicenseFrontPhoto',
      driverLicenseFrontPhoto,
      driverLicenseFrontPhoto.name,
    );
    formData.append(
      'driverLicenseBackPhoto',
      driverLicenseBackPhoto,
      driverLicenseBackPhoto.name,
    );

    return this.http.post(
      `${environment.backendUrl}/api/driver-auth`,
      formData,
    );
  }

  cancelDriverAuthentication(): Observable<any> {
    return this.http.delete(`${environment.backendUrl}/api/driver-auth`, {});
  }
}
