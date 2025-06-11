import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../services/driver.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.sass'
})
export class AccountComponent implements OnInit {
  balance: number | null = null;
  currency: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadAccountBalance();
  }

  loadAccountBalance(): void {
    this.isLoading = true;
    this.driverService.getAccountStatus().subscribe({
      next: (accountStatus) => {
        this.balance = accountStatus.balance;
        this.currency = accountStatus.currency;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching account balance', err);
        this.error = 'Nie udało się pobrać informacji o saldzie konta.';
        this.isLoading = false;
      }
    });
  }
}
