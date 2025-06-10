// import {
//   Component,
//   AfterViewInit,
//   ViewChild,
//   ElementRef,
//   NgZone,
//   OnInit,
// } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';
// import { HttpClient } from '@angular/common/http';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { HttpClientModule } from '@angular/common/http';

// @Component({
//   selector: 'app-ride',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ButtonModule,
//     ToastModule,
//     HttpClientModule,
//   ],
//   providers: [MessageService],
//   templateUrl: './ride.component.html',
//   styleUrl: './ride.component.sass',
// })
// export class RideComponent implements AfterViewInit, OnInit {
//   from = '';
//   to = '';
//   price: number | null = null;
//   showOffer = false;
//   showSummary = false;

//   rideId: string | null = null;

//   @ViewChild('fromInput') fromInput!: ElementRef;
//   @ViewChild('toInput') toInput!: ElementRef;

//   constructor(
//     private http: HttpClient,
//     private messageService: MessageService,
//     private ngZone: NgZone,
//   ) {}

//   ngOnInit() {
//     this.getRideStatus();
//     setInterval(() => this.getRideStatus(), 10000); //10sek
//   }

//   showPrice() {
//     const body = { skad: this.from, dokad: this.to };

//     this.http
//       .post<{ price: number }>('http://localhost/api/ride/price', body)
//       .subscribe({
//         next: (response) => {
//           this.price = response.price;
//           this.showOffer = true;
//           this.showSummary = false;
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Sukces',
//             detail: 'Cena została pobrana',
//           });
//         },
//         error: (err) => {
//           console.error(err);
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Błąd',
//             detail: 'Nie znaleziono przejazdu',
//           });
//         },
//       });
//   }

//   getRideStatus() {
//     this.http.get<RideStatus>('http://localhost/api/ride/status').subscribe({
//       next: (status) => {
//         this.currentRideStatus = status;
//         this.rideId = status.id;
//       },
//       error: () => {
//         this.currentRideStatus = null;
//       },
//     });
//   }

//   cancelRide() {
//     if (!this.rideId) return;

//     this.http
//       .post(`http://localhost/api/ride/${this.rideId}/cancel`, {})
//       .subscribe({
//         next: () => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Anulowano',
//             detail: 'Przejazd został anulowany',
//           });
//           this.currentRideStatus = null;
//           this.rideId = null;
//         },
//         error: () => {
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Błąd',
//             detail: 'Nie udało się anulować przejazdu',
//           });
//         },
//       });
//   }
// }
