import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import {
  filter,
  map,
  Observable,
  Subject,
  Subscription, tap,
  throttleTime,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface AccountStatus {
  balance: number;
  currency: string;
}

interface RideProposal {
  driverId: string;
  rideId: number;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  estimatedPrice: number;
  eventType: string;
}

export enum RideStatus {
  NEW,
  AWAITING_PAYMENT,
  PAYMENT_RECEIVED,
  AWAITING_DRIVER,
  IN_PROGRESS,
  FINISHED,
  CANCELLED,
}

export interface Ride {
  rideId: number;
  status: RideStatus;
}

interface RideCancelled {
  driverId: string;
  rideId: number;
  eventType: string;
}

export interface Ride {
  rideId: number;

}

export interface DriverAuthData {
  driverLicenceNumber: string;
  registrationDocumentNumber: string;
  plateNumber: string;
  pesel: string;
  address: {
    street: string;
    buildingNumber: string;
    apartmentNumber: string | null;
    postCode: string;
    city: string;
    country: string;
  };
}

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

  public async startReporting(): Promise<boolean> {
    if (!navigator.geolocation) {
      this.error$.next(
        'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.',
      );
      return false;
    }
    await this.websocket.connect();
    if (await this.websocket.getObservable()) {
      this.newRideProposal$ = (await this.websocket
        .getObservable())!
        .pipe(filter((event) => event.eventType === 'RIDE_OFFER'));
      this.rideCancelled$ = (await this.websocket
        .getObservable())!.pipe(
        filter((event) => event.eventType === 'RIDE_CANCELLED')
      );

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
    return this.http.post(
      `${environment.backendUrl}/api/matching/confirm`,
      {
        rideId: rideId,
        accepted: accepted,
      },
    );
  }

  public confirmArrival(rideId: number): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/ride/arrived?rideId=${rideId}`, {}
    );
  }

  public finishRide(rideId: number): Observable<any> {
    return this.http.post(
      `${environment.backendUrl}/api/ride/finish?rideId=${rideId}`, {}
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
    return this.http.delete(
      `${environment.backendUrl}/api/driver-auth`,
      {},
    );
  }
}
