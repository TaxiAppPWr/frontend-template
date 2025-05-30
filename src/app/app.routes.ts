import { Routes } from '@angular/router';
import { GeolocationComponent } from './geolocation/geolocation.component';
import { RideComponent } from './ride/ride.component';

export const routes: Routes = [
  { path: 'geo', component: GeolocationComponent },
  { path: 'ride', component: RideComponent },
];
