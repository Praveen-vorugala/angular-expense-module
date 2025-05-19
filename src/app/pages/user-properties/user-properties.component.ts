import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { PropertyType, PropertyValue } from 'src/app/types/expense';

@Component({
  selector: 'app-user-properties',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">User Properties Management</h1>
        
        <!-- Add New User Property Form -->
        <form [formGroup]="userPropertyForm" (ngSubmit)="onSubmitProperty()" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter property name"
              />
              <div *ngIf="userPropertyForm.get('name')?.touched && userPropertyForm.get('name')?.errors" class="mt-1 text-sm text-red-600">
                <div *ngIf="userPropertyForm.get('name')?.errors?.['required']">Name is required</div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                formControlName="type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter property type (e.g. ROLE, GRADE, etc.)"
              />
            </div>
          </div>
          <div class="mt-4">
            <button
              type="submit"
              [disabled]="userPropertyForm.invalid"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Add User Property
            </button>
          </div>
        </form>

        <!-- User Properties Cards (single column, full width) -->
        <div class="flex flex-col gap-6">
          <div *ngFor="let property of userProperties" class="bg-white rounded-lg shadow-md p-6 border border-gray-200 w-full">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ property.name }}</h3>
                <p class="text-sm text-gray-500">Type: {{ property.type }}</p>
                <p class="text-xs text-gray-400">Created: {{ property.createdAt | date:'short' }}</p>
              </div>
              <button
                (click)="deleteProperty(property.id)"
                class="text-red-600 hover:text-red-900"
                title="Delete Property"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Values</h4>
              <div class="space-y-2 mb-2">
                <div *ngFor="let value of property.values" class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-sm text-gray-900">{{ value.name }} ({{ value.value }})</span>
                  <button (click)="deletePropertyValue(property.id, value.id)" class="text-red-500 hover:text-red-700" title="Delete Value">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div *ngIf="addValueOpenId !== property.id">
                <button (click)="openAddValueForm(property.id)" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 mt-2">
                  Add Value
                </button>
              </div>
              <form *ngIf="addValueOpenId === property.id" [formGroup]="getValueForm(property.id)" (ngSubmit)="onAddValue(property.id)" class="flex flex-col md:flex-row gap-2 mt-2">
                <div class="flex-1">
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Value Name"
                  />
                </div>
                <div class="flex-1">
                  <input
                    type="text"
                    formControlName="value"
                    class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Value"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="submit"
                    [disabled]="getValueForm(property.id).invalid"
                    class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button type="button" (click)="closeAddValueForm()" class="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserPropertiesComponent implements OnInit {
  userProperties: PropertyType[] = [];
  userPropertyForm: FormGroup;
  valueForms: { [propertyId: string]: FormGroup } = {};
  addValueOpenId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.userPropertyForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.expenseService.getProperties().subscribe(
      (properties) => {
        this.userProperties = properties;
        // Initialize value forms for each property
        for (const prop of properties) {
          if (!this.valueForms[prop.id]) {
            this.valueForms[prop.id] = this.fb.group({
              name: ['', Validators.required],
              value: ['', Validators.required]
            });
          }
        }
      },
      (error) => {
        console.error('Error loading user properties:', error);
      }
    );
  }

  getValueForm(propertyId: string): FormGroup {
    if (!this.valueForms[propertyId]) {
      this.valueForms[propertyId] = this.fb.group({
        name: ['', Validators.required],
        value: ['', Validators.required]
      });
    }
    return this.valueForms[propertyId];
  }

  openAddValueForm(propertyId: string): void {
    this.addValueOpenId = propertyId;
    // Optionally reset the form
    this.getValueForm(propertyId).reset();
  }

  closeAddValueForm(): void {
    this.addValueOpenId = null;
  }

  onSubmitProperty(): void {
    if (this.userPropertyForm.valid) {
      const newProperty = this.userPropertyForm.value;
      this.expenseService.createProperty(newProperty).subscribe(
        () => {
          this.loadProperties();
          this.userPropertyForm.reset();
        },
        (error) => {
          console.error('Error creating user property:', error);
        }
      );
    }
  }

  onAddValue(propertyId: string): void {
    const valueForm = this.getValueForm(propertyId);
    if (valueForm.valid) {
      const { name, value } = valueForm.value;
      this.expenseService.addPropertyValue(propertyId, { name, value }).subscribe(
        () => {
          this.loadProperties();
          valueForm.reset();
          this.closeAddValueForm();
        },
        (error) => {
          console.error('Error adding property value:', error);
        }
      );
    }
  }

  deleteProperty(id: string): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.expenseService.deleteProperty(id).subscribe(
        () => {
          this.loadProperties();
        },
        (error) => {
          console.error('Error deleting property:', error);
        }
      );
    }
  }

  deletePropertyValue(propertyId: string, valueId: string): void {
    if (confirm('Are you sure you want to delete this value?')) {
      this.expenseService.deletePropertyValue(propertyId, valueId).subscribe(
        () => {
          this.loadProperties();
        },
        (error) => {
          console.error('Error deleting property value:', error);
        }
      );
    }
  }
} 