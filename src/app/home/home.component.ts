import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass',
})
export class HomeComponent {
  constructor(private readonly router: Router) {}

  goToUser() {
    this.router.navigate(['/user']);
  }

  goToDriver() {
    this.router.navigate(['/driver']);
  }
}
