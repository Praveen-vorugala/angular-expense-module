import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolicyManagementComponent } from './policy-management.component';

@NgModule({
    declarations: [
        PolicyManagementComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: PolicyManagementComponent
            }
        ])
    ],
    exports: [
        PolicyManagementComponent
    ]
})
export class PolicyManagementModule { } 