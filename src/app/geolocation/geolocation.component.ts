import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface AccountStatus {
  saldo: number;
  aktywny: boolean;
}

@Component({
  selector: 'app-geolocation',
  standalone: true,
  imports: [CommonModule, ButtonModule, HttpClientModule],
  templateUrl: './geolocation.component.html',
  styleUrl: './geolocation.component.sass',
})
export class GeolocationComponent {
  position: GeolocationPosition | null = null;
  error: string | null = null;
  accountStatus: AccountStatus | null = null;

  tracking = false;
  watchId: number | null = null;

  constructor(private http: HttpClient) {}

  toggleTracking() {
    if (this.tracking) {
      this.stopTracking();
    } else {
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
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.tracking = false;
    this.position = null;
  }

  sendLocation(position: GeolocationPosition) {
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
    };

    this.http.post('https://localhost', locationData).subscribe({
      next: () => console.log('Lokalizacja wysłana pomyślnie.'),
      error: (err) => console.error('Błąd przy wysyłaniu lokalizacji:', err),
    });
  }

  getAccountStatus() {
    this.http.get<AccountStatus>('http://localhost').subscribe({
      next: (data) => {
        this.accountStatus = data;
        console.log('Stan konta:', data);
      },
      error: (err) => {
        console.error('Błąd przy pobieraniu stanu konta:', err);
      },
    });
  }
}
