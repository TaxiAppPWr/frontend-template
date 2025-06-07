// notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../services/messaging.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.sass',
})
export class NotificationComponent implements OnInit {
  notification: any = null;
  showNotification = false;
  private timeout: any;

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.messagingService.message$.subscribe((message) => {
      if (message) {
        this.notification = message;
        this.showNotification = true;

        // Auto-hide after 5 seconds
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.closeNotification();
        }, 5000);
      }
    });
  }

  closeNotification(): void {
    this.showNotification = false;
  }
}
