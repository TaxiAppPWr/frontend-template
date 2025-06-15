// notification.component.ts
import {Component, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../services/messaging.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.sass',
})
export class NotificationComponent implements OnInit, OnDestroy {
  unsubscribe: Subscription | null = null;
  notification: any = null;
  showNotification = false;
  private timeout: any;

  constructor(
    private messagingService: MessagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.messagingService.init();
    if (this.messagingService.message$) {
      this.unsubscribe = this.messagingService.message$.subscribe((message) => {
        if (message) {
          console.log('Received Notification:', message);
          this.notification = message;
          this.showNotification = true;

          this.cdr.detectChanges(); // <-- Add this line
          // Auto-hide after 5 seconds
          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
            this.closeNotification();
          }, 5000);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe.unsubscribe();
    }
    clearTimeout(this.timeout);
  }

  closeNotification(): void {
    this.showNotification = false;
    this.cdr.detectChanges();
  }
}
