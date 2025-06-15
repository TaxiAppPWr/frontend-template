import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import {
  filter,
  map,
  Observable,
  Subject,
  Subscription,
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

  public error$: Subject<string> = new Subject<string>();

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

  public startReporting(): boolean {
    if (!navigator.geolocation) {
      this.error$.next(
        'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.',
      );
      return false;
    }
    this.websocket.connect().then(() => {
      if (this.websocket.getObservable()) {
        this.websocket.getObservable()?.subscribe({
          error: (err) => {
            console.error('WebSocket error:', err);
            this.error$.next('Błąd połączenia z serwerem.');
          },
        });
        this.newRideProposal$ = this.websocket
          .getObservable()!
          .pipe(filter((event) => event.eventType === 'RIDE_OFFER'));
        this.rideCancelled$ = this.websocket
          .getObservable()!
          .pipe(filter((event) => event.eventType === 'RIDE_CANCELLED'));
      }
    });
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
      .pipe(throttleTime(300000)) // Throttle to every 5 minutes
      .subscribe({
        next: (position: GeolocationPosition) => {
          if (!this.sendLocation(position)) {
            this.error$.next('Nie udało się wysłać pozycji.');
          }
        },
        error: (error) => {
          this.error$.next(`Błąd geolokalizacji: ${error.message}`);
        },
      });
    return true;
  }

  public stopReporting(): boolean {
    if (this.hasRide) {
      this.error$.next('Nie możesz zakończyć pracy w trakcie przejazdu!');
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
