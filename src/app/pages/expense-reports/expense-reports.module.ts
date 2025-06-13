import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseReportsComponent } from './expense-reports.component';
import { ReactiveFormsModule } from '@angular/forms';
import { appCommonsModule } from 'src/app/commons/commons.module';

@NgModule({
    declarations: [ExpenseReportsComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        appCommonsModule,
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