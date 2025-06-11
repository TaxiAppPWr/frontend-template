import { Injectable } from '@angular/core';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logout() {
    return signOut();
  }

  isAuthenticated(): Promise<boolean> {
    return getCurrentUser()
      .catch(() => false)
      .then((user) => !!user);
  }
}
