import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserPropertiesComponent } from './user-properties.component';

@NgModule({
    declarations: [UserPropertiesComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: UserPropertiesComponent
            }
        ])
    ]
})
export class UserPropertiesModule { } 