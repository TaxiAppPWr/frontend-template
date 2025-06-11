import { CanActivateFn, Router } from '@angular/router';
import { fetchAuthSession } from '@aws-amplify/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const url = state.url;

  // Determine appropriate login route based on current path
  const getLoginRoute = (currentPath: string): string => {
    if (currentPath.startsWith('/driver')) {
      return '/driver/login';
    } else if (currentPath.startsWith('/admin')) {
      return '/admin/login';
    } else {
      return '/user/login';
    }
  };

  try {
    // Get the current auth session
    const session = await fetchAuthSession();
    const idToken = session?.tokens?.idToken;

    // If no token, not authenticated
    if (!idToken || !idToken.payload) {
      router.navigate([getLoginRoute(url)]);
      return false;
    }

    const tokenClaims = idToken.payload;

    // Route-based authorization
    if (url.startsWith('/user')) {
      // All authenticated users can access /user routes
      return true;
    } else if (url.startsWith('/driver')) {
      // Only users with isDriver attribute can access /driver routes
      const isDriver = tokenClaims['custom:isDriver'] === 'true';

      if (!isDriver) {
        router.navigate(['/user']);
        return false;
      }
      return true;
    } else if (url.startsWith('/admin')) {
      // Only users in the 'employee' group can access /admin routes
      const userGroups = tokenClaims['cognito:groups'] || [];
      const isEmployee =
        Array.isArray(userGroups) && userGroups.includes('employee');

      if (!isEmployee) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }

    // For any other routes, allow if authenticated
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    router.navigate([getLoginRoute(url)]);
    return false;
  }
};
