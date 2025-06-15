import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { Ride, RideStatus } from '../../services/models';
import { UserService } from '../../services/user.service';

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
export class RideStatusComponent implements OnInit, OnDestroy {
  @Input() ride: Ride | null = null;
  @Output() rideRemoved = new EventEmitter<void>();

  currentRide: Ride | null = null;
  paymentPollingInterval: any;
  loading = false;

  RideStatus = RideStatus; // for template access

  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.updateRide();
  }

  ngOnDestroy() {
    if (this.paymentPollingInterval) clearInterval(this.paymentPollingInterval);
  }

  ngOnChanges() {
    this.currentRide = this.ride;
  }

  updateRide() {
    if (this.ride) {
      this.currentRide = this.ride;
    } else {
      this.userService.getCurrentRide().subscribe({
        next: (ride) => (this.currentRide = ride),
        error: () => (this.currentRide = null),
      });
    }
  }

  acceptRide() {
    if (!this.currentRide) return;
    this.loading = true;
    this.userService.acceptProposedRide(this.currentRide.rideId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Zaakceptowano',
          detail: 'Zaakceptowano propozycję przejazdu.',
        });
        this.loading = false;
        this.updateRide();
        this.pollForPaymentUrl();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się zaakceptować przejazdu.',
        });
      },
    });
  }

  rejectRide() {
    if (!this.currentRide) return;
    this.loading = true;
    this.userService.rejectProposedRide(this.currentRide.rideId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Odrzucono',
          detail: 'Odrzucono propozycję przejazdu.',
        });
        this.loading = false;
        this.rideRemoved.emit();
        this.currentRide = null;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się odrzucić przejazdu.',
        });
      },
    });
  }

  cancelRide() {
    if (!this.currentRide) return;
    this.loading = true;
    this.userService.cancelRide(this.currentRide.rideId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Anulowano',
          detail: 'Przejazd został anulowany.',
        });
        this.loading = false;
        this.rideRemoved.emit();
        this.currentRide = null;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się anulować przejazdu.',
        });
      },
    });
  }

  pollForPaymentUrl() {
    if (!this.currentRide) return;
    if (this.paymentPollingInterval) clearInterval(this.paymentPollingInterval);

    this.paymentPollingInterval = setInterval(() => {
      this.userService.getRidePaymentUrl(this.currentRide!.rideId).subscribe({
        next: (url) => {
          if (url) {
            clearInterval(this.paymentPollingInterval);
            window.location.href = url;
          }
        },
        error: () => {
          // keep polling until available
        },
      });
    }, 2000);
  }

  getStatusLabel(status: RideStatus | null): string {
    switch (status) {
      case RideStatus.NEW:
        return 'Nowy (oczekuje na akceptację)';
      case RideStatus.AWAITING_PAYMENT:
        return 'Oczekuje na płatność';
      case RideStatus.PAYMENT_RECEIVED:
        return 'Płatność otrzymana';
      case RideStatus.AWAITING_DRIVER:
        return 'Oczekuje na kierowcę';
      case RideStatus.IN_PROGRESS:
        return 'W trakcie realizacji';
      case RideStatus.FINISHED:
        return 'Zakończony';
      case RideStatus.CANCELLED:
        return 'Anulowany';
      default:
        return 'Nieznany';
    }
  }
}
