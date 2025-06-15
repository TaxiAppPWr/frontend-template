import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-new-ride',
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  templateUrl: './new-ride.component.html',
  styleUrls: ['./new-ride.component.sass'],
})
export class NewRideComponent {
  @Output() rideCreated = new EventEmitter<any>();

  from = '';
  to = '';
  fromSuggestions: { name: string; id: string }[] = [];
  toSuggestions: { name: string; id: string }[] = [];
  fromId: string | null = null;
  toId: string | null = null;
  loading = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  selectSuggestion(
    suggestion: { name: string; id: string },
    field: 'from' | 'to',
  ) {
    if (field === 'from') {
      this.from = suggestion.name;
      this.fromId = suggestion.id;
      this.fromSuggestions = [];
    } else {
      this.to = suggestion.name;
      this.toId = suggestion.id;
      this.toSuggestions = [];
    }
  }

  fetchSuggestions(query: string, field: 'from' | 'to') {
    if (query.length < 3) {
      if (field === 'from') this.fromSuggestions = [];
      else this.toSuggestions = [];
      return;
    }
    this.userService.autocompleteLocations(query).subscribe({
      next: (response) => {
        if (field === 'from') {
          this.fromSuggestions = response.predictions || [];
        } else {
          this.toSuggestions = response.predictions || [];
        }
      },
      error: () => {
        if (field === 'from') this.fromSuggestions = [];
        else this.toSuggestions = [];
      },
    });
  }

  orderRide() {
    if (!this.fromId || !this.toId) return;
    this.loading = true;
    this.userService.requestNewRide(this.fromId, this.toId).subscribe({
      next: (rideProposal) => {
        this.loading = false;
        this.rideCreated.emit(rideProposal);
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się zamówić przejazdu.',
        });
      },
    });
  }
}
