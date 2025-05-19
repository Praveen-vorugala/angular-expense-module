import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { User } from '../../models/expense.model';

@Component({
    selector: 'app-layout',
    template: `
        <mat-sidenav-container class="h-screen">
            <mat-sidenav #sidenav mode="side" opened class="w-64">
                <mat-nav-list>
                    <a mat-list-item routerLink="/" routerLinkActive="active">
                        <mat-icon>dashboard</mat-icon>
                        <span class="ml-2">Dashboard</span>
                    </a>

                    <ng-container *ngIf="currentUser?.role === 'EMPLOYEE' || currentUser?.role === 'MANAGER'">
                        <a mat-list-item routerLink="/submit-expense" routerLinkActive="active">
                            <mat-icon>add_circle</mat-icon>
                            <span class="ml-2">Submit Expense</span>
                        </a>
                    </ng-container>

                    <ng-container *ngIf="currentUser?.role === 'MANAGER'">
                        <a mat-list-item routerLink="/approve-expenses" routerLinkActive="active">
                            <mat-icon>approval</mat-icon>
                            <span class="ml-2">Approve Expenses</span>
                        </a>
                    </ng-container>

                    <ng-container *ngIf="currentUser?.role === 'ADMIN'">
                        <a mat-list-item routerLink="/policies" routerLinkActive="active">
                            <mat-icon>policy</mat-icon>
                            <span class="ml-2">Policies</span>
                        </a>
                        <a mat-list-item routerLink="/expense-types" routerLinkActive="active">
                            <mat-icon>category</mat-icon>
                            <span class="ml-2">Expense Types</span>
                        </a>
                        <a mat-list-item routerLink="/dropdown-types" routerLinkActive="active">
                            <mat-icon>list</mat-icon>
                            <span class="ml-2">Dropdown Types</span>
                        </a>
                        <a mat-list-item routerLink="/user-properties" routerLinkActive="active">
                            <mat-icon>people</mat-icon>
                            <span class="ml-2">User Properties</span>
                        </a>
                    </ng-container>

                    <a mat-list-item routerLink="/reports" routerLinkActive="active">
                        <mat-icon>assessment</mat-icon>
                        <span class="ml-2">Reports</span>
                    </a>
                </mat-nav-list>
            </mat-sidenav>

            <mat-sidenav-content>
                <mat-toolbar color="primary" class="flex justify-between">
                    <button mat-icon-button (click)="sidenav.toggle()">
                        <mat-icon>menu</mat-icon>
                    </button>
                    <span>Expense Management</span>
                    <div class="flex items-center">
                        <span class="mr-4">{{ currentUser?.name }}</span>
                        <button mat-icon-button (click)="logout()">
                            <mat-icon>exit_to_app</mat-icon>
                        </button>
                    </div>
                </mat-toolbar>

                <div class="p-4">
                    <router-outlet></router-outlet>
                </div>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: [`
        .active {
            background-color: rgba(0, 0, 0, 0.04);
        }
    `]
})
export class LayoutComponent implements OnInit {
    currentUser: User | null = null;

    constructor(
        private expenseService: ExpenseService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.expenseService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    logout(): void {
        this.expenseService.logout();
        this.router.navigate(['/login']);
    }
} 