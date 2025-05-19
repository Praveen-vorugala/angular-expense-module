import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType, ExpenseCategory } from 'src/app/types/expense';

@Component({
    selector: 'app-expense-type-management',
    template: `
        <div class="p-4">
            <h1 class="text-2xl font-bold mb-6">Expense Type Management</h1>
            <!-- Add New Expense Type Form -->
            <form [formGroup]="expenseTypeForm" (ngSubmit)="onSubmit()" class="mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            formControlName="name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter expense type name"
                        />
                        <div *ngIf="expenseTypeForm.get('name')?.touched && expenseTypeForm.get('name')?.errors" class="mt-1 text-sm text-red-600">
                            <div *ngIf="expenseTypeForm.get('name')?.errors?.['required']">Name is required</div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            formControlName="description"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter description"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            formControlName="category"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="" disabled>Select category</option>
                            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                </div>
                <div class="mt-4">
                    <button
                        type="submit"
                        [disabled]="expenseTypeForm.invalid"
                        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Add Expense Type
                    </button>
                </div>
            </form>

            <!-- Expense Types Cards -->
            <div class="flex flex-col gap-6">
                <div *ngFor="let type of expenseTypes" class="bg-white rounded-lg shadow-md p-6 border border-gray-200 w-full">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">{{ type.name }}</h3>
                            <p class="text-sm text-gray-500">{{ type.description }}</p>
                            <p class="text-xs text-gray-400">Category: {{ getCategoryName(type.category) }}</p>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <span [class]="type.isActive ? 'text-green-600' : 'text-red-600'" class="text-sm">
                                {{ type.isActive ? 'Active' : 'Inactive' }}
                            </span>
                            <button (click)="deleteType(type.id)" class="text-red-600 hover:text-red-900 text-xs mt-2">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ExpenseTypeManagementComponent implements OnInit {
    expenseTypes: ExpenseType[] = [];
    expenseTypeForm: FormGroup;
    categories: ExpenseCategory[] = [];

    constructor(
        private fb: FormBuilder,
        private expenseService: ExpenseService
    ) {
        this.expenseTypeForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            category: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadExpenseTypes();
        this.loadCategories();
    }

    loadExpenseTypes(): void {
        this.expenseService.expenseTypes$.subscribe(types => {
            this.expenseTypes = types;
        });
    }

    loadCategories(): void {
        this.expenseService.getExpenseCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    getCategoryName(categoryId: string): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    onSubmit(): void {
        if (this.expenseTypeForm.valid) {
            const newType = {
                ...this.expenseTypeForm.value,
                isActive: true // Always default to active
            };
            this.expenseService.addExpenseType(newType);
            this.expenseTypeForm.reset();
        }
    }

    deleteType(id: string): void {
        if (confirm('Are you sure you want to delete this expense type?')) {
            // Remove from mock data
            const idx = this.expenseTypes.findIndex(t => t.id === id);
            if (idx !== -1) {
                this.expenseTypes.splice(idx, 1);
                // Also update the service's subject
                (this.expenseService as any).expenseTypesSubject.next([...this.expenseTypes]);
            }
        }
    }
} 