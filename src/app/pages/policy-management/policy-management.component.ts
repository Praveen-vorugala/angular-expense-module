import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">{{ policy.name }}</h3>
                            <p class="text-sm text-gray-500">{{ policy.description }}</p>
                            <p class="text-xs text-gray-400">Frequency: {{ policy.frequency }}</p>
                        </div>
                        <!-- Future: Edit/Delete buttons -->
                    </div>
                </div>
            </div>

            <!-- Add Policy Modal -->
            <div *ngIf="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
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
                    <div *ngIf="showRuleModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                            <button (click)="closeRuleModal()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
                            <h3 class="text-lg font-bold mb-4">Add Expense Rule</h3>
                            <form [formGroup]="ruleForm" (ngSubmit)="onAddRule()">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                                    <select formControlName="expenseTypeId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="" disabled>Select expense type</option>
                                        <option *ngFor="let type of expenseTypes" [value]="type.id">{{ type.name }}</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                                    <select formControlName="valueType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" (change)="onRuleTypeChange()">
                                        <option value="CONSTANT">CONSTANT</option>
                                        <option value="ACTUAL">ACTUAL</option>
                                        <option value="CALCULATED">CALCULATED</option>
                                    </select>
                                </div>
                                <div class="mb-4" *ngIf="ruleForm.get('valueType')?.value === 'CONSTANT'">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input type="number" formControlName="amount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter amount" />
                                </div>
                                <div class="mb-4" *ngIf="ruleForm.get('valueType')?.value === 'CALCULATED'">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                                    <input type="text" formControlName="formula" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter formula" />
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

    constructor(private expenseService: ExpenseService, private fb: FormBuilder, private dialog: MatDialog) {
        this.policyForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            frequency: ['MONTHLY', Validators.required],
            conditions: [[]]
        });
        this.ruleForm = this.fb.group({
            expenseTypeId: ['', Validators.required],
            valueType: ['CONSTANT', Validators.required],
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
    }

    openModal(): void {
        this.showModal = true;
        this.policyForm.reset();
        this.newRules = [];
        this.newConditions = [];
    }

    closeModal(): void {
        this.showModal = false;
    }

    onSubmit(): void {
        if (this.policyForm.valid) {
            const newPolicy = {
                ...this.policyForm.value,
                id: Date.now().toString(),
                rules: this.newRules,
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
        if (valueType === 'CONSTANT') {
            this.ruleForm.get('amount')?.setValidators([Validators.required, Validators.min(1)]);
            this.ruleForm.get('formula')?.clearValidators();
        } else if (valueType === 'CALCULATED') {
            this.ruleForm.get('formula')?.setValidators([Validators.required]);
            this.ruleForm.get('amount')?.clearValidators();
        } else {
            this.ruleForm.get('amount')?.clearValidators();
            this.ruleForm.get('formula')?.clearValidators();
        }
        this.ruleForm.get('amount')?.updateValueAndValidity();
        this.ruleForm.get('formula')?.updateValueAndValidity();
    }

    onAddRule(): void {
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
            this.newRules.push(newRule);
            this.closeRuleModal();
        }
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
        return policy.rules.some(rule => rule.valueType === 'CONSTANT');
    }

    hasActualRules(policy: ExpensePolicy): boolean {
        return policy.rules.some(rule => rule.valueType === 'ACTUAL');
    }

    hasCalculatedRules(policy: ExpensePolicy): boolean {
        return policy.rules.some(rule => rule.valueType === 'CALCULATED');
    }

    getConstantRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules.filter(rule => rule.valueType === 'CONSTANT');
    }

    getActualRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules.filter(rule => rule.valueType === 'ACTUAL');
    }

    getCalculatedRules(policy: ExpensePolicy): ExpenseRule[] {
        return policy.rules.filter(rule => rule.valueType === 'CALCULATED');
    }
} 