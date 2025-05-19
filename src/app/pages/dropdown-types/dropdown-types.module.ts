import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DropdownTypesComponent } from './dropdown-types.component';

@NgModule({
    declarations: [DropdownTypesComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: DropdownTypesComponent
            }
        ])
    ]
})
export class DropdownTypesModule { } 