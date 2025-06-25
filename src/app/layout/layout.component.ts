import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../services/expense.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav [mode]="'side'" [opened]="true" [fixedInViewport]="true" 
                   class="bg-white shadow-lg transition-all duration-300"
                   [ngClass]="{'w-64': !isCollapsed, 'w-16': isCollapsed}">
        <div class="p-2 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <button mat-icon-button (click)="toggleSidenav()" class="text-gray-500 hover:bg-gray-100 rounded-full">
              <mat-icon class="text-2xl">{{ isCollapsed ? 'menu_close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>
        <mat-nav-list class="py-2">
          <!-- Dashboard - Visible to all -->
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="hover:bg-gray-50">
            <mat-icon class="text-gray-500">dashboard</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Dashboard</span>
          </a>

          <!-- Submit Expense - Visible to employees -->
          <a mat-list-item routerLink="/submit-expense" routerLinkActive="active" 
             class="hover:bg-gray-50" *ngIf="isEmployee || isManager ">
            <mat-icon class="text-gray-500">receipt</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Submit Expense</span>
          </a>

            <!-- Reports - Visible to employees -->
          <a mat-list-item routerLink="/reports" routerLinkActive="active" 
             class="hover:bg-gray-50" *ngIf="isEmployee ||isManager ">
            <mat-icon class="text-gray-500">check_circle</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Reports</span>
          </a>

          <a mat-list-item routerLink="/expense-report-approval" routerLinkActive="active" 
             class="hover:bg-gray-50" *ngIf="isAdmin ||isManager ">
            <mat-icon class="text-gray-500">check_circle</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Approve Expenses</span>
          </a>

          <!-- Approve Expenses - Visible to managers and admins -->
          <!-- <a mat-list-item routerLink="/approve-expenses" routerLinkActive="active" 
             class="hover:bg-gray-50" *ngIf="isManager ">
            <mat-icon class="text-gray-500">check_circle</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Approve Expenses</span>
          </a> -->

          <!-- Policies - Visible only to admins -->
          <a mat-list-item routerLink="/policies" routerLinkActive="active" 
             class="hover:bg-gray-50" *ngIf="isAdmin">
            <mat-icon class="text-gray-500">policy</mat-icon>
            <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Policies</span>
          </a>

          <!-- Admin only options -->
          <ng-container *ngIf="isAdmin">
            <a mat-list-item routerLink="/expense-types" routerLinkActive="active" class="hover:bg-gray-50">
              <mat-icon class="text-gray-500">category</mat-icon>
              <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Expense Types</span>
            </a>
            <a mat-list-item routerLink="/reports" routerLinkActive="active" class="hover:bg-gray-50">
              <mat-icon class="text-gray-500">assessment</mat-icon>
              <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Reports</span>
            </a>
            <a mat-list-item routerLink="/dropdown-types" routerLinkActive="active" class="hover:bg-gray-50">
              <mat-icon class="text-gray-500">list</mat-icon>
              <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">Dropdown Types</span>
            </a>
            <a mat-list-item routerLink="/user-properties" routerLinkActive="active" class="hover:bg-gray-50">
              <mat-icon class="text-gray-500">person</mat-icon>
              <span class="ml-3 text-gray-700" *ngIf="!isCollapsed">User Properties</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="transition-all duration-300" [ngClass]="{'ml-64': !isCollapsed, 'ml-16': isCollapsed}">
        <mat-toolbar class="flex justify-between shadow-md bg-indigo-700 text-white sticky top-0;">
          <div class="flex items-center">
            <!-- <img src="assets/logo.png" alt="Logo" class="h-8 w-8 mr-4"> -->
            <span class="text-lg font-medium">Expense Management</span>
          </div>
          <div class="flex items-center space-x-4">
            <button mat-button (click)="logout()" class="text-white hover:bg-white/10">
              <mat-icon class="mr-2">logout</mat-icon>
              <span>Logout</span>
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
      padding: 0 16px !important;
    }
    .mat-mdc-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    mat-sidenav {
      transition: width 0.3s ease;
    }
    mat-sidenav-content {
      transition: margin-left 0.3s ease;
    }
    .mat-icon-button {
      width: 40px !important;
      height: 40px !important;
      line-height: 40px !important;
    }
    .mat-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      line-height: 24px !important;
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  isAdmin = false;
  isManager = false;
  isEmployee = false;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private expenseService: ExpenseService
  ) {}

  ngOnInit() {
    this.userSubscription = this.expenseService.currentUser$.subscribe((user:any) => {
      if (user) {
        this.isAdmin = user.user.role.code === 'ADMIN';
        this.isManager = user.user.role.code === 'MANAGER';
        this.isEmployee = user.user.role.code === 'EMPLOYEE';
      } else {
        this.isAdmin = false;
        this.isManager = false;
        this.isEmployee = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidenav(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.expenseService.logout();
    this.router.navigate(['/login']);
  }
} 