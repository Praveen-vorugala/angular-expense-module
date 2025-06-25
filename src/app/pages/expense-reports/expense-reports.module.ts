import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseReportsComponent } from './expense-reports.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { appCommonsModule } from 'src/app/commons/commons.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [ExpenseReportsComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        appCommonsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExpenseReportsComponent
            }
        ])
    ]
})
export class ExpenseReportsModule { } 