import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpensePolicy, ExpenseRule, ExpenseType, ExpenseCategory, PolicyCondition, PropertyType, PropertyValue, RuleValueType, ComparisonOperator, PolicyReport } from 'src/app/types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';

@Component({
    selector: 'app-policy-management',
    template: `
        <div class="p-4">
            <h1 class="text-2xl font-bold mb-6">Policy Management</h1>
            <button (click)="openModal()" class="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Policy</button>
            
            <!-- Policy List -->
            <div class="flex flex-col gap-4">
                <div *ngFor="let policy of policies" class="bg-white rounded-lg shadow-md p-4 border border-gray-200 w-full">
                    <div class="flex flex-col gap-4">
                        <!-- Policy Header -->
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">{{ policy.name }}</h3>
                                <p class="text-sm text-gray-500">{{ policy.description }}</p>
                            </div>
                            <div class="flex gap-2">
                                <button (click)="viewPolicy(policy)" class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm">
                                    View Policy
                                </button>
                                <button (click)="addReport(policy)" class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm">
                                    Add Report
                                </button>
                            </div>
                        </div>

                        <!-- Policy Conditions -->
                        <div *ngIf="getPolicyConditions(policy).length > 0" class="border-t pt-3">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Policy Conditions</h4>
                            <ul class="space-y-1">
                                <li *ngFor="let condition of getPolicyConditions(policy)" class="text-sm text-gray-600">
                                    <span class="font-semibold">{{ getPropertyTypeName(condition.property_type) }}</span>
                                    <span class="ml-2">= {{ getPropertyValueNames(condition.property_type, condition.value) }}</span>
                                </li>
                            </ul>
                        </div>

                        
                    </div>
                </div>
            </div>

            <!-- Add Policy Modal -->
            <div *ngIf="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 overflow-scroll">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                    <button (click)="closeModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
                    <h2 class="text-xl font-bold mb-4">Create Policy</h2>
                    <form [formGroup]="policyForm" (ngSubmit)="onSubmit()">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" formControlName="name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter policy name" />
                            <div *ngIf="policyForm.get('name')?.touched && policyForm.get('name')?.errors" class="mt-1 text-sm text-red-600">
                                <div *ngIf="policyForm.get('name')?.errors?.['required']">Name is required</div>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" formControlName="description" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter description" />
                        </div>

                        <!-- Conditions Section -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Conditions</label>
                                <button type="button" (click)="openConditionModal()" class="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs">Add Condition</button>
                            </div>
                            <div *ngIf="newConditions.length === 0" class="text-xs text-gray-400">No conditions added yet.</div>
                            <ul *ngIf="newConditions.length > 0" class="space-y-2">
                                <ng-container *ngFor="let cond of newConditions; let i = index;let last = last">
                                    <li class="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                        <span>
                                            <span class="font-semibold">{{ getPropertyTypeName(cond.property_type) }}</span>
                                            <span class="ml-2">= {{ getPropertyValueNames(cond.property_type, cond.value) }}</span>
                                        </span>
                                        <button type="button" (click)="removeCondition(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                    </li>
                                    <div *ngIf="!last" class="flex justify-center">And</div>
                                </ng-container>
                            </ul>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" [disabled]="!isFormValid()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Create Policy</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Report Modal -->
            <div *ngIf="showReportModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                    <button (click)="closeReportModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
                    <h3 class="text-lg font-bold mb-4">Add Report</h3>
                    <form [formGroup]="reportForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select formControlName="frequency" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="" disabled>Select frequency</option>
                                <option *ngFor="let freq of frequencyOptions" [value]="freq.value">{{ freq.label }}</option>
                            </select>
                        </div>

                        <!-- Expense Rules Section -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Expense Rules</label>
                                <button type="button" (click)="openRuleModal(selectedPolicy, null)" class="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs">Add Rule</button>
                            </div>
                            <div *ngIf="newReportRules.length === 0" class="text-xs text-gray-400">No rules added yet.</div>
                            <div *ngIf="newReportRules.length > 0" class="space-y-4">
                                <!-- Constant Rules -->
                                <div *ngIf="hasConstantRulesInNewReport()" class="mb-3">
                                    <h5 class="text-xs font-medium text-gray-600 mb-1">Constant Rules</h5>
                                    <ul class="space-y-2">
                                        <li *ngFor="let rule of getConstantRulesFromNewReport(); let i = index" class="text-sm bg-gray-50 p-2 rounded shadow-sm">
                                            <div class="flex justify-between items-start">
                                                <div class="flex flex-col gap-1">
                                                    <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                    <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                    <!-- User Conditions for this rule -->
                                                    <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                        <span class="text-xs text-gray-500">User Conditions:</span>
                                                        <ul class="mt-1 space-y-1">
                                                            <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <button type="button" (click)="removeNewReportRule(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Actual Rules -->
                                <div *ngIf="hasActualRulesInNewReport()" class="mb-3">
                                    <h5 class="text-xs font-medium text-gray-600 mb-1">Actual Rules</h5>
                                    <ul class="space-y-2">
                                        <li *ngFor="let rule of getActualRulesFromNewReport(); let i = index" class="text-sm bg-gray-50 p-2 rounded shadow-sm">
                                            <div class="flex justify-between items-start">
                                                <div class="flex flex-col gap-1">
                                                    <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                    <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                    <!-- User Conditions for this rule -->
                                                    <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                        <span class="text-xs text-gray-500">User Conditions:</span>
                                                        <ul class="mt-1 space-y-1">
                                                            <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <button type="button" (click)="removeNewReportRule(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <!-- Calculated Rules -->
                                <div *ngIf="hasCalculatedRulesInNewReport()" class="mb-3">
                                    <h5 class="text-xs font-medium text-gray-600 mb-1">Calculated Rules</h5>
                                    <ul class="space-y-2">
                                        <li *ngFor="let rule of getCalculatedRulesFromNewReport(); let i = index" class="text-sm bg-gray-50 p-2 rounded shadow-sm">
                                            <div class="flex justify-between items-start">
                                                <div class="flex flex-col gap-1">
                                                    <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                    <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                    <!-- User Conditions for this rule -->
                                                    <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                        <span class="text-xs text-gray-500">User Conditions:</span>
                                                        <ul class="mt-1 space-y-1">
                                                            <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <button type="button" (click)="removeNewReportRule(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button type="button" (click)="onAddReport()" [disabled]="!isReportFormValid()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add Report</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Rule Modal -->
            <div *ngIf="showRuleModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 overflow-scroll">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                    <button (click)="closeRuleModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
                    <h3 class="text-lg font-bold mb-4">Add Expense Rule</h3>
                    <form [formGroup]="ruleForm" (ngSubmit)="onAddRule()">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                            <select formControlName="valueType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" (ngModelChange)="onRuleTypeChange()">
                                <option value="" disabled>Select rule type</option>
                                <option *ngFor="let type of ruleValueTypes" [value]="type.value">{{ type.label }}</option>
                            </select>
                        </div>

                        <!-- Constant Value Fields -->
                        <div class="mb-4" *ngIf="ruleForm.get('valueType')?.value === 'CONSTANT'">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Select By</label>
                                <div class="flex space-x-4">
                                    <label class="inline-flex items-center">
                                        <input type="radio" formControlName="selectionType" value="expenseType" 
                                               class="form-radio text-indigo-600" (change)="onSelectionTypeChange()">
                                        <span class="ml-2">Expense Type</span>
                                    </label>
                                    <label class="inline-flex items-center">
                                        <input type="radio" formControlName="selectionType" value="expenseCategory" 
                                               class="form-radio text-indigo-600" (change)="onSelectionTypeChange()">
                                        <span class="ml-2">Expense Category</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Expense Type Selection -->
                            <div *ngIf="ruleForm.get('selectionType')?.value === 'expenseType'">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                                <select formControlName="expenseTypeId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="" disabled>Select expense type</option>
                                    <option *ngFor="let type of expenseTypes" [value]="type.id">{{ type.name }}</option>
                                </select>
                                <div *ngIf="expenseTypes.length === 0" class="mt-1 text-sm text-gray-500">
                                    Loading expense types...
                                </div>
                                <div class="mt-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input type="number" formControlName="amount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter amount" />
                                </div>
                            </div>

                            <!-- Expense Category Selection -->
                            <div *ngIf="ruleForm.get('selectionType')?.value === 'expenseCategory'">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expense Categories</label>
                                <div class="space-y-2">
                                    <div *ngFor="let category of expenseCategories" class="flex items-center">
                                        <input type="checkbox" [value]="category.id" 
                                               (change)="onCategorySelection(category, $event)"
                                               class="form-checkbox h-4 w-4 text-indigo-600">
                                        <span class="ml-2">{{ category.name }}</span>
                                    </div>
                                </div>

                                <!-- Selected Categories and their Expense Types -->
                                <div *ngIf="selectedCategories.length > 0" class="mt-4">
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Categories</h4>
                                    <div class="space-y-4">
                                        <div *ngFor="let categoryId of selectedCategories" class="border rounded p-3">
                                            <h5 class="font-medium mb-2">{{ getCategoryName(categoryId) }}</h5>
                                            <div class="space-y-2">
                                                <div *ngFor="let type of getExpenseTypesByCategory(categoryId)" class="flex items-center space-x-2">
                                                    <span class="text-sm">{{ type.name }}</span>
                                                    <input type="number" 
                                                           [(ngModel)]="categoryAmounts[type.id]"
                                                           [ngModelOptions]="{standalone: true}"
                                                           class="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                           placeholder="Amount">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actual Value Fields -->
                        <div class="mb-4" *ngIf="ruleForm.get('valueType')?.value === 'ACTUAL'">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                                <select formControlName="expenseTypeId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="" disabled>Select expense type</option>
                                    <option *ngFor="let type of expenseTypes" [value]="type.id">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <input type="text" value="Actual" disabled class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                                    <select formControlName="operator" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="" disabled>Select operator</option>
                                        <option *ngFor="let op of operators" [value]="op.value">{{ op.label }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Limit Amount</label>
                                    <input type="number" formControlName="limitAmount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter limit" />
                                </div>
                            </div>
                        </div>

                        <!-- Calculated Value Fields -->
                        <div class="mb-4" *ngIf="ruleForm.get('valueType')?.value === 'CALCULATED'">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                                <select formControlName="expenseTypeId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="" disabled>Select expense type</option>
                                    <option *ngFor="let type of expenseTypes" [value]="type.id">{{ type.name }}</option>
                                </select>
                            </div>
                        </div>

                        <!-- User Conditions Section -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">User Conditions</label>
                                <button type="button" (click)="openRuleConditionModal()" class="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs">Add User Condition</button>
                            </div>
                            <div *ngIf="ruleUserConditions.length === 0" class="text-xs text-gray-400">No user conditions added yet.</div>
                            <ul *ngIf="ruleUserConditions.length > 0" class="space-y-2">
                                <li *ngFor="let cond of ruleUserConditions; let i = index" class="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                    <span>
                                        <span class="font-semibold">{{ getPropertyTypeName(cond.property_type) }}</span>
                                        <span class="ml-2">= {{ getPropertyValueNames(cond.property_type, cond.value) }}</span>
                                    </span>
                                    <button type="button" (click)="removeRuleUserCondition(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                </li>
                            </ul>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" [disabled]="ruleForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add Rule</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Rule User Condition Modal -->
            <div *ngIf="showRuleConditionModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                    <button (click)="closeRuleConditionModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
                    <h3 class="text-lg font-bold mb-4">Add User Condition</h3>
                    <form [formGroup]="ruleConditionForm" (ngSubmit)="onAddRuleUserCondition()">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                            <select formControlName="propertyType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" (change)="onRuleConditionPropertyTypeChange()">
                                <option value="" disabled>Select property type</option>
                                <option *ngFor="let prop of userProperties" [value]="prop.type">{{ prop.name }}</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <select formControlName="value" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="" disabled>Select value</option>
                                <option *ngFor="let val of ruleConditionPropertyValues" [value]="val.value">{{ val.name }}</option>
                            </select>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" [disabled]="ruleConditionForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add User Condition</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add Condition Modal -->
            <div *ngIf="showConditionModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                    <button (click)="closeConditionModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><mat-icon>close</mat-icon></button>
                    <h3 class="text-lg font-bold mb-4">Add Condition</h3>
                    <form [formGroup]="conditionForm" (ngSubmit)="onAddCondition()">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                            <select formControlName="propertyType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" (change)="onPropertyTypeChange()">
                                <option value="" disabled>Select property type</option>
                                <option *ngFor="let prop of userProperties" [value]="prop.type">{{ prop.name }}</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Values</label>
                            <div class="relative value-dropdown-container">
                                <div class="relative">
                                    <input type="text" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                           placeholder="Select values"
                                           [value]="selectedPropertyValues.length ? selectedPropertyValues.length + ' values selected' : ''"
                                           readonly
                                           (click)="toggleValueDropdown()"
                                           [disabled]="!conditionForm.get('propertyType')?.value">
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <mat-icon class="text-gray-400">arrow_drop_down</mat-icon>
                                    </div>
                                </div>
                                <!-- Dropdown with checkboxes -->
                                <div *ngIf="showValueDropdown" 
                                     class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    <div *ngFor="let val of availablePropertyValues" 
                                         class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                                         (click)="toggleValueSelection(val.id)">
                                        <input type="checkbox" 
                                               [checked]="selectedPropertyValues.includes(val.value)"
                                               class="form-checkbox h-4 w-4 text-indigo-600"
                                               (click)="$event.stopPropagation()"
                                               (change)="toggleValueSelection(val.id)">
                                        <span class="ml-2">{{ val.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Selected Values as Chips -->
                            <div class="mt-2 flex flex-wrap gap-2">
                                <div *ngFor="let val of selectedPropertyValues" 
                                     class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                                    <span>{{ getPropertyValueNames(conditionForm.get('propertyType')?.value, [val]) }}</span>
                                    <button type="button" 
                                            (click)="removeSelectedValue(val)"
                                            class="ml-2 text-indigo-600 hover:text-indigo-800">
                                        <mat-icon class="text-sm">close</mat-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" 
                                    [disabled]="!isConditionFormValid()" 
                                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                                Add Condition
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Policy Modal -->
            <div *ngIf="showViewPolicyModal" class="fixed inset-0 z-50 overflow-hidden">
                <div class="absolute inset-0 bg-black bg-opacity-50"></div>
                <div class="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl">
                    <div class="h-full flex flex-col">
                        <!-- Header -->
                        <div class="px-6 py-4 border-b flex justify-between items-center">
                            <h2 class="text-xl font-bold">Policy Details</h2>
                            <button (click)="closeViewPolicyModal()" class="text-gray-400 hover:text-gray-600">
                                <mat-icon>close</mat-icon>
                            </button>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 overflow-y-auto p-6">
                            <div *ngIf="selectedPolicyDetails" class="space-y-6">
                                <!-- Basic Info -->
                                <div>
                                    <h3 class="text-lg font-semibold mb-2">Basic Information</h3>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <p class="text-sm text-gray-600">Name</p>
                                                <p class="font-medium">{{ selectedPolicyDetails.name }}</p>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-600">Description</p>
                                                <p class="font-medium">{{ selectedPolicyDetails.description }}</p>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-600">Frequency</p>
                                                <p class="font-medium">{{ selectedPolicyDetails.frequency }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Conditions -->
                                <div>
                                    <h3 class="text-lg font-semibold mb-2">Conditions</h3>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <ul class="space-y-2">
                                            <li *ngFor="let condition of selectedPolicyDetails.condition" class="flex items-center">
                                                <span class="font-medium">{{ getPropertyTypeName(condition.property_type) }}</span>
                                                <span class="mx-2">=</span>
                                                <span>{{ getPropertyValueNames(condition.property_type, condition.value) }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Reports -->
                                <div>
                                    <h3 class="text-lg font-semibold mb-2">Reports</h3>
                                    <div class="space-y-4">
                                        <div *ngFor="let report of selectedPolicyDetails.reports" class="bg-gray-50 p-4 rounded-lg">
                                            <div class="flex justify-between items-center mb-3">
                                                <h4 class="font-medium">Frequency: {{ report.frequency }}</h4>
                                            </div>

                                            <!-- Rules -->
                                            <div class="space-y-4">
                                                <!-- Constant Rules -->
                                                <div *ngIf="hasConstantRules(report)">
                                                    <h5 class="text-sm font-medium text-gray-600 mb-2">Constant Rules</h5>
                                                    <ul class="space-y-2">
                                                        <li *ngFor="let rule of getConstantRules(report)" class="bg-white p-3 rounded shadow-sm">
                                                            <div class="flex flex-col gap-1">
                                                                <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                                <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                                <!-- User Conditions -->
                                                                <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-2 pl-3 border-l-2 border-gray-200">
                                                                    <span class="text-xs text-gray-500">User Conditions:</span>
                                                                    <ul class="mt-1 space-y-1">
                                                                        <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                            {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <!-- Actual Rules -->
                                                <div *ngIf="hasActualRules(report)">
                                                    <h5 class="text-sm font-medium text-gray-600 mb-2">Actual Rules</h5>
                                                    <ul class="space-y-2">
                                                        <li *ngFor="let rule of getActualRules(report)" class="bg-white p-3 rounded shadow-sm">
                                                            <div class="flex flex-col gap-1">
                                                                <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                                <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                                <!-- User Conditions -->
                                                                <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-2 pl-3 border-l-2 border-gray-200">
                                                                    <span class="text-xs text-gray-500">User Conditions:</span>
                                                                    <ul class="mt-1 space-y-1">
                                                                        <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                            {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <!-- Calculated Rules -->
                                                <div *ngIf="hasCalculatedRules(report)">
                                                    <h5 class="text-sm font-medium text-gray-600 mb-2">Calculated Rules</h5>
                                                    <ul class="space-y-2">
                                                        <li *ngFor="let rule of getCalculatedRules(report)" class="bg-white p-3 rounded shadow-sm">
                                                            <div class="flex flex-col gap-1">
                                                                <span class="font-medium">{{ getExpenseTypeName(rule.expense_type) }}</span>
                                                                <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                                                <!-- User Conditions -->
                                                                <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-2 pl-3 border-l-2 border-gray-200">
                                                                    <span class="text-xs text-gray-500">User Conditions:</span>
                                                                    <ul class="mt-1 space-y-1">
                                                                        <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                                            {{ getPropertyTypeName(condition.property_type) }} = {{ getPropertyValueNames(condition.property_type, condition.value) }}
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class PolicyManagementComponent implements OnInit {
    policies: ExpensePolicy[] = [];
    showModal = false;
    policyForm: FormGroup;
    frequencyOptions = [
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'FORTNIGHTLY', label: 'Fortnightly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'HALF_YEARLY', label: 'Half Yearly' },
        { value: 'ANNUALLY', label: 'Annually' }
    ];
    expenseTypes: ExpenseType[] = [];
    newRules: ExpenseRule[] = [];
    showRuleModal = false;
    ruleForm: FormGroup;
    // Conditions
    userProperties: PropertyType[] = [];
    propertyValues: PropertyValue[] = [];
    newConditions: PolicyCondition[] = [];
    showConditionModal = false;
    conditionForm: FormGroup;
    // Rule user conditions
    ruleUserConditions: PolicyCondition[] = [];
    showRuleConditionModal = false;
    ruleConditionForm: FormGroup;
    ruleConditionPropertyValues: PropertyValue[] = [];
    editingPolicy: ExpensePolicy | null = null;
    showRuleForm = false;
    selectedPolicy: ExpensePolicy | null = null;
    ruleValueType: RuleValueType = 'CONSTANT';
    selectedCategories: string[] = [];
    categoryAmounts: Record<string, number> = {};
    expenseCategories: ExpenseCategory[] = [];
    showReportModal = false;
    reportForm: FormGroup;
    newReportRules: ExpenseRule[] = [];
    currentReport: PolicyReport | null = null;
    selectedPropertyValues: string[] = [];
    availablePropertyValues: PropertyValue[] = [];
    showValueDropdown = false;
    showViewPolicyModal = false;
    selectedPolicyDetails: any = null;

    readonly operators: { value: ComparisonOperator; label: string }[] = [
        { value: '<', label: '<' },
        { value: '>', label: '>' },
        { value: '<=', label: '<=' },
        { value: '>=', label: '>=' }
    ];

    readonly ruleValueTypes: { value: RuleValueType; label: string }[] = [
        { value: 'CONSTANT', label: 'Constant Value' },
        { value: 'ACTUAL', label: 'Actual Value' },
        { value: 'CALCULATED', label: 'Calculated Value' }
    ];

    constructor(
        private baseAPI: BaseApiService,
        private expenseService: ExpenseService,
        private fb: FormBuilder
    ) {
        this.policyForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            conditions: [[]]
        });

        this.ruleForm = this.fb.group({
            valueType: ['', Validators.required],
            selectionType: ['expenseType'],
            expenseTypeId: [''],
            amount: [0],
            operator: ['<'],
            limitAmount: [0],
            formula: [''],
            userConditions: [[]]
        });

        this.conditionForm = this.fb.group({
            propertyType: ['', Validators.required],
            value: ['', Validators.required]
        });

        this.ruleConditionForm = this.fb.group({
            propertyType: ['', Validators.required],
            value: ['', Validators.required]
        });

        this.reportForm = this.fb.group({
            frequency: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // this.expenseService.policies$.subscribe(policies => {
        //     this.policies = policies;
        // });
        // this.expenseService.expenseTypes$.subscribe(types => {
        //     this.expenseTypes = types;
        // });
        // this.getRoles();
        // this.getGrades();
        this.getPolicies();
        this.getExpenseTypes();
        this.expenseService.getProperties().subscribe(props => {
            this.userProperties = props;
            this.userProperties.forEach(item =>{
                if(item.url){
                    this.baseAPI.executeGet({url: item.url}).subscribe((data: any) => {
                        item.values = data.results;
                    })
                }
            })
        });
        // this.expenseService.getExpenseCategories().subscribe(categories => {
        //     this.expenseCategories = categories;
        // });
        this.getExpenseCategories();
    }

    viewPolicy(policy: any): void {
        this.baseAPI.executeGet({url: `${apiDirectory.getPolicies}${policy.id}/`}).subscribe((data: any) => {
            this.selectedPolicyDetails = data;
            this.showViewPolicyModal = true;
        });
    }

    closeViewPolicyModal(): void {
        this.showViewPolicyModal = false;
        this.selectedPolicyDetails = null;
    }

    openModal(): void {
        this.showModal = true;
        this.policyForm.reset();
        this.newRules = [];
        this.newConditions = [];
        console.log(this.policies);
    }

    closeModal(): void {
        this.showModal = false;
    }

    getPolicies():void{
        this.baseAPI.executeGet({url: apiDirectory.getPolicies}).subscribe((data: any) => {
            this.policies = data.results;
            console.log(this.policies);
            
        })
    }

    getExpenseTypes(): void {
        this.baseAPI.executeGet({url: apiDirectory.expenseTypes}).subscribe((data: any) => {
            this.expenseTypes = data.results;
        })
    }

    getExpenseCategories(): void {
        this.baseAPI.executeGet({url: apiDirectory.expenseCategories}).subscribe((data: any) => {
            this.expenseCategories = data.results;
        })
    }

    onSubmit(): void {
        if (this.policyForm.valid) {
            const newPolicy: ExpensePolicy = {
                ...this.policyForm.value,
                conditions: this.newConditions,
                // rules: [],
                // reports: []
            };
            this.createPolicy(newPolicy);
            this.expenseService.addPolicy(newPolicy);
            this.closeModal();
            this.getPolicies();
        }
    }

    getRoles():void{
        this.baseAPI.executeGet({url: apiDirectory.roles}).subscribe((data: any) => {
            this.userProperties = data.results;
        })
    }

    getGrades():void{
        this.baseAPI.executeGet({url: apiDirectory.grades}).subscribe((data: any) => {
            this.userProperties = data.results;
        })
    }

    

    isFormValid(): boolean {
        const nameValid = this.policyForm.get('name')?.valid ?? false;
        const descriptionValid = this.policyForm.get('description')?.valid ?? false;
        return nameValid && descriptionValid && this.newConditions.length > 0;
    }

    createPolicy(policy: ExpensePolicy): void {
        this.baseAPI.executePost({url: apiDirectory.createPolicy, body: policy}).subscribe((data: any) => {
            console.log('Policy created:', data);
        });
    }

    // Expense Rules logic
    openRuleModal(policy: ExpensePolicy | null, report: PolicyReport | null = null): void {
        this.showRuleModal = true;
        this.ruleForm.reset({ valueType: 'CONSTANT', amount: 0, formula: '', operator: '<', limitAmount: 0, userConditions: [] });
        this.ruleUserConditions = [];
        this.selectedPolicy = policy;
        this.currentReport = report;
        this.showRuleForm = !!report;
        console.log('openRuleModal - selectedPolicy:', this.selectedPolicy);
        console.log('openRuleModal - currentReport:', this.currentReport);
    }

    closeRuleModal(): void {
        this.showRuleModal = false;
        this.showRuleForm = false;
        console.log('closeRuleModal - selectedPolicy:', this.selectedPolicy);
    }

    onRuleTypeChange(): void {
        const valueType = this.ruleForm.get('valueType')?.value;
        
        // Reset form controls
        this.ruleForm.patchValue({
            expenseTypeId: '',
            amount: 0,
            operator: '<',
            limitAmount: 0,
            formula: '',
            selectionType: 'expenseType'
        });

        // Clear validators
        this.ruleForm.get('expenseTypeId')?.clearValidators();
        this.ruleForm.get('amount')?.clearValidators();
        this.ruleForm.get('operator')?.clearValidators();
        this.ruleForm.get('limitAmount')?.clearValidators();
        this.ruleForm.get('formula')?.clearValidators();

        // Set validators based on rule type
        if (valueType === 'CONSTANT') {
            this.ruleForm.get('expenseTypeId')?.setValidators([Validators.required]);
            this.ruleForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        } else if (valueType === 'ACTUAL') {
            this.ruleForm.get('expenseTypeId')?.setValidators([Validators.required]);
            this.ruleForm.get('operator')?.setValidators([Validators.required]);
            this.ruleForm.get('limitAmount')?.setValidators([Validators.required, Validators.min(0)]);
        } else if (valueType === 'CALCULATED') {
            this.ruleForm.get('expenseTypeId')?.setValidators([Validators.required]);
        }

        // Update validity
        this.ruleForm.get('expenseTypeId')?.updateValueAndValidity();
        this.ruleForm.get('amount')?.updateValueAndValidity();
        this.ruleForm.get('operator')?.updateValueAndValidity();
        this.ruleForm.get('limitAmount')?.updateValueAndValidity();
        this.ruleForm.get('formula')?.updateValueAndValidity();
    }

    onSelectionTypeChange(): void {
        const selectionType = this.ruleForm.get('selectionType')?.value;
        
        // Reset form controls
        this.ruleForm.patchValue({
            expenseTypeId: '',
            amount: 0
        });
        this.selectedCategories = [];
        this.categoryAmounts = {};

        // Clear validators
        this.ruleForm.get('expenseTypeId')?.clearValidators();
        this.ruleForm.get('amount')?.clearValidators();

        // Set validators based on selection type
        if (selectionType === 'expenseType') {
            this.ruleForm.get('expenseTypeId')?.setValidators([Validators.required]);
            this.ruleForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        }

        // Update validity
        this.ruleForm.get('expenseTypeId')?.updateValueAndValidity();
        this.ruleForm.get('amount')?.updateValueAndValidity();
    }

    isRuleFormValid(): boolean {
        const valueType = this.ruleForm.get('valueType')?.value;
        const selectionType = this.ruleForm.get('selectionType')?.value;

        if (!valueType) return false;

        if (valueType === 'ACTUAL') {
            const expenseTypeId = this.ruleForm.get('expenseTypeId');
            const operator = this.ruleForm.get('operator');
            const limitAmount = this.ruleForm.get('limitAmount');
            
            return !!(expenseTypeId?.valid && operator?.valid && limitAmount?.valid);
        }

        if (valueType === 'CALCULATED') {
            const expenseTypeId = this.ruleForm.get('expenseTypeId');
            return !!expenseTypeId?.valid;
        }

        if (valueType === 'CONSTANT') {
            if (selectionType === 'expenseType') {
                const expenseTypeId = this.ruleForm.get('expenseTypeId');
                const amount = this.ruleForm.get('amount');
                return !!(expenseTypeId?.valid && amount?.valid);
            } else if (selectionType === 'expenseCategory') {
                // Check if at least one category is selected and all selected categories have amounts for their expense types
                if (this.selectedCategories.length === 0) return false;
                
                return this.selectedCategories.every(categoryId => {
                    const types = this.getExpenseTypesByCategory(categoryId);
                    return types.every(type => this.categoryAmounts[type.id] !== undefined && this.categoryAmounts[type.id] >= 0);
                });
            }
        }

        return false;
    }

    onAddRule(): void {
        if (this.isRuleFormValid()) {
            const ruleData = this.ruleForm.value;
            const newRules: any[] = [];

            if (ruleData.valueType === 'CONSTANT' && ruleData.selectionType === 'expenseType') {
                newRules.push({
                    expense_type: parseInt(ruleData.expenseTypeId),
                    rule_type: ruleData.valueType,
                    amount: ruleData.amount,
                    operator: '<',
                    conditions: [],
                    userConditions: this.ruleUserConditions
                });
            } else if (ruleData.valueType === 'CONSTANT' && ruleData.selectionType === 'expenseCategory') {
                this.selectedCategories.forEach(categoryId => {
                    this.getExpenseTypesByCategory(categoryId).forEach(type => {
                        if (this.categoryAmounts[type.id] !== undefined) {
                            newRules.push({
                                expense_type: parseInt(type.id),
                                rule_type: ruleData.valueType,
                                amount: this.categoryAmounts[type.id],
                                operator: '<',
                                conditions: [],
                                userConditions: this.ruleUserConditions
                            });
                        }
                    });
                });
            } else if (ruleData.valueType === 'ACTUAL') {
                newRules.push({
                    expense_type: parseInt(ruleData.expenseTypeId),
                    rule_type: ruleData.valueType,
                    amount: ruleData.limitAmount,
                    operator: ruleData.operator,
                    conditions: [],
                    userConditions: this.ruleUserConditions
                });
            } else if (ruleData.valueType === 'CALCULATED') {
                newRules.push({
                    expense_type: parseInt(ruleData.expenseTypeId),
                    rule_type: ruleData.valueType,
                    amount: 0,
                    operator: '<',
                    conditions: [],
                    userConditions: this.ruleUserConditions
                });
            }

            if (newRules.length > 0) {
                console.log('onAddRule - selectedPolicy:', this.selectedPolicy);
                console.log('onAddRule - currentReport:', this.currentReport);
                
                if (this.selectedPolicy) {
                    if (this.currentReport) {
                        // If we're adding to an existing report
                        const report = this.selectedPolicy.reports?.find(r => r === this.currentReport);
                        if (report) {
                            report.rules.push(...newRules);
                        }
                    } else {
                        // If we're adding to a new report
                        this.newReportRules.push(...newRules);
                    }
                }
                this.closeRuleModal();
                this.resetRuleForm();
            }
        }
    }

    resetRuleForm(): void {
        this.ruleForm.reset({
            valueType: '',
            selectionType: 'expenseType',
            expenseTypeId: '',
            amount: 0,
            operator: '<',
            limitAmount: 0,
            formula: '',
            userConditions: []
        });
        this.selectedCategories = [];
        this.categoryAmounts = {};
    }

    removeRule(index: number): void {
        if (this.selectedPolicy) {
            this.selectedPolicy.rules.splice(index, 1);
        } else if (this.editingPolicy) {
            this.editingPolicy.rules.splice(index, 1);
        }
    }

    getExpenseTypeName(typeId: string | number | ExpenseType): string {
        typeId = typeof typeId === 'object' ? typeId.id : typeId;
        const type = this.expenseTypes.find(t => t.id == typeId);
        return type ? type.name : typeId.toString();
    }

    // Rule user conditions logic
    openRuleConditionModal(): void {
        this.showRuleConditionModal = true;
        this.ruleConditionForm.reset();
        this.ruleConditionPropertyValues = [];
    }

    closeRuleConditionModal(): void {
        this.showRuleConditionModal = false;
    }

    onRuleConditionPropertyTypeChange(): void {
        const selectedType = this.ruleConditionForm.get('propertyType')?.value;
        const prop = this.userProperties.find(p => p.type === selectedType);
        this.ruleConditionPropertyValues = prop ? prop.values : [];
        this.ruleConditionForm.get('value')?.setValue('');
    }

    onAddRuleUserCondition(): void {
        if (this.ruleConditionForm.valid) {
            this.ruleUserConditions.push({
                property_type: this.ruleConditionForm.get('propertyType')?.value,
                value: this.ruleConditionForm.get('value')?.value
            });
            this.closeRuleConditionModal();
        }
    }

    removeRuleUserCondition(index: number): void {
        this.ruleUserConditions.splice(index, 1);
    }

    // Conditions logic
    openConditionModal(): void {
        this.showConditionModal = true;
        this.conditionForm.reset();
        this.propertyValues = [];
    }

    closeConditionModal(): void {
        this.showConditionModal = false;
    }

    onPropertyTypeChange(): void {
        const selectedType = this.conditionForm.get('propertyType')?.value;
        const prop = this.userProperties.find(p => p.type === selectedType);
        this.availablePropertyValues = prop ? prop.values : [];
        this.selectedPropertyValues = []; // Reset selected values when property type changes
    }

    toggleValueDropdown(): void {
        if (this.conditionForm.get('propertyType')?.value) {
            this.showValueDropdown = !this.showValueDropdown;
        }
    }

    toggleValueSelection(value: string): void {
        const index = this.selectedPropertyValues.indexOf(value);
        if (index === -1) {
            this.selectedPropertyValues.push(value);
        } else {
            this.selectedPropertyValues.splice(index, 1);
        }
    }

    removeSelectedValue(value: string): void {
        this.selectedPropertyValues = this.selectedPropertyValues.filter(v => v !== value);
    }

    isConditionFormValid(): boolean {
        const propertyTypeValid = this.conditionForm.get('propertyType')?.valid ?? false;
        return propertyTypeValid && this.selectedPropertyValues.length > 0;
    }

    onAddCondition(): void {
        if (this.isConditionFormValid()) {
            this.newConditions.push({
                property_type: this.conditionForm.get('propertyType')?.value,
                value: [...this.selectedPropertyValues]
            });
            console.log(this.newConditions);
            
            this.closeConditionModal();
        }
    }

    getPropertyTypeName(type: string): string {
        const property = this.userProperties.find(p => p.type === type);
        return property ? property.name : type;
    }

    getPropertyValueNames(propertyType: string, values: string | string[]): string {
        if (Array.isArray(values)) {
            return values.map(value => this.getPropertyValueName(propertyType, value)).join(', ');
        }
        return this.getPropertyValueName(propertyType, values);
    }

    getPropertyValueName(propertyType: string, value: string): string {
        const property = this.userProperties.find(p => p.type === propertyType);
        if (!property) return value;

        const valueOption = property.values.find(v => v.value === value);
        return valueOption ? valueOption.name : value;
    }

    handleAddRule(policy: ExpensePolicy | null = null): void {
        this.selectedPolicy = policy;
        this.showRuleForm = true;
        this.ruleForm.reset({
            valueType: 'CONSTANT',
            amount: 0,
            operator: '<',
            limitAmount: 0,
            formula: '',
            userConditions: []
        });
        console.log('addReport - selectedPolicy:', this.selectedPolicy);
    }

    handleSaveRule(): void {
        if (this.ruleForm.valid) {
            const ruleData = this.ruleForm.value;
            const newRule: ExpenseRule = {
                expense_type: parseInt(ruleData.expenseTypeId),
                rule_type: ruleData.valueType,
                amount: ruleData.amount || ruleData.limitAmount || 0,
                operator: ruleData.operator || '<',
                conditions: [],
                userConditions: this.ruleUserConditions
            };

            if (this.selectedPolicy) {
                this.selectedPolicy.rules.push(newRule);
            } else if (this.editingPolicy) {
                this.editingPolicy.rules.push(newRule);
            }

            this.showRuleForm = false;
            this.ruleForm.reset();
        }
    }

    handleSave(): void {
        if (this.policyForm.valid) {
            const policyData = this.policyForm.value;
            const newPolicy: ExpensePolicy = {
                id: Date.now().toString(),
                name: policyData.name,
                description: policyData.description,
                frequency: policyData.frequency,
                conditions: policyData.conditions,
                rules: [],
                reports: []
            };

            if (this.editingPolicy) {
                const index = this.policies.findIndex(p => p.id === this.editingPolicy?.id);
                if (index !== -1) {
                    this.policies[index] = { ...this.editingPolicy, ...newPolicy };
                }
            } else {
                this.policies.push(newPolicy);
            }

            this.editingPolicy = null;
            this.policyForm.reset({
                frequency: 'MONTHLY',
                conditions: []
            });
        }
    }

    handleEdit(policy: ExpensePolicy): void {
        this.editingPolicy = { ...policy };
        this.policyForm.patchValue({
            name: policy.name,
            description: policy.description,
            frequency: policy.frequency,
            conditions: policy.conditions
        });
    }

    handleRemoveCondition(index: number): void {
        const conditions = this.policyForm.get('conditions')?.value || [];
        conditions.splice(index, 1);
        this.policyForm.patchValue({ conditions });
    }

    // Rule filtering methods
    hasConstantRules(report: PolicyReport): boolean {
        return report.rules?.some(rule => rule.rule_type === 'CONSTANT') || false;
    }

    hasActualRules(report: PolicyReport): boolean {
        return report.rules?.some(rule => rule.rule_type === 'ACTUAL') || false;
    }

    hasCalculatedRules(report: PolicyReport): boolean {
        return report.rules?.some(rule => rule.rule_type === 'CALCULATED') || false;
    }

    getConstantRules(report: PolicyReport): any[] {
        return report.rules?.filter(rule => rule.rule_type === 'CONSTANT') || [];
    }

    getActualRules(report: PolicyReport): any[] {
        return report.rules?.filter(rule => rule.rule_type === 'ACTUAL') || [];
    }

    getCalculatedRules(report: PolicyReport): any[] {
        return report.rules?.filter(rule => rule.rule_type === 'CALCULATED') || [];
    }

    onCategorySelection(category: ExpenseCategory, event: any): void {
        if (event.target.checked) {
            this.selectedCategories.push(category.id);
        } else {
            this.selectedCategories = this.selectedCategories.filter(id => id !== category.id);
            // Remove amounts for expense types in this category
            this.getExpenseTypesByCategory(category.id).forEach(type => {
                delete this.categoryAmounts[type.id];
            });
        }
    }

    getCategoryName(categoryId: string): string {
        const category = this.expenseCategories.find(c => c.id === categoryId);
        return category ? category.name : '';
    }

    getExpenseTypesByCategory(categoryId: string): ExpenseType[] {
        return this.expenseTypes.filter(type => type.category === categoryId);
    }

    // Helper methods for displaying policy details
    getPolicyConditions(policy: ExpensePolicy): PolicyCondition[] {
        return policy.condition || [];
    }

    getPolicyRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules || [];
    }

    getRuleUserConditions(rule: ExpenseRule): PolicyCondition[] {
        return rule.userConditions || [];
    }

    getRuleDetails(rule: any): string {
        switch (rule.rule_type) {
            case 'CONSTANT':
                return `Amount: ${rule.amount}`;
            case 'ACTUAL':
                return `Operator: ${rule.operator} ${rule.amount}`;
            case 'CALCULATED':
                return 'Custom calculated value';
            default:
                return '';
        }
    }

    addReport(policy: ExpensePolicy): void {
        this.selectedPolicy = { ...policy }; // Create a copy of the policy
        this.showReportModal = true;
        this.reportForm.reset();
        this.newReportRules = [];
        console.log('addReport - selectedPolicy:', this.selectedPolicy);
    }

    closeReportModal(): void {
        console.log('closeReportModal - before reset - selectedPolicy:', this.selectedPolicy);
        this.showReportModal = false;
        this.selectedPolicy = null;
        this.newReportRules = [];
        console.log('closeReportModal - after reset - selectedPolicy:', this.selectedPolicy);
    }

    onAddReport(): void {
        console.log('onAddReport - selectedPolicy:', this.selectedPolicy);
        if (this.isReportFormValid() && this.selectedPolicy) {
            const newReport: PolicyReport = {
                frequency: this.reportForm.value.frequency,
                rules: [...this.newReportRules]
            };
            
            if (!this.selectedPolicy.reports) {
                this.selectedPolicy.reports = [];
            }
            
            this.selectedPolicy.reports.push(newReport);
            console.log('onAddReport - after adding report - selectedPolicy:', this.selectedPolicy);
            
            // Update the policy in the policies array
            const index = this.policies.findIndex(p => p.id === this.selectedPolicy?.id);
            if (index !== -1) {
                this.policies[index] = { ...this.selectedPolicy };
                this.policies = [...this.policies]; // Trigger change detection
                console.log('onAddReport - after updating policies array - selectedPolicy:', this.selectedPolicy);
            }
            console.log(this.policies);
            this.updatePolicy()
            
        }
    }

    removeReport(policy: ExpensePolicy, report: PolicyReport): void {
        const index = policy.reports.indexOf(report);
        if (index > -1) {
            policy.reports.splice(index, 1);
        }
    }

    isReportFormValid(): boolean {
        const frequencyValid = this.reportForm.get('frequency')?.valid ?? false;
        return frequencyValid && this.newReportRules.length > 0;
    }

    updatePolicy(): void {
        if (this.selectedPolicy) {
            let body = {...this.selectedPolicy};
            this.selectedPolicy['conditions'] =  this.selectedPolicy['condition']? this.selectedPolicy['condition'] : this.selectedPolicy['conditions'];
            this.baseAPI.executePost({url: `${apiDirectory.getPolicies}${this.selectedPolicy.id}/update-policy/`, body: this.selectedPolicy}).subscribe((data: any) => {
                console.log('Policy updated:', data);
                this.closeReportModal();
            });
        }
    }

    hasConstantRulesInNewReport(): boolean {
        return this.newReportRules.some(rule => rule.rule_type === 'CONSTANT');
    }

    hasActualRulesInNewReport(): boolean {
        return this.newReportRules.some(rule => rule.rule_type === 'ACTUAL');
    }

    hasCalculatedRulesInNewReport(): boolean {
        return this.newReportRules.some(rule => rule.rule_type === 'CALCULATED');
    }

    getConstantRulesFromNewReport(): ExpenseRule[] {
        return this.newReportRules.filter(rule => rule.rule_type === 'CONSTANT');
    }

    getActualRulesFromNewReport(): ExpenseRule[] {
        return this.newReportRules.filter(rule => rule.rule_type === 'ACTUAL');
    }

    getCalculatedRulesFromNewReport(): ExpenseRule[] {
        return this.newReportRules.filter(rule => rule.rule_type === 'CALCULATED');
    }

    removeNewReportRule(index: number): void {
        this.newReportRules.splice(index, 1);
    }

    removeCondition(index: number): void {
        this.newConditions.splice(index, 1);
    }

    // Add click outside handler to close dropdown
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.value-dropdown-container')) {
            this.showValueDropdown = false;
        }
    }
} 