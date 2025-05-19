import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    template: `
        <div class="p-4">
            <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
            <mat-card>
                <mat-card-content>
                    <p>Welcome to the Expense Management System</p>
                </mat-card-content>
            </mat-card>
        </div>
    `
})
export class DashboardComponent {} 