export interface AccountStatus {
  balance: number;
  currency: string;
}

export interface RideProposal {
  driverId: string;
  rideId: number;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  estimatedPrice: number;
  eventType: string;
}

export enum RideStatus {
  NEW,
  AWAITING_PAYMENT,
  PAYMENT_RECEIVED,
  AWAITING_DRIVER,
  IN_PROGRESS,
  FINISHED,
  CANCELLED,
}

export interface RideCancelled {
  driverId: string;
  rideId: number;
  eventType: string;
}

export interface RideRequestResponse {
  rideId: number;
  pickupId: string;
  destinationId: string;
  distance: number;
  duration: number;
  fare: number;
}

export interface Ride {
  rideId: number;
  status: RideStatus;
  pickupId: string;
  destinationId: string;
  distance: number;
  duration: number;
  fare: number;
}

export interface DriverAuthData {
  driverLicenceNumber: string;
  registrationDocumentNumber: string;
  plateNumber: string;
  pesel: string;
  address: {
    street: string;
    buildingNumber: string;
    apartmentNumber: string | null;
    postCode: string;
    city: string;
    country: string;
  };
}

export interface AutocompleteList {
  predictions: { name: string; id: string }[];
}
