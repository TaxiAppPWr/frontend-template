import { Component, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-new-ride',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    HttpClientModule,
  ],
  templateUrl: './new-ride.component.html',
  styleUrls: ['./new-ride.component.sass'],
})
export class NewRideComponent {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private ngZone: NgZone,
  ) {}

  rideId: string | null = null;
  from = '';
  to = '';
  fromSuggestions: string[] = [];
  toSuggestions: string[] = [];
  passengerUsername = '';
  price: number | null = null;
  showOffer = false;
  showSummary = false;

  selectSuggestion(suggestion: string, field: 'from' | 'to') {
    if (field === 'from') {
      this.from = suggestion;
      this.fromSuggestions = [];
    } else {
      this.to = suggestion;
      this.toSuggestions = [];
    }
  }

  fetchSuggestions(query: string, field: 'from' | 'to') {
    if (query.length < 3) {
      if (field === 'from') this.fromSuggestions = [];
      else this.toSuggestions = [];
      return;
    }

    this.http
      .get<string[]>('http://localhost/api/autocomplete', {
        params: { input: query },
      })
      .subscribe({
        next: (response) => {
          if (field === 'from') {
            this.fromSuggestions = response;
          } else {
            this.toSuggestions = response;
          }
        },
        error: (err) => {
          console.error(err);
        },
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

  cancelRide() {
    this.from = '';
    this.to = '';
    this.passengerUsername = '';
    this.price = null;
    this.showOffer = false;
    this.showSummary = false;
    this.rideId = null;

    // TODO: Send cancellation request to backend

    this.messageService.add({
      severity: 'info',
      summary: 'Anulowano',
      detail: 'Przejazd został anulowany',
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
