import { Component, OnInit } from '@angular/core';
import {
  EmployeeService,
  PendingVerification,
} from '../../services/employee.service';

@Component({
  selector: 'app-verification',
  imports: [],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.sass',
})
export class VerificationComponent implements OnInit {
  verification: PendingVerification | null = null;

  constructor(private readonly employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadNextVerification();
  }

  approve() {
    if (this.verification) {
      this.employeeService
        .approvePendingVerification(this.verification.id)
        .subscribe({
          next: () => this.loadNextVerification(),
          error: (err) => console.error('Error approving verification:', err),
        });
    }
  }

  reject() {
    if (this.verification) {
      this.employeeService
        .rejectPendingVerification(this.verification.id)
        .subscribe({
          next: () => this.loadNextVerification(),
          error: (err) => console.error('Error rejecting verification:', err),
        });
    }
  }

  private loadNextVerification() {
    this.employeeService.getFirstPendingVerification().subscribe({
      next: (verification) => {
        this.verification = verification;
      },
      error: (err) => {
        if (err.status !== 404) console.error(err);
      },
    });
  }
}
