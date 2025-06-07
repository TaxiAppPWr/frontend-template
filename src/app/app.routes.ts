import { Routes } from '@angular/router';
import { DriverMenuComponent } from './driver/driver-menu/driver-menu.component';
import { WorkComponent } from './driver/work/work.component';
import { AccountComponent } from './driver/account/account.component';
import { VerificationComponent } from './employee/verification/verification.component';
import { AuthenticationComponent } from './driver/authentication/authentication.component';
import {UserComponent} from "./user/user/user.component";
import {HomeComponent} from "./home/home.component";

export const routes: Routes = [
  // { path: 'geo', component: GeolocationComponent },
  // { path: 'ride', component: RideComponent },

  { path: '', component: HomeComponent },

  { path: 'admin', component: VerificationComponent },

  { path: 'driver', component: DriverMenuComponent },
  { path: 'driver/rides', component: WorkComponent },
  { path: 'driver/account', component: AccountComponent },
  { path: 'driver/authentication', component: AuthenticationComponent },

  { path: 'user', component: UserComponent },
];
