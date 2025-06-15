import {Component, OnInit, OnDestroy} from '@angular/core';
import {UserService} from '../../services/user.service';
import {RideStatusComponent} from '../ride-status/ride-status.component';
import {NgIf} from '@angular/common';
import {NewRideComponent} from '../new-ride/new-ride.component';
import {Ride, RideRequestResponse, RideStatus} from "../../services/models";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user',
  imports: [RideStatusComponent, NgIf, NewRideComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.sass',
  providers: [MessageService],
})
export class UserComponent implements OnInit, OnDestroy {
  hasRide = false;
  ride: Ride | null = null;
  private ridePollingInterval: any;

  constructor(private readonly userService: UserService) {}

  ngOnInit() {
    this.getRide();
  }

  ngOnDestroy() {
    if (this.ridePollingInterval) clearInterval(this.ridePollingInterval);
  }

  getRide() {
    this.userService.getCurrentRide().subscribe((ride) => {
      this.hasRide = !!ride;
      this.ride = ride;
      if (this.hasRide && !this.ridePollingInterval) {
        this.ridePollingInterval = setInterval(() => this.updateRide(), 10000);
      }
      if (!this.hasRide && this.ridePollingInterval) {
        clearInterval(this.ridePollingInterval);
        this.ridePollingInterval = null;
      }
    });
  }

  updateRide() {
    if (!this.hasRide) return;
    this.userService.getCurrentRide().subscribe((ride) => {
      this.hasRide = !!ride;
      this.ride = ride;
      if (!this.hasRide && this.ridePollingInterval) {
        clearInterval(this.ridePollingInterval);
        this.ridePollingInterval = null;
      }
    });
  }

  updateFromProposal(proposal: RideRequestResponse) {
    this.ride = {
      status: RideStatus.NEW,
      ...proposal,
    };
    this.hasRide = true;
    if (!this.ridePollingInterval) {
      this.ridePollingInterval = setInterval(() => this.updateRide(), 10000);
    }
  }

  removeRide() {
    this.hasRide = false;
    this.ride = null;
    if (this.ridePollingInterval) {
      clearInterval(this.ridePollingInterval);
      this.ridePollingInterval = null;
    }
  }
}
