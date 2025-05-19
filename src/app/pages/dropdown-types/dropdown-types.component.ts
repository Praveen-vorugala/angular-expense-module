import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { DropdownType } from 'src/app/types/expense';

@Component({
  selector: 'app-dropdown-types',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">Dropdown Types Management</h1>
        
        <!-- Add New Dropdown Type Form -->
        <form [formGroup]="dropdownTypeForm" (ngSubmit)="onSubmit()" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter dropdown type name"
              />
              <div *ngIf="dropdownTypeForm.get('name')?.touched && dropdownTypeForm.get('name')?.errors" class="mt-1 text-sm text-red-600">
                <div *ngIf="dropdownTypeForm.get('name')?.errors?.['required']">Name is required</div>
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
          </div>
          <div class="mt-4">
            <button
              type="submit"
              [disabled]="dropdownTypeForm.invalid"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Add Dropdown Type
            </button>
          </div>
        </form>

        <!-- Add New Option Form -->
        <form [formGroup]="optionForm" (ngSubmit)="onAddOption()" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dropdown Type</label>
              <select
                formControlName="typeId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a type</option>
                <option *ngFor="let type of dropdownTypes" [value]="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Option Value</label>
              <input
                type="text"
                formControlName="value"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter option value"
              />
            </div>
            
          </div>
          <div class="mt-4">
            <button
              type="submit"
              [disabled]="optionForm.invalid"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Add Option
            </button>
          </div>
        </form>

        <!-- Dropdown Types Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let type of dropdownTypes" class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ type.name }}</h3>
                <p class="text-sm text-gray-500">{{ type.description }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span [class]="type.isActive ? 'text-green-600' : 'text-red-600'" class="text-sm">
                  {{ type.isActive ? 'Active' : 'Inactive' }}
                </span>
                <button
                  (click)="deleteDropdownType(type.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Options</h4>
              <div class="space-y-2">
                <div *ngFor="let option of type.options" class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-sm text-gray-900">{{ option.value }}</span>
                  <span [class]="option.isActive ? 'text-green-600' : 'text-red-600'" class="text-sm">
                    {{ option.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DropdownTypesComponent implements OnInit {
  dropdownTypes: DropdownType[] = [];
  dropdownTypeForm: FormGroup;
  optionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.dropdownTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    });

    this.optionForm = this.fb.group({
      typeId: ['', Validators.required],
      value: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadDropdownTypes();
  }

  loadDropdownTypes(): void {
    this.expenseService.getDropdownTypes().subscribe(
      (types) => {
        this.dropdownTypes = types;
      },
      (error) => {
        console.error('Error loading dropdown types:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.dropdownTypeForm.valid) {
      const newType = this.dropdownTypeForm.value;
      this.expenseService.createDropdownType(newType).subscribe(
        () => {
          this.loadDropdownTypes();
          this.dropdownTypeForm.reset({ isActive: true });
        },
        (error) => {
          console.error('Error creating dropdown type:', error);
        }
      );
    }
  }

  onAddOption(): void {
    if (this.optionForm.valid) {
      const { typeId, value, isActive } = this.optionForm.value;
      this.expenseService.addDropdownOption(typeId, { value, isActive: true });
      this.loadDropdownTypes();
      this.optionForm.reset({ isActive: true });
    }
  }

  deleteDropdownType(id: string): void {
    if (confirm('Are you sure you want to delete this dropdown type?')) {
      this.expenseService.deleteDropdownType(id).subscribe(
        () => {
          this.loadDropdownTypes();
        },
        (error) => {
          console.error('Error deleting dropdown type:', error);
        }
      );
    }
  }
} 