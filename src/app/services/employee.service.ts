import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    return this.http.get<PendingVerification>(
      `${environment.backendUrl}/api/employee/pending-verifications/@first`,
    );
  }

  approvePendingVerification(id: number) {
    return this.http.post<{
      success: boolean;
      data: any;
    }>(
      `${environment.backendUrl}/api/employee/pending-verifications/${id}/approve`,
      {},
    );
  }

  rejectPendingVerification(id: number) {
    return this.http.post<{
      success: boolean;
      data: any;
    }>(
      `${environment.backendUrl}/api/employee/pending-verifications/${id}/reject`,
      {},
    );
  }
}
