import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';
import { ExpenseService } from './expense.service';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {
  public token:string ='';

  constructor(
    private expenseService: ExpenseService,
  ) {
    
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.expenseService.currentUser$.pipe(
      take(1),
      map((user:any) => {
        console.log("Interceptor",user);
        
       this.token = user.token
      }))
   const modifiedReq = request.clone({
      headers: request.headers.set('Authorization', 'Token '+ this.token),
    });
    return next.handle(this.token? modifiedReq:request);
  }
}
