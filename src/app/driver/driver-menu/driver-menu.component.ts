import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../services/driver.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-menu',
  imports: [],
  templateUrl: './driver-menu.component.html',
  styleUrl: './driver-menu.component.sass',
})
export class DriverMenuComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly driverService: DriverService,
  ) {}

  ngOnInit() {
    this.driverService
      .getDriverAuthenticationStatus()
      .subscribe((authenticationStatus) => {
        if (authenticationStatus !== 'APPROVED') {
          this.router.navigate(['/driver/authentication']);
        }
      });
  }

  goToRides() {
    this.router.navigate(['/driver/rides']);
  }

  goToAccount() {
    this.router.navigate(['/driver/account']);
  }
}
