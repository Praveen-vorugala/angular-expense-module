import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpensePolicy, ExpenseRule, ExpenseType, ExpenseCategory, PolicyCondition, PropertyType, PropertyValue, RuleValueType, ComparisonOperator } from 'src/app/types/expense';

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
                                <p class="text-xs text-gray-400">Frequency: {{ policy.frequency }}</p>
                            </div>
                            <!-- Future: Edit/Delete buttons -->
                        </div>

                        <!-- Policy Conditions -->
                        <div *ngIf="getPolicyConditions(policy).length > 0" class="border-t pt-3">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Policy Conditions</h4>
                            <ul class="space-y-1">
                                <li *ngFor="let condition of getPolicyConditions(policy)" class="text-sm text-gray-600">
                                    {{ getPropertyTypeName(condition.propertyType) }} = {{ getPropertyValueName(condition.propertyType, condition.value) }}
                                </li>
                            </ul>
                        </div>

                        <!-- Expense Rules -->
                        <div *ngIf="getPolicyRules(policy).length > 0" class="border-t pt-3">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Expense Rules</h4>
                            
                            <!-- Constant Rules -->
                            <div *ngIf="hasConstantRules(policy)" class="mb-3">
                                <h5 class="text-xs font-medium text-gray-600 mb-1">Constant Rules</h5>
                                <ul class="space-y-2">
                                    <li *ngFor="let rule of getConstantRules(policy)" class="text-sm bg-gray-50 p-2 rounded">
                                        <div class="flex flex-col gap-1">
                                            <span class="font-medium">{{ getExpenseTypeName(rule.expenseTypeId) }}</span>
                                            <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                            <!-- User Conditions for this rule -->
                                            <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                <span class="text-xs text-gray-500">User Conditions:</span>
                                                <ul class="mt-1 space-y-1">
                                                    <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                        {{ getPropertyTypeName(condition.propertyType) }} = {{ getPropertyValueName(condition.propertyType, condition.value) }}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <!-- Actual Rules -->
                            <div *ngIf="hasActualRules(policy)" class="mb-3">
                                <h5 class="text-xs font-medium text-gray-600 mb-1">Actual Rules</h5>
                                <ul class="space-y-2">
                                    <li *ngFor="let rule of getActualRules(policy)" class="text-sm bg-gray-50 p-2 rounded">
                                        <div class="flex flex-col gap-1">
                                            <span class="font-medium">{{ getExpenseTypeName(rule.expenseTypeId) }}</span>
                                            <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                            <!-- User Conditions for this rule -->
                                            <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                <span class="text-xs text-gray-500">User Conditions:</span>
                                                <ul class="mt-1 space-y-1">
                                                    <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                        {{ getPropertyTypeName(condition.propertyType) }} = {{ getPropertyValueName(condition.propertyType, condition.value) }}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <!-- Calculated Rules -->
                            <div *ngIf="hasCalculatedRules(policy)" class="mb-3">
                                <h5 class="text-xs font-medium text-gray-600 mb-1">Calculated Rules</h5>
                                <ul class="space-y-2">
                                    <li *ngFor="let rule of getCalculatedRules(policy)" class="text-sm bg-gray-50 p-2 rounded">
                                        <div class="flex flex-col gap-1">
                                            <span class="font-medium">{{ getExpenseTypeName(rule.expenseTypeId) }}</span>
                                            <span class="text-gray-600">{{ getRuleDetails(rule) }}</span>
                                            <!-- User Conditions for this rule -->
                                            <div *ngIf="getRuleUserConditions(rule).length > 0" class="mt-1 pl-2 border-l-2 border-gray-200">
                                                <span class="text-xs text-gray-500">User Conditions:</span>
                                                <ul class="mt-1 space-y-1">
                                                    <li *ngFor="let condition of getRuleUserConditions(rule)" class="text-xs text-gray-600">
                                                        {{ getPropertyTypeName(condition.propertyType) }} = {{ getPropertyValueName(condition.propertyType, condition.value) }}
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

            <!-- Add Policy Modal -->
            <div *ngIf="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 overflow-scroll">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                    <button (click)="closeModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
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
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select formControlName="frequency" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="" disabled>Select frequency</option>
                                <option *ngFor="let freq of frequencyOptions" [value]="freq.value">{{ freq.label }}</option>
                            </select>
                        </div>

                        <!-- Conditions Section -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Conditions</label>
                                <button type="button" (click)="openConditionModal()" class="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs">Add Condition</button>
                            </div>
                            <div *ngIf="newConditions.length === 0" class="text-xs text-gray-400">No conditions added yet.</div>
                            <ul *ngIf="newConditions.length > 0" class="space-y-2">
                                <li *ngFor="let cond of newConditions; let i = index" class="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                    <span>
                                        <span class="font-semibold">{{ getPropertyTypeName(cond.propertyType) }}</span>
                                        <span class="ml-2">= {{ getPropertyValueName(cond.propertyType, cond.value) }}</span>
                                    </span>
                                    <button type="button" (click)="removeCondition(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                </li>
                            </ul>
                        </div>

                        <!-- Expense Rules Section -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Expense Rules</label>
                                <button type="button" (click)="openRuleModal()" class="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs">Add Rule</button>
                            </div>
                            <div *ngIf="newRules.length === 0" class="text-xs text-gray-400">No rules added yet.</div>
                            <ul *ngIf="newRules.length > 0" class="space-y-2">
                                <li *ngFor="let rule of newRules; let i = index" class="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                    <span>
                                        <span class="font-semibold">{{ getExpenseTypeName(rule.expenseTypeId) }}</span>
                                        <span class="ml-2">({{ rule.valueType }})</span>
                                        <span *ngIf="rule.valueType === 'CONSTANT'" class="ml-2">Amount: {{ rule.amount }}</span>
                                        <span *ngIf="rule.valueType === 'CALCULATED'" class="ml-2">Formula: {{ rule.formula }}</span>
                                    </span>
                                    <button type="button" (click)="removeRule(i)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                </li>
                            </ul>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" [disabled]="policyForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Create Policy</button>
                        </div>
                    </form>

                    <!-- Add Condition Modal -->
                    <div *ngIf="showConditionModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                            <button (click)="closeConditionModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
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
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <select formControlName="value" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="" disabled>Select value</option>
                                        <option *ngFor="let val of propertyValues" [value]="val.value">{{ val.name }}</option>
                                    </select>
                                </div>
                                <div class="flex justify-end">
                                    <button type="submit" [disabled]="conditionForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add Condition</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Add Rule Modal -->
                    <div *ngIf="showRuleModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 overflow-scroll">
                        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                            <button (click)="closeRuleModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
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
                                                <span class="font-semibold">{{ getPropertyTypeName(cond.propertyType) }}</span>
                                                <span class="ml-2">= {{ getPropertyValueName(cond.propertyType, cond.value) }}</span>
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
                            <button (click)="closeRuleConditionModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
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
        private expenseService: ExpenseService,
        private fb: FormBuilder
    ) {
        this.policyForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            frequency: ['MONTHLY', Validators.required],
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
    }

    ngOnInit(): void {
        this.expenseService.policies$.subscribe(policies => {
            this.policies = policies;
        });
        this.expenseService.expenseTypes$.subscribe(types => {
            this.expenseTypes = types;
        });
        this.expenseService.getProperties().subscribe(props => {
            this.userProperties = props;
        });
        this.expenseService.getExpenseCategories().subscribe(categories => {
            this.expenseCategories = categories;
        });
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

    onSubmit(): void {
        if (this.policyForm.valid) {
            const newPolicy: ExpensePolicy = {
                ...this.policyForm.value,
                id: Date.now().toString(),
                rules: this.newRules.map(rule => ({
                    ...rule,
                    userConditions: rule.userConditions || []
                })),
                conditions: this.newConditions
            };
            this.expenseService.addPolicy(newPolicy);
            this.closeModal();
        }
    }

    // Expense Rules logic
    openRuleModal(): void {
        this.showRuleModal = true;
        this.ruleForm.reset({ valueType: 'CONSTANT', amount: 0, formula: '', operator: '<', limitAmount: 0, userConditions: [] });
        this.ruleUserConditions = [];
    }

    closeRuleModal(): void {
        this.showRuleModal = false;
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
            const newRules: ExpenseRule[] = [];

            if (ruleData.valueType === 'CONSTANT' && ruleData.selectionType === 'expenseType') {
                newRules.push({
                    id: Date.now().toString(),
                    expenseTypeId: ruleData.expenseTypeId,
                    valueType: 'CONSTANT',
                    amount: ruleData.amount,
                    operator: '<',
                    limitAmount: 0,
                    formula: '',
                    userConditions: this.ruleUserConditions,
                    conditions: []
                });
            } else if (ruleData.valueType === 'CONSTANT' && ruleData.selectionType === 'expenseCategory') {
                this.selectedCategories.forEach(categoryId => {
                    this.getExpenseTypesByCategory(categoryId).forEach(type => {
                        if (this.categoryAmounts[type.id] !== undefined) {
                            newRules.push({
                                id: Date.now().toString() + '-' + type.id,
                                expenseTypeId: type.id,
                                valueType: 'CONSTANT',
                                amount: this.categoryAmounts[type.id],
                                operator: '<',
                                limitAmount: 0,
                                formula: '',
                                userConditions: this.ruleUserConditions,
                                conditions: []
                            });
                        }
                    });
                });
            } else if (ruleData.valueType === 'ACTUAL') {
                newRules.push({
                    id: Date.now().toString(),
                    expenseTypeId: ruleData.expenseTypeId,
                    valueType: 'ACTUAL',
                    amount: 0,
                    operator: ruleData.operator,
                    limitAmount: ruleData.limitAmount,
                    formula: '',
                    userConditions: this.ruleUserConditions,
                    conditions: []
                });
            } else if (ruleData.valueType === 'CALCULATED') {
                newRules.push({
                    id: Date.now().toString(),
                    expenseTypeId: ruleData.expenseTypeId,
                    valueType: 'CALCULATED',
                    amount: 0,
                    operator: '<',
                    limitAmount: 0,
                    formula: '',
                    userConditions: this.ruleUserConditions,
                    conditions: []
                });
            }

            if (newRules.length > 0) {
                this.newRules.push(...newRules);
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
        this.newRules.splice(index, 1);
    }

    getExpenseTypeName(typeId: string): string {
        const type = this.expenseTypes.find(t => t.id === typeId);
        return type ? type.name : typeId;
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
            this.ruleUserConditions.push({ ...this.ruleConditionForm.value });
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
        this.propertyValues = prop ? prop.values : [];
        this.conditionForm.get('value')?.setValue('');
    }

    onAddCondition(): void {
        if (this.conditionForm.valid) {
            this.newConditions.push({ ...this.conditionForm.value });
            this.closeConditionModal();
        }
    }

    removeCondition(index: number): void {
        this.newConditions.splice(index, 1);
    }

    getPropertyTypeName(type: string): string {
        const property = this.userProperties.find(p => p.type === type);
        return property ? property.name : type;
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
    }

    handleSaveRule(): void {
        if (this.ruleForm.valid) {
            const ruleData = this.ruleForm.value;
            const newRule: ExpenseRule = {
                id: Date.now().toString(),
                expenseTypeId: ruleData.expenseTypeId,
                valueType: ruleData.valueType,
                amount: ruleData.amount,
                operator: ruleData.operator,
                limitAmount: ruleData.limitAmount,
                formula: ruleData.formula,
                userConditions: ruleData.userConditions,
                conditions: []
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
                rules: []
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

    isFormValid(): boolean {
        const policy = this.editingPolicy || this.policyForm.value;
        return policy.name && policy.description && (policy.conditions?.length || 0) > 0;
    }

    // Rule filtering methods
    hasConstantRules(policy: ExpensePolicy): boolean {
        return policy.rules?.some(rule => rule.valueType === 'CONSTANT') || false;
    }

    hasActualRules(policy: ExpensePolicy): boolean {
        return policy.rules?.some(rule => rule.valueType === 'ACTUAL') || false;
    }

    hasCalculatedRules(policy: ExpensePolicy): boolean {
        return policy.rules?.some(rule => rule.valueType === 'CALCULATED') || false;
    }

    getConstantRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules?.filter(rule => rule.valueType === 'CONSTANT') || [];
    }

    getActualRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules?.filter(rule => rule.valueType === 'ACTUAL') || [];
    }

    getCalculatedRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules?.filter(rule => rule.valueType === 'CALCULATED') || [];
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
        return policy.conditions || [];
    }

    getPolicyRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules || [];
    }

    getRuleUserConditions(rule: ExpenseRule): PolicyCondition[] {
        return rule.userConditions || [];
    }

    getRuleDetails(rule: ExpenseRule): string {
        switch (rule.valueType) {
            case 'CONSTANT':
                return `Amount: ${rule.amount}`;
            case 'ACTUAL':
                return `Operator: ${rule.operator} ${rule.limitAmount}`;
            case 'CALCULATED':
                return 'Custom calculated value';
            default:
                return '';
        }
    }
} 