import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
            },
            {
                path: 'submit-expense',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['EMPLOYEE', 'MANAGER'] },
                loadChildren: () => import('./pages/expense-form/expense-form.module').then(m => m.ExpenseFormModule)
            },
            {
                path: 'submit-expense/:id',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['EMPLOYEE', 'MANAGER'] },
                loadChildren: () => import('./pages/expense-form/expense-form.module').then(m => m.ExpenseFormModule)
            },
            {
                path: 'expense-report-approval',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['EMPLOYEE', 'MANAGER','ADMIN'] },
                loadChildren: () => import('./pages/expense-reports-module/expense-reports-module.module').then(m => m.ExpenseReportsModuleModule)
            },
            {
                path: 'approve-expenses',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['MANAGER','ADMIN'] },
                loadChildren: () => import('./pages/expense-approval/expense-approval.module').then(m => m.ExpenseApprovalModule)
            },
            {
                path: 'policies',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['ADMIN'] },
                loadChildren: () => import('./pages/policy-management/policy-management.module').then(m => m.PolicyManagementModule)
            },
            {
                path: 'expense-types',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['ADMIN'] },
                loadChildren: () => import('./pages/expense-type-management/expense-type-management.module').then(m => m.ExpenseTypeManagementModule)
            },
            {
                path: 'reports',
                canActivate: [AuthGuard],
                data: { allowedRoles: ['ADMIN', 'EMPLOYEE', 'MANAGER'] },
                loadChildren: () => import('./pages/expense-reports/expense-reports.module').then(m => m.ExpenseReportsModule)
            },
            {
                path: 'dropdown-types',
                loadChildren: () => import('./pages/dropdown-types/dropdown-types.module').then(m => m.DropdownTypesModule)
            },
            {
                path: 'user-properties',
                loadChildren: () => import('./pages/user-properties/user-properties.module').then(m => m.UserPropertiesModule)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    // {
    //     path: '**',
    //     redirectTo: 'login'
    // }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
