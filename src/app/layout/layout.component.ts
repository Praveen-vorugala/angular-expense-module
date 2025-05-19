import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-layout',
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav mode="side" opened class="w-64 bg-white shadow-lg">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <span class="text-xl font-bold text-gray-800">Expense Management</span>
          </div>
        </div>
        <mat-nav-list class="py-2">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Dashboard</span>
          </a>
          <a mat-list-item routerLink="/submit-expense" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Submit Expense</span>
          </a>
          <a mat-list-item routerLink="/approve-expenses" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Approve Expenses</span>
          </a>
          <a mat-list-item routerLink="/policies" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Policies</span>
          </a>
          <a mat-list-item routerLink="/expense-types" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Expense Types</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Reports</span>
          </a>
          <a mat-list-item routerLink="/dropdown-types" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">Dropdown Types</span>
          </a>
          <a mat-list-item routerLink="/user-properties" routerLinkActive="active" class="hover:bg-gray-50">
            <span class="text-gray-700">User Properties</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="flex justify-between shadow-md">
          <div class="flex items-center">
            <button mat-icon-button (click)="sidenav.toggle()" class="text-white">
              <mat-icon class="menu"></mat-icon>
            </button>
            <span class="ml-4 text-lg font-medium">Dashboard</span>
          </div>
          <div class="flex items-center space-x-4">
            <button mat-button (click)="logout()" class="text-white">
              Logout
            </button>
          </div>
        </mat-toolbar>

        <div class="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background-color: rgba(79, 70, 229, 0.1) !important;
      color: #4f46e5 !important;
    }
    .active mat-icon {
      color: #4f46e5 !important;
    }
    .mat-mdc-list-item {
      height: 48px !important;
    }
    .mat-mdc-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class LayoutComponent {
  constructor(
    private router: Router,
    private expenseService: ExpenseService
  ) {}

  logout(): void {
    this.expenseService.logout();
    this.router.navigate(['/login']);
  }
} 