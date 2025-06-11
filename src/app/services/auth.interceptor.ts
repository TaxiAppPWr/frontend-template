import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { fetchAuthSession } from '@aws-amplify/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return from(fetchAuthSession()).pipe(
    switchMap((session) => {
      const headers = req.headers.set(
        'Authorization',
        'Bearer ' + session.tokens?.accessToken.toString(),
      );
      const requestClone = req.clone({
        headers,
      });
      return next(requestClone);
    }),
  );
};
