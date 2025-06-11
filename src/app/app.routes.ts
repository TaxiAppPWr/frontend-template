import { Routes } from '@angular/router';
import { DriverMenuComponent } from './driver/driver-menu/driver-menu.component';
import { WorkComponent } from './driver/work/work.component';
import { AccountComponent } from './driver/account/account.component';
import { VerificationComponent } from './employee/verification/verification.component';
import { AuthenticationComponent } from './driver/authentication/authentication.component';
import { UserComponent } from './user/user/user.component';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from "./login/login.component";
import {authGuard} from "./guards/auth.guard";

export const routes: Routes = [
  // { path: 'geo', component: GeolocationComponent },
  // { path: 'ride', component: RideComponent },

  { path: '', component: HomeComponent },

  { path: 'admin', component: VerificationComponent, canActivate: [authGuard] },
  { path: 'admin/login', component: LoginComponent },

  { path: 'driver', component: DriverMenuComponent, canActivate: [authGuard] },
  { path: 'driver/rides', component: WorkComponent, canActivate: [authGuard] },
  { path: 'driver/account', component: AccountComponent, canActivate: [authGuard] },
  { path: 'driver/authentication', component: AuthenticationComponent, canActivate: [authGuard] },
  { path: 'driver/login', component: LoginComponent },

  { path: 'user', component: UserComponent, canActivate: [authGuard] },
  { path: 'user/login', component: LoginComponent },
];
