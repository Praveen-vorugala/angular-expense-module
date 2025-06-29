import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType, ExpenseCategory } from 'src/app/types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';
import { PopOverService } from 'src/app/services/pop-over/pop-over.service';

@Component({
    selector: 'app-expense-type-management',
    template: `
        <app-loader [show]="isLoading" [loadingText]="loaderText"></app-loader>
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
                            [disabled]="isLoadingCategories"
                        >
                            <option value="" disabled>Select category</option>
                            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                        </select>
                        <div *ngIf="isLoadingCategories" class="mt-1 text-sm text-gray-500">
                            Loading categories...
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <button
                        type="submit"
                        [disabled]="expenseTypeForm.invalid || isSubmitting"
                        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <!-- <span *ngIf="isSubmitting">Adding...</span> -->
                        <span>Add Expense Type</span>
                    </button>
                </div>
            </form>

            <!-- Loading State for Expense Types -->
            <div *ngIf="isLoadingTypes" class="text-center py-4">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Loading expense types...</p>
            </div>

            <!-- Expense Types Cards -->
            <div *ngIf="!isLoadingTypes" class="flex flex-col gap-6">
                <div *ngFor="let type of expenseTypes" class="bg-white rounded-lg shadow-md p-6 border border-gray-200 w-full">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">{{ type.name }}</h3>
                            <p class="text-sm text-gray-500">{{ type.description }}</p>
                            <p class="text-xs text-gray-400">Category: {{ getCategoryName(type.category) }}</p>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <span [class]="type.is_active ? 'text-green-600' : 'text-red-600'" class="text-sm">
                                {{ type.is_active ? 'Active' : 'Inactive' }}
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
    isLoadingTypes = false;
    isLoadingCategories = false;
    isSubmitting = false;
    isLoading:boolean = false;
    loaderText:string = '';

    constructor(
        private baseAPI: BaseApiService,
        private fb: FormBuilder,
        private expenseService: ExpenseService,
        private popoverService: PopOverService,
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
        this.isLoadingTypes = true;
        const params = new Map<string, string>();
        params.set('is_active', 'true');
        params.set('page_size', '40');
        params.set('ordering', '-created_at');
        this.baseAPI.executeGet({url: apiDirectory.expenseTypes,params:params}).subscribe({
            next: (data: any) => {
                this.expenseTypes = data.results;
                this.isLoadingTypes = false;
            },
            error: (error) => {
                console.error('Error loading expense types:', error);
                this.isLoadingTypes = false;
            }
        });
    }

    loadCategories(): void {
        this.isLoadingCategories = true;
        const params = new Map<string, string>();
        params.set('is_active', 'true');
        params.set('page_size', '40');
        this.baseAPI.executeGet({url: apiDirectory.expenseCategories,params:params}).subscribe({
            next: (data: any) => {
                this.categories = data.results;
                this.isLoadingCategories = false;
            },
            error: (error) => {
                console.error('Error loading categories:', error);
                this.isLoadingCategories = false;
            }
        });
    }

    getCategoryName(categoryId: string): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    onSubmit(): void {
        if (this.expenseTypeForm.valid) {
            this.isSubmitting = true;
            this.isLoading = true;
            this.loaderText = 'Creating...'
            const newType = {
                ...this.expenseTypeForm.value,
                is_active: true // Always default to active
            };
            newType['code'] = this.getInitialsUppercase(newType.name);
            this.baseAPI.executePost({url: apiDirectory.expenseTypes, body: newType}).subscribe({
                next: (response: any) => {
                    // this.expenseTypes = [...this.expenseTypes, response];
                    this.loadExpenseTypes();
                    this.expenseTypeForm.reset();
                    this.isSubmitting = false;
                    this.isLoading = false;
                    this.loaderText = '';
                    this.popoverService.showSuccess('New Expense Type created successfully.',3000);
                },
                error: (error) => {
                    console.error('Error adding expense type:', error);
                    this.isSubmitting = false;
                    this.isLoading = false;
                    this.loaderText = '';
                    this.popoverService.showError('Failed to create. Please try again later.',3000);
                }
            });
        }
    }

    getInitialsUppercase(text:string) {
        return text
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word[0].toUpperCase())
          .join('');
    }

    deleteType(id: string): void {
        if (confirm('Are you sure you want to delete this expense type?')) {
            this.baseAPI.executeDelete({url: `${apiDirectory.expenseTypes}${id}`}).subscribe({
                next: () => {
                    this.expenseTypes = this.expenseTypes.filter(type => type.id !== id);
                },
                error: (error) => {
                    console.error('Error deleting expense type:', error);
                }
            });
        }
    }
} 