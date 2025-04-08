import { ButtonModule } from 'primeng/button';
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  title = 'angular-template';
  constructor() {
    console.log(environment.exampleEnv);
  }
}
