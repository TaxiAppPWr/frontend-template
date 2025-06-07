import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import {MessagingService} from "./services/messaging.service";
import {NotificationComponent} from "./notification/notification.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
  constructor(protected readonly messaging: MessagingService) {
  }
  title = 'angular-template';

  ngOnInit() {
    this.messaging.init()
  }
}
