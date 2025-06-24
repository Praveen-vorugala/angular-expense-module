import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ExpenseTypeManagementComponent } from './expense-type-management.component';
import { appCommonsModule } from "../../commons/commons.module";

@NgModule({
    declarations: [ExpenseTypeManagementComponent],
    imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    appCommonsModule,
    RouterModule.forChild([
        {
            path: '',
            component: ExpenseTypeManagementComponent
        }
    ]),
    appCommonsModule
]
})
export class ExpenseTypeManagementModule { } 