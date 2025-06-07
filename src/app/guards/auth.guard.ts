import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // TODO: Implement guard based on JWT and groups
  return true;
};
