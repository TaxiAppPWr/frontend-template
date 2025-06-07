import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {RideStatusComponent} from "../ride-status/ride-status.component";
import {NgIf} from "@angular/common";
import {NewRideComponent} from "../new-ride/new-ride.component";

@Component({
  selector: 'app-user',
  imports: [
    RideStatusComponent,
    NgIf,
    NewRideComponent
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.sass'
})
export class UserComponent implements OnInit {
  hasRide = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getCurrentRide().subscribe((ride) => {
      this.hasRide = !!ride
    });
  }
}
