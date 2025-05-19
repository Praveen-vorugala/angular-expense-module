import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseApprovalComponent } from './expense-approval.component';

@NgModule({
    declarations: [ExpenseApprovalComponent],
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatCardModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExpenseApprovalComponent
            }
        ])
    ]
})
export class ExpenseApprovalModule { } 