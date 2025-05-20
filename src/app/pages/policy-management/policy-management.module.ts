import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolicyManagementComponent } from './policy-management.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        PolicyManagementComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatIconModule,
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