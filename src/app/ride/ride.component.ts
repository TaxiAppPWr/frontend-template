import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ride',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './ride.component.html',
  styleUrl: './ride.component.sass',
})
export class RideComponent {
  from = '';
  to = '';
  price: number | null = null;
  showOffer = false;
  showSummary = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
  ) {}

  showPrice() {
    const body = { skad: this.from, dokad: this.to };

    this.http
      .post<{ price: number }>('http://localhost:56/ride/pay', body)
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
            detail: 'Nie udało się pobrać ceny',
          });
        },
      });
  }

  confirm() {
    const body = { skad: this.from, dokad: this.to, cena: this.price };

    this.http
      .post<{ redirectUri: string }>('http://localhost:', body)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Przekierowanie do płatności...',
          });
          window.location.href = response.redirectUri;
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

  cancel() {
    this.showOffer = false;
    this.showSummary = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Anulowano',
      detail: 'Przejazd anulowany',
    });
  }
}
