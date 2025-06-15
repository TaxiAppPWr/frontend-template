import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AutocompleteList, Ride, RideProposal } from './models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getCurrentRide(): Observable<Ride> {
    return this.http.get<Ride>(`${environment.backendUrl}/api/ride/passenger`);
  }

  requestNewRide(
    pickupLocation: string,
    destination: string,
  ): Observable<RideProposal> {
    return this.http.post<RideProposal>(
      `${environment.backendUrl}/api/ride/new?originId=${encodeURIComponent(pickupLocation)}&destinationId=${encodeURIComponent(destination)}`,
      {},
    );
  }

  autocompleteLocations(query: string): Observable<AutocompleteList> {
    return this.http.get<AutocompleteList>(
      `${environment.backendUrl}/api/maps/autocomplete?input=${encodeURIComponent(query)}`,
    );
  }

  acceptProposedRide(rideId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.backendUrl}/api/ride//accept/passenger?rideId=${rideId}`,
      {},
    );
  }

  rejectProposedRide(rideId: number) {
    return this.http.post<void>(
      `${environment.backendUrl}/api/ride/reject/passenger?rideId=${rideId}`,
      {},
    );
  }

  cancelRide(rideId: number) {
    return this.http.post<void>(
      `${environment.backendUrl}/api/ride/cancel?rideId=${rideId}`,
      {},
    );
  }

  getRidePaymentUrl(rideId: number) {
    return this.http
      .get<{
        body: string;
      }>(
        `${environment.backendUrl}/api/passengerPayment/paymentLink?rideId=${rideId}`,
      )
      .pipe(map((response) => response.body));
  }
}
