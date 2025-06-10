import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';

interface RideStatus {
  id: string;
  status:
    | 'oczekujący'
    | 'zaakceptowany'
    | 'w trakcie'
    | 'zakończony'
    | 'anulowany';
  driverName?: string;
}

@Component({
  selector: 'app-ride-status',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    HttpClientModule,
  ],
  templateUrl: './ride-status.component.html',
  styleUrl: './ride-status.component.sass',
})
export class RideStatusComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private ngZone: NgZone,
  ) {}

  currentRideStatus: RideStatus | null = null;
  rideId: string | null = null;

  ngOnInit() {
    this.getRideStatus();
    setInterval(() => this.getRideStatus(), 10000); //10sek
  }

  getRideStatus() {
    this.http.get<RideStatus>('http://localhost/api/ride/status').subscribe({
      next: (status) => {
        this.currentRideStatus = status;
        this.rideId = status.id;
      },
      error: () => {
        this.currentRideStatus = null;
      },
    });
  }

  cancelRide() {
    if (!this.rideId) return;

    this.http
      .post(`http://localhost/api/ride/${this.rideId}/cancel`, {})
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Anulowano',
            detail: 'Przejazd został anulowany',
          });
          this.currentRideStatus = null;
          this.rideId = null;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Nie udało się anulować przejazdu',
          });
        },
      });
  }
}
