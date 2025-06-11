import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EmployeeService,
  PendingVerification,
} from '../../services/employee.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.sass',
})
export class VerificationComponent implements OnInit {
  verification: PendingVerification | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private readonly employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadNextVerification();
  }

  approve() {
    if (this.verification) {
      this.isLoading = true;
      this.employeeService
        .approvePendingVerification(this.verification.id)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.loadNextVerification();
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Błąd podczas zatwierdzania: ' + (err.message || 'Nieznany błąd');
            console.error('Error approving verification:', err);
          },
        });
    }
  }

  reject() {
    if (this.verification) {
      this.isLoading = true;
      this.employeeService
        .rejectPendingVerification(this.verification.id)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.loadNextVerification();
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Błąd podczas odrzucania: ' + (err.message || 'Nieznany błąd');
            console.error('Error rejecting verification:', err);
          },
        });
    }
  }

  private loadNextVerification() {
    this.isLoading = true;
    this.errorMessage = '';
    this.employeeService.getFirstPendingVerification().subscribe({
      next: (verification) => {
        this.isLoading = false;
        this.verification = verification;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          // No pending verifications - this is expected
          this.verification = null;
        } else {
          this.errorMessage = 'Błąd podczas ładowania danych: ' + (err.message || 'Nieznany błąd');
          console.error('Error loading verification:', err);
        }
      },
    });
  }
}
