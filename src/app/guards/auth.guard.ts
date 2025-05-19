import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { ExpenseService } from '../services/expense.service';
import { UserRole } from '../models/expense.model';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private expenseService: ExpenseService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return this.expenseService.currentUser$.pipe(
            take(1),
            map(user => {
                if (!user) {
                    this.router.navigate(['/login']);
                    return false;
                }

                const allowedRoles = route.data['allowedRoles'] as UserRole[];
                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    this.router.navigate(['/']);
                    return false;
                }

                return true;
            })
        );
    }
} 