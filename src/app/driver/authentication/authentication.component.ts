import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DriverService} from "../../services/driver.service";

@Component({
  selector: 'app-authentication',
  imports: [],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.sass'
})
export class AuthenticationComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly driverService: DriverService,
  ) {}

  ngOnInit() {
    this.driverService
      .getDriverAuthenticationStatus()
      .subscribe((authenticationStatus) => {
        if (authenticationStatus === 'APPROVED') {
          this.router.navigate(['/driver']);
        }
      });
  }

}
