import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getCurrentRide() {
    // TODO: Implement when backend is ready
    return this.http
      .get<{ success: boolean; data: any }>(`/api/user/current-ride`)
      .pipe(map((response) => response.data));
  }

  requestNewRide(pickupLocation, destination) {}

  autocompleteLocations(query: string) {
    // TODO: Use maps service for autocompletion
  }

  acceptProposedRide(rideId: number) {}

  rejectProposedRide(rideId: number) {}

  cancelRide() {}

  getRidePaymentUrl(rideId: number) {}
}
