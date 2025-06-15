import { Component, OnInit, OnDestroy } from '@angular/core';
import { DriverService } from '../../services/driver.service';
import { RideStatus } from '../../services/models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrl: './work.component.sass',
})
export class WorkComponent implements OnInit, OnDestroy {
  isWorking = false;
  currentRide: any = null;
  rideProposal: any = null;
  errorMessage = '';
  successMessage = '';
  rideCancelled = false;

  // Subscription objects for cleanup
  private errorSubscription: Subscription | null = null;
  private rideProposalSubscription: Subscription | null = null;
  private rideCancelledSubscription: Subscription | null = null;

  constructor(
    private readonly driverService: DriverService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Check authentication status
    this.driverService
      .getDriverAuthenticationStatus()
      .subscribe((authenticationStatus) => {
        if (authenticationStatus !== 'APPROVED') {
          this.router.navigate(['/driver/authentication']);
        } else {
          // Check if there's an existing ride
          this.loadCurrentRide();
        }
      });

    // Subscribe to error messages
    this.errorSubscription = this.driverService.error$.subscribe((error) => {
      this.errorMessage = error;
      if (this.currentRide == null && this.rideProposal == null) {
        // If there's no current ride or proposal, stop working
        this.stopWorking();
      }

      setTimeout(() => (this.errorMessage = ''), 5000);
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.isWorking) {
      this.stopWorking();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  loadCurrentRide() {
    this.driverService.getCurrentRide().subscribe({
      next: (ride) => {
        if (ride) {
          this.currentRide = ride;
          // If there's a current ride, start working automatically
          if (!this.isWorking) {
            this.startWorking();
          }
        }
      },
      error: (error) => {
        console.error('Błąd pobierania aktualnego przejazdu:', error);
      },
    });
  }

  async startWorking() {
    if (this.driverService.startReporting()) {
      this.isWorking = true;
      this.successMessage = 'Rozpoczęto pracę. Oczekiwanie na zlecenia...';
      setTimeout(() => (this.successMessage = ''), 3000);

      // Subscribe to ride proposals
      this.rideProposalSubscription =
        this.driverService.newRideProposal$?.subscribe((proposal) => {
          this.rideProposal = proposal;
        }) || null;

      // Subscribe to ride cancellations
      this.rideCancelledSubscription =
        this.driverService.rideCancelled$?.subscribe((cancelledRide) => {
          if (
            this.currentRide &&
            cancelledRide.rideId === this.currentRide.rideId
          ) {
            this.rideCancelled = true;
            this.currentRide = null;

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
              this.dismissCancellation();
            }, 10000);
          }
        }) || null;
    }
  }

  dismissCancellation() {
    this.rideCancelled = false;
  }

  stopWorking() {
    if (this.driverService.stopReporting()) {
      this.isWorking = false;
      this.successMessage = 'Zakończono pracę.';
      setTimeout(() => (this.successMessage = ''), 3000);

      // Unsubscribe from ride events
      if (this.rideProposalSubscription) {
        this.rideProposalSubscription.unsubscribe();
        this.rideProposalSubscription = null;
      }

      if (this.rideCancelledSubscription) {
        this.rideCancelledSubscription.unsubscribe();
        this.rideCancelledSubscription = null;
      }
    }
  }

  acceptRide() {
    if (this.rideProposal) {
      this.driverService
        .sendRideConfirmation(this.rideProposal.rideId, true)
        .subscribe({
          next: (response) => {
            this.currentRide = {
              rideId: this.rideProposal.rideId,
              status: RideStatus.AWAITING_DRIVER,
              pickupAddress: this.rideProposal.pickupAddress,
              pickupLatitude: this.rideProposal.pickupLatitude,
              pickupLongitude: this.rideProposal.pickupLongitude,
              dropoffAddress: this.rideProposal.dropoffAddress,
              dropoffLatitude: this.rideProposal.dropoffLatitude,
              dropoffLongitude: this.rideProposal.dropoffLongitude,
              estimatedPrice: this.rideProposal.estimatedPrice,
            };
            this.rideProposal = null;
            this.successMessage =
              'Zaakceptowano zlecenie. Udaj się na miejsce odbioru.';
            setTimeout(() => (this.successMessage = ''), 3000);
          },
          error: (error) => {
            this.errorMessage = 'Błąd podczas akceptacji zlecenia.';
            setTimeout(() => (this.errorMessage = ''), 5000);
          },
        });
    }
  }

  rejectRide() {
    if (this.rideProposal) {
      this.driverService
        .sendRideConfirmation(this.rideProposal.rideId, false)
        .subscribe({
          next: (response) => {
            this.rideProposal = null;
            this.successMessage = 'Odrzucono zlecenie.';
            setTimeout(() => (this.successMessage = ''), 3000);
          },
          error: (error) => {
            this.errorMessage = 'Błąd podczas odrzucenia zlecenia.';
            setTimeout(() => (this.errorMessage = ''), 5000);
          },
        });
    }
  }

  confirmArrival() {
    if (this.currentRide) {
      this.driverService.confirmArrival(this.currentRide.rideId).subscribe({
        next: (response) => {
          this.currentRide.status = RideStatus.IN_PROGRESS;
          this.successMessage = 'Potwierdzono przybycie. Rozpoczęto przejazd.';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error) => {
          this.errorMessage = 'Błąd podczas potwierdzania przybycia.';
          setTimeout(() => (this.errorMessage = ''), 5000);
        },
      });
    }
  }

  finishRide() {
    if (this.currentRide) {
      this.driverService.finishRide(this.currentRide.rideId).subscribe({
        next: (response) => {
          this.successMessage = 'Zakończono przejazd.';
          setTimeout(() => (this.successMessage = ''), 3000);
          this.currentRide = null;
        },
        error: (error) => {
          this.errorMessage = 'Błąd podczas kończenia przejazdu.';
          setTimeout(() => (this.errorMessage = ''), 5000);
        },
      });
    }
  }

  isAwaitingDriver(currentRide: any): boolean {
    return currentRide && this.currentRide.status == 'AWAITING_DRIVER';
  }

  isInProgress(currentRide: any): boolean {
    return this.currentRide && this.currentRide.status == 'IN_PROGRESS';
  }
}
