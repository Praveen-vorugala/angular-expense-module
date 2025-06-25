import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseReportsApprovalComponent } from './expense-reports-approval/expense-reports-approval.component';
import { appCommonsModule } from 'src/app/commons/commons.module';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ExpenseReportsApprovalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    appCommonsModule,
    RouterModule.forChild([
        {
            path: '',
            component: ExpenseReportsApprovalComponent
        }
    ])
  ]
})
export class ExpenseReportsModuleModule { }
