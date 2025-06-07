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

interface AccountStatus {
  balance: number;
  currency: string;
}

interface RideProposal {
  id: string;
  passengerName: string;
  pickupLocation: string;
  destination: string;
}

interface RideCancelled {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private reporting = false;
  private hasRide = false;

  private reportingSub: Subscription | undefined = undefined;

  public error$: Subject<string> = new Subject<string>();

  public rideCancelled$: Observable<any> | undefined = undefined;
  public newRideProposal$: Observable<any> | undefined = undefined;

  constructor(
    private readonly websocket: WebsocketService,
    private http: HttpClient,
  ) {}

  getDriverAuthenticationStatus(): Observable<string> {
    return this.http
      .get<{
        success: boolean;
        data: { status: string };
      }>(`${environment.backendUrl}/api/driver-auth/status`)
      .pipe(map((response) => response.data.status));
  }

  public startReporting(): boolean {
    if (!navigator.geolocation) {
      this.error$.next(
        'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.',
      );
      return false;
    }
    this.websocket.connect();
    if (this.websocket.getObservable()) {
      this.newRideProposal$ = this.websocket
        .getObservable()!
        .pipe(filter((event) => event.type === 'ride_proposal'));
      this.rideCancelled$ = this.websocket
        .getObservable()!
        .pipe(filter((event) => event.type === 'ride_cancelled'));

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
    } else {
      this.error$.next('Nie udało się połączyć z serwerem.');
      return false;
    }
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
    console.log('Wywoływany endpoint: balance');
    return this.http
      .get<{
        success: boolean;
        data: AccountStatus;
      }>(`${environment.backendUrl}/api/paycheck/balance`)
      .pipe(map((response) => response.data));
  }

  public getCurrentRide(): Observable<any> {
    // TODO: Implement when backend is ready
    return this.http.get(`${environment.backendUrl}/api/ride/current`);
  }

  public sendRideConfirmation(
    rideId: number,
    accepted: boolean,
  ): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/matching/confirm`,
      JSON.stringify({
        rideId: rideId,
        accepted: accepted,
      }),
    );
  }

  public confirmArrival(rideId: number): Observable<any> {
    return this.http.post(
      // TODO: Verify url
      `${environment.backendUrl}/api/ride/arrival`,
      JSON.stringify({
        rideId: rideId,
      }),
    );
  }

  public finishRide(rideId: number): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/ride/finish`,
      JSON.stringify({
        rideId: rideId,
      }),
    );
  }

  private sendLocation(position: GeolocationPosition) {
    if (
      !this.websocket.sendMessage({
        action: 'position',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    ) {
      console.error('Failed to send position');
      return false;
    }
    return true;
  }
}
