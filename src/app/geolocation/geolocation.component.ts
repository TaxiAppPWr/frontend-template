import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';

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

interface WebSocketMessage {
  type: string;
  ride?: RideProposal;
  [key: string]: unknown;
}

@Component({
  selector: 'app-geolocation',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, HttpClientModule],
  templateUrl: './geolocation.component.html',
  styleUrl: './geolocation.component.sass',
})
export class GeolocationComponent {
  position: GeolocationPosition | null = null;
  error: string | null = null;
  accountStatus: AccountStatus | null = null;

  tracking = false;
  watchId: number | null = null;

  ws: WebSocketSubject<WebSocketMessage> | null = null;
  currentRide: RideProposal | null = null;
  rideAccepted = false;
  rideArrived = false;
  showRideDialog = false;

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  toggleTracking() {
    if (this.tracking && !this.rideAccepted) {
      this.stopTracking();
    } else if (!this.tracking) {
      this.startTracking();
    }
  }

  startTracking() {
    if (!navigator.geolocation) {
      this.error =
        'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.';
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.position = pos;
        this.error = null;
        this.sendLocation(pos);
      },
      (err) => {
        this.error = `Błąd: ${err.message}`;
        this.position = null;
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      },
    );

    this.tracking = true;
  }

  stopTracking() {
    if (this.rideAccepted) {
      alert('Nie możesz zakończyć pracy w trakcie przejazdu!');
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.tracking = false;
    this.position = null;
  }

  sendLocation(position: GeolocationPosition) {
    const locationData = {
      type: 'location_update',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
    };

    if (this.ws) {
      console.log('Wysyłanie lokalizacji przez WebSocket:', locationData);
      this.ws.next(locationData);
    } else {
      console.warn(
        'WebSocket nie jest połączony. Nie można wysłać lokalizacji.',
      );
    }
  }

  getAccountStatus() {
    console.log('Wywoływany endpoint: balance');
    this.http
      .get<{
        success: boolean;
        data: AccountStatus;
      }>('http://localhost:8080/api/paycheck/balance')
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.accountStatus = response.data;
            console.log('Stan konta:', response.data);
          } else {
            console.warn('Odpowiedź bez danych:', response);
          }
        },
        error: (err) => {
          console.error('Błąd przy pobieraniu stanu konta:', err);
        },
      });
  }

  connectWebSocket() {
    this.ws = new WebSocketSubject<WebSocketMessage>(
      'ws://localhost/ws/driver',
    );

    this.ws.subscribe({
      next: (data) => {
        if (data.type === 'ride_proposal' && data.ride) {
          this.currentRide = data.ride;
          this.showRideDialog = true;
        }
        if (data.type === 'ride_cancelled') {
          this.handleRideCancelled();
        }
      },
      error: (err) => console.error('WebSocket error:', err),
    });
  }

  rejectRide() {
    if (this.currentRide) {
      this.ws?.next({ type: 'ride_reject', rideId: this.currentRide.id });
    }
    this.currentRide = null;
    this.showRideDialog = false;
  }

  confirmArrival() {
    this.rideArrived = true;
    if (this.currentRide) {
      this.ws?.next({ type: 'ride_arrived', rideId: this.currentRide.id });
    }
  }

  handleRideCancelled() {
    alert('Pasażer anulował przejazd.');
    this.currentRide = null;
    this.rideAccepted = false;
    this.rideArrived = false;
  }

  acceptRide() {
    if (!this.currentRide) return;

    const driverId = '';
    const payload = {
      rideId: Number(this.currentRide.id),
      driverId: driverId,
      accepted: true,
    };

    console.log('Wywoływany endpoint: /api/matching/confirm');
    console.log('Payload:', payload);

    this.http
      .post('http://localhost:8080/api/matching/confirm', payload)
      .subscribe({
        next: (res) => {
          this.rideAccepted = true;
          this.showRideDialog = false;
          console.log('Przejazd zaakceptowany (matchingservice):', res);
        },
        error: (err) => {
          console.error('Błąd przy potwierdzaniu przejazdu:', err);
        },
      });
  }

  finishRide() {
    if (!this.currentRide) return;
    console.log('Wywoływany endpoint: finish');
    const driverUsername = '';

    this.http
      .post(`http://localhost:8080/api/ride/finish`, null, {
        params: {
          rideId: this.currentRide.id,
          driverUsername: driverUsername,
        },
      })
      .subscribe({
        next: () => {
          console.log('Przejazd zakończony');
          this.currentRide = null;
          this.rideAccepted = false;
          this.rideArrived = false;
        },
        error: (err) => {
          console.error('Błąd przy kończeniu przejazdu:', err);
        },
      });
  }

  getRideInfo(rideId: number) {
    console.log('Wywoływany endpoint: ride');
    this.http
      .get(`http://localhost:8080/api/ride`, {
        params: { rideId: rideId.toString() },
      })
      .subscribe({
        next: (data) => {
          console.log('Informacje o przejeździe:', data);
        },
        error: (err) => {
          console.error('Błąd przy pobieraniu informacji o przejeździe:', err);
        },
      });
  }
}
