import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseApprovalComponent } from './expense-approval.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { appCommonsModule } from 'src/app/commons/commons.module';
@NgModule({
    declarations: [ExpenseApprovalComponent],
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        ReactiveFormsModule,
        MatCardModule,
        appCommonsModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExpenseApprovalComponent
            }
        ])
    ]
})
export class ExpenseApprovalModule { } 