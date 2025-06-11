import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { signUp, SignUpInput, SignUpOutput } from 'aws-amplify/auth';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Hub } from 'aws-amplify/utils';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-login',
  imports: [AmplifyAuthenticatorModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribeHub: any = null;
  readonly services: {
    handleSignUp(input: SignUpInput): Promise<SignUpOutput>;
  };
  constructor(private readonly router: Router,
              private readonly authService: AuthService) {
    this.services = {
      handleSignUp: async (input: SignUpInput): Promise<SignUpOutput> => {
        const { username, password, options } = input;
        const attributes = options?.userAttributes;

        const customAttributes = {
          ...attributes,
          'custom:isDriver': this.isDriverRoute ? 'true' : 'false',
        };

        return signUp({
          username,
          password,
          options: {
            ...options,
            userAttributes: customAttributes,
          },
        });
      },
    };
  }

  // Helper to check the route
  get isDriverRoute(): boolean {
    return this.router.url.startsWith('/driver');
  }

  private routePrefix(): string {
    if (this.router.url.startsWith('/user'))
      return '/user';
    else if (this.router.url.startsWith('/driver'))
      return '/driver';
    else if (this.router.url.startsWith('/admin'))
      return '/admin';
    return '/';
  }

  ngOnInit() {
    this.authService.isAuthenticated().then((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate([this.routePrefix()]);
      }
    });
    this.unsubscribeHub = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        this.router.navigate([this.routePrefix()]);
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeHub) {
      this.unsubscribeHub();
      this.unsubscribeHub = null;
    }
  }


}
