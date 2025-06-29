import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ExpenseFormComponent } from './expense-form.component';
import { appCommonsModule } from 'src/app/commons/commons.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [ExpenseFormComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule,
        MatIconModule,
        appCommonsModule,
        RouterModule.forChild([
            {
                path: '',
                component: ExpenseFormComponent
            }
        ])
    ]
})
export class ExpenseFormModule { } 