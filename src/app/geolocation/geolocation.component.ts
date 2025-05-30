import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-geolocation',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './geolocation.component.html',
  styleUrl: './geolocation.component.sass',
})
export class GeolocationComponent {
  position: GeolocationPosition | null = null;
  error: string | null = null;

  getLocation() {
    if (!navigator.geolocation) {
      this.error =
        'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.position = pos;
        this.error = null;
      },
      (err) => {
        this.error = `Błąd: ${err.message}`;
        this.position = null;
      },
      {
        timeout: 10000, //10sek
      },
    );
  }
}
