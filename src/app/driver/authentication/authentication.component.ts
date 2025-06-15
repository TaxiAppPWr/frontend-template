import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverAuthData } from '../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {DriverService} from "../../services/driver.service";

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.sass',
})
export class AuthenticationComponent implements OnInit {
  driverData: DriverAuthData = {
    driverLicenceNumber: '',
    registrationDocumentNumber: '',
    plateNumber: '',
    pesel: '',
    address: {
      street: '',
      buildingNumber: '',
      apartmentNumber: null,
      postCode: '',
      city: '',
      country: 'PL',
    },
  };

  driverLicenseFrontPhoto: File | null = null;
  driverLicenseBackPhoto: File | null = null;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  authStatus = 'WAITING_FOR_SUBMIT';
  isCancelling = false;

  constructor(
    private readonly router: Router,
    private readonly driverService: DriverService,
  ) {}

  ngOnInit() {
    this.loadAuthenticationStatus();
  }

  loadAuthenticationStatus() {
    this.driverService
      .getDriverAuthenticationStatus()
      .subscribe((authenticationStatus) => {
        this.authStatus = authenticationStatus;
        if (authenticationStatus === 'APPROVED') {
          this.router.navigate(['/driver']);
        }
      });
  }

  onFrontPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.driverLicenseFrontPhoto = input.files[0];
    }
  }

  onBackPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.driverLicenseBackPhoto = input.files[0];
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.driverLicenseFrontPhoto || !this.driverLicenseBackPhoto) {
      this.errorMessage = 'Proszę wgrać oba zdjęcia prawa jazdy';
      return;
    }

    this.isSubmitting = true;

    this.driverService
      .submitDriverAuthentication(
        this.driverData,
        this.driverLicenseFrontPhoto,
        this.driverLicenseBackPhoto,
      )
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage =
            'Wniosek uwierzytelniający został przesłany pomyślnie. Proszę czekać na zatwierdzenie.';
          this.loadAuthenticationStatus(); // Reload status after submission
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage =
            error.message ||
            'Nie udało się przesłać wniosku uwierzytelniającego';
        },
      });
  }

  onCancelAuthentication(): void {
    this.isCancelling = true;
    this.errorMessage = '';

    this.driverService.cancelDriverAuthentication().subscribe({
      next: () => {
        this.isCancelling = false;
        this.authStatus = 'CANCELLED';
        this.successMessage = 'Wniosek uwierzytelniający został anulowany.';
        this.loadAuthenticationStatus(); // Reload status after cancellation
      },
      error: (error) => {
        this.isCancelling = false;
        this.errorMessage = error.message || 'Nie udało się anulować wniosku uwierzytelniającego';
      }
    });
  }

  getStatusColorClass(): string {
    switch(this.authStatus) {
      case 'PENDING_AUTO_VERIFICATION':
      case 'PENDING_MANUAL_VERIFICATION':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'APPROVED':
        return 'bg-green-100 border-green-400 text-green-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  }

  getStatusLabel(): string {
    switch(this.authStatus) {
      case 'WAITING_FOR_SUBMIT':
        return 'OCZEKIWANIE NA ZŁOŻENIE WNIOSKU';
      case 'PENDING_AUTO_VERIFICATION':
        return 'WERYFIKACJA AUTOMATYCZNA W TOKU';
      case 'PENDING_MANUAL_VERIFICATION':
        return 'WERYFIKACJA RĘCZNA W TOKU';
      case 'APPROVED':
        return 'ZATWIERDZONO';
      case 'REJECTED':
        return 'ODRZUCONO';
      case 'CANCELLED':
        return 'ANULOWANO';
      default:
        return 'NIEZNANY STATUS';
    }
  }

  getStatusDescription(): string {
    switch(this.authStatus) {
      case 'WAITING_FOR_SUBMIT':
        return 'Proszę wypełnić formularz i przesłać wymagane dokumenty.';
      case 'PENDING_AUTO_VERIFICATION':
        return 'Twój wniosek jest przetwarzany automatycznie. Weryfikacja powinna zakończyć się w ciągu kilku minut.';
      case 'PENDING_MANUAL_VERIFICATION':
        return 'Twój wniosek jest weryfikowany przez naszego pracownika. Może to potrwać do 24 godzin.';
      case 'APPROVED':
        return 'Twój wniosek został zatwierdzony. Możesz rozpocząć pracę jako kierowca.';
      case 'REJECTED':
        return 'Twój wniosek został odrzucony. Sprawdź poprawność danych i spróbuj ponownie.';
      case 'CANCELLED':
        return 'Twój wniosek został anulowany.';
      default:
        return '';
    }
  }

  shouldShowCancelButton(): boolean {
    return this.authStatus === 'PENDING_AUTO_VERIFICATION' ||
           this.authStatus === 'PENDING_MANUAL_VERIFICATION';
  }

  shouldShowForm(): boolean {
    return this.authStatus === 'WAITING_FOR_SUBMIT' ||
           this.authStatus === 'REJECTED' ||
           this.authStatus === 'CANCELLED';
  }
}
