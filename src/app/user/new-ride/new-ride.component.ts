import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-new-ride',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    HttpClientModule,
  ],
  templateUrl: './new-ride.component.html',
  styleUrl: './new-ride.component.sass',
})
export class NewRideComponent implements AfterViewInit {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private ngZone: NgZone,
  ) {}

  rideId: string | null = null;
  from = '';
  to = '';
  passengerUsername = '';
  price: number | null = null;
  showOffer = false;
  showSummary = false;

  @ViewChild('fromInput') fromInput!: ElementRef;
  @ViewChild('toInput') toInput!: ElementRef;

  ngAfterViewInit() {
    this.initAutocomplete(this.fromInput, 'from');
    this.initAutocomplete(this.toInput, 'to');
  }

  initAutocomplete(input: ElementRef, field: 'from' | 'to') {
    const autocomplete = new google.maps.places.Autocomplete(
      input.nativeElement,
      {
        types: ['address'],
        componentRestrictions: { country: 'pl' },
      },
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          this[field] = place.formatted_address;
        }
      });
    });
  }

  showPrice() {
    const body = { skad: this.from, dokad: this.to };

    this.http
      .post<{ price: number }>('http://localhost/api/ride/price', body)
      .subscribe({
        next: (response) => {
          this.price = response.price;
          this.showOffer = true;
          this.showSummary = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: 'Cena została pobrana',
          });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Nie znaleziono przejazdu',
          });
        },
      });
  }

  confirm() {
    const body = {
      passengerUsername: this.passengerUsername,
      originId: this.from,
      destinationId: this.to,
    };

    this.http
      .post<{ rideId: string }>('http://localhost/api/ride/new', body)
      .subscribe({
        next: (response) => {
          this.rideId = response.rideId;

          this.http
            .get<{ redirectUri: string }>('http://localhost/api/paymentLink', {
              params: { rideId: this.rideId },
            })
            .subscribe({
              next: (paymentResponse) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Potwierdzenie',
                  detail: 'Przekierowanie do płatności...',
                });
                window.location.href = paymentResponse.redirectUri;
              },
              error: (err) => {
                console.error(err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Błąd',
                  detail: 'Nie udało się pobrać linku do płatności',
                });
              },
            });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Nie udało się zapisać przejazdu',
          });
        },
      });
  }
}
