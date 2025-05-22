import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          const modifiedReq = request.clone({
            headers: request.headers.set('Authorization', 'Token ' + user.token),
          });
          return next.handle(modifiedReq);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return next.handle(request);
  }
}
