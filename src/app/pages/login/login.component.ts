import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';

@Component({
    selector: 'app-login',
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Expense Management
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Demo accounts:
                    </p>
                    <div class="mt-2 text-center text-sm text-gray-500">
                        <div *ngFor="let user of mockUsers">
                            {{ user.role }}: {{ user.email }}
                        </div>
                    </div>
                </div>
                <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email" class="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                formControlName="email"
                                required
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                            <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors" class="mt-1 text-sm text-red-600">
                                <div *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</div>
                                <div *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email address</div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email" class="sr-only">Password</label>
                            <input
                                id="password"                                
                                name="password"
                                type="password"
                                formControlName="password"
                                required
                                placeholder="Password"
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                    </div> -->

                    <div>
                        <button
                            type="submit"
                            [disabled]="loginForm.invalid || isLoading"
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span class="flex items-center">
                                <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sign in
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
})
export class LoginComponent {
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['',]
    });

    isLoading = false;

    mockUsers = [
        { role: 'Employee', email: 'balaji.pagadala@adjoint.in',password:'Ba@123456' },
        { role: 'Manager', email: 'phani@adjoint.in',password:'Ph@123456' },
        { role: 'Admin', email: 'praveen@adjoint.in',password:'Pr@123456' }
    ];

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private baseAPI: BaseApiService,
        private expenseService: ExpenseService,
        private authService: AuthService
    ) {}

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.loginForm.get('password')?.setValue(this.mockUsers.find(user => user.email === this.loginForm.get('email')?.value)?.password);
            const body = {...this.loginForm.value};
            
            this.baseAPI.executePost({url: apiDirectory.login, body:body }).subscribe({
                next: (res) => {
                    console.log('Login successful:', res);
                    this.expenseService.login(res).subscribe(user => {
                        console.log(user);
                    });
                    localStorage.setItem('user', JSON.stringify(res));
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    console.error('Login failed:', error);
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
        }
    }
}