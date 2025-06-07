import {Component, OnInit} from '@angular/core';
import {DriverService} from "../../services/driver.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-work',
  imports: [],
  templateUrl: './work.component.html',
  styleUrl: './work.component.sass'
})
export class WorkComponent implements OnInit {

  constructor(private readonly driverService: DriverService, private router: Router) {}

  ngOnInit() {
    this.driverService
      .getDriverAuthenticationStatus()
      .subscribe((authenticationStatus) => {
        if (authenticationStatus !== 'APPROVED') {
          this.router.navigate(['/driver/authentication']);
        }
      });
  }

}
