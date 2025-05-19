import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseReportsComponent } from './expense-reports.component';

@NgModule({
    declarations: [ExpenseReportsComponent],
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatCardModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExpenseReportsComponent
            }
        ])
    ]
})
export class ExpenseReportsModule { } 