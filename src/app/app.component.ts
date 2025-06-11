import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MessagingService } from './services/messaging.service';
import { NotificationComponent } from './notification/notification.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { getCurrentUser } from 'aws-amplify/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NotificationComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
  userType: 'driver' | 'user' | 'admin' | null = null;
  userEmail: string | null = null;
  authenticated = false;

  constructor(
    protected readonly messaging: MessagingService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  title = 'angular-template';

  ngOnInit() {
    this.messaging.init();

    // Determine user type based on current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.detectUserType(event.url);
      }
    });

    // Initialize with current route
    this.detectUserType(this.router.url);

    getCurrentUser()
      .catch(() => {
        this.authenticated = false;
        this.userEmail = null;
      })
      .then((user) => {
        if (user) {
          this.authenticated = true;
          this.userEmail = user.signInDetails?.loginId || null;
        } else {
          this.authenticated = false;
          this.userEmail = null;
        }
      });
  }

  detectUserType(url: string) {
    if (url.startsWith('/driver')) {
      this.userType = 'driver';
    } else if (url.startsWith('/user')) {
      this.userType = 'user';
    } else if (url.startsWith('/admin')) {
      this.userType = 'admin';
    } else if (url === '/') {
      // Home page, don't show nav
      this.userType = null;
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
      this.userType = null;
      this.userEmail = null;
      this.authenticated = false;
    });
  }
}
