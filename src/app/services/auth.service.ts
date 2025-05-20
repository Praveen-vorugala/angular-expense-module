import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  private _isEmployee = new BehaviorSubject<boolean>(false);
  public isEmployee$ = this._isEmployee.asObservable();

  constructor(private router: Router) {
    // Initialize user role from localStorage
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true') {
      this._isAuthenticated.next(true);
      this._isEmployee.next(userRole === 'employee');
    }
  }

  login(email: string): void {
    const isEmployee = email === 'employee@example.com';
    const isManager = email === 'manager@example.com';
    
    // Set authentication status
    this._isAuthenticated.next(true);
    
    // Set role
    if (isEmployee) {
      this._isEmployee.next(true);
      localStorage.setItem('userRole', 'employee');
    } else if (isManager) {
      this._isEmployee.next(false);
      localStorage.setItem('userRole', 'manager');
    } else {
      this._isEmployee.next(false);
      localStorage.setItem('userRole', 'admin');
    }
    
    // Set authentication status in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    
    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this._isAuthenticated.next(false);
    this._isEmployee.next(false);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }

  get isEmployee(): boolean {
    return this._isEmployee.value;
  }

  setEmployeeStatus(isEmployee: boolean): void {
    this._isEmployee.next(isEmployee);
    localStorage.setItem('userRole', isEmployee ? 'employee' : 'admin');
  }
}
