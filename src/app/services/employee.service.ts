import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface PendingVerification {
  id: number;
  name: string;
  surname: string;
  driverLicenceNumber: string;
  registrationDocumentNumber: string;
  plateNumber: string;
  driverLicenseFrontPhotoUrl: string;
  driverLicenseBackPhotoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getFirstPendingVerification() {
    return this.http
      .get<{
        success: boolean;
        data: PendingVerification;
      }>(`/api/employee/pending-verifications/@first`)
      .pipe(map((response) => response.data));
  }

  approvePendingVerification(id: number) {
    return this.http.post<{
      success: boolean;
      data: any;
    }>(`/api/employee/pending-verifications/${id}/approve`, {});
  }

  rejectPendingVerification(id: number) {
    return this.http.post<{
      success: boolean;
      data: any;
    }>(`/api/employee/pending-verifications/${id}/reject`, {});
  }
}
