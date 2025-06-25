import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpensePolicy, ExpenseRule, ExpenseType, ExpenseCategory, PolicyCondition, PropertyType, PropertyValue, RuleValueType, ComparisonOperator, PolicyReport, CONDITION_MOCK_PROPERTIES } from 'src/app/types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';

@Component({
    selector: 'app-policy-management',
    templateUrl: './policy-management.component.html',
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
    userConditionProperties:any = CONDITION_MOCK_PROPERTIES;
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
    newReportRules: ExpenseRule[] = [];
    currentReport: PolicyReport | null = null;
    selectedPropertyValues: string[] = [];
    availablePropertyValues: PropertyValue[] = [];
    showValueDropdown = false;
    showViewPolicyModal = false;
    selectedPolicyDetails: any = null;
    isLoading:boolean = false;

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
            userConditions: [[]],
            threshold: [0],
            rate_before_threshold: [0],
            rate_after_threshold: [0],
            frequency: ['DAILY'],
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

    viewPolicy(policy: any,showModal:boolean = true): void {
        this.baseAPI.executeGet({url: `${apiDirectory.getPolicies}${policy.id}/`}).subscribe((data: any) => {
            this.selectedPolicyDetails = data;
            !showModal? this.selectedPolicy = data : this.selectedPolicy = null;
            if(this.selectedPolicy){
                if(this.selectedPolicy['reports'].length>0){
                    this.selectedPolicy['reports'].forEach((report: any) => {
                        report.rules.forEach((rule: any) => {
                            rule['expense_type'] = rule['expense_type'].hasOwnProperty('id')? rule['expense_type']['id'] : rule['expense_type'];
                        })
                    })
                 this.newReportRules = this.flattenGroupedRules(this.selectedPolicy['reports'])['rules'];
                 console.log(this.newReportRules);
                }
            } 
            console.log(this.selectedPolicy);
            this.showViewPolicyModal = showModal;
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
        this.isLoading = true;
        const params = new Map<string, string>();
        params.set('ordering', '-created_at');
        this.baseAPI.executeGet({url: apiDirectory.getPolicies,params:params}).subscribe((data: any) => {
            this.isLoading = false;
            this.policies = data.results;
            console.log(this.policies);
            
        })
    }

    getExpenseTypes(): void {
        const params =  new Map<string, string>();
        params.set('is_active', 'true');
        params.set('page_size', '40');
        this.baseAPI.executeGet({url: apiDirectory.expenseTypes,params:params}).subscribe((data: any) => {
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
            this.getPolicies();
        });
    }

    // Expense Rules logic
    openRuleModal(policy: ExpensePolicy | null, report: PolicyReport | null = null): void {
        this.showRuleModal = true;
        console.log("open");
        
        this.ruleForm.reset({ 
            valueType: 'CONSTANT', 
            amount: 0, 
            formula: '', 
            operator: '<', 
            limitAmount: 0, 
            userConditions: [], 
            threshold: 0, 
            rate_before_threshold: 0, 
            rate_after_threshold: 0,
            frequency:'DAILY'
        });
        this.ruleUserConditions = [];
        this.selectedPolicy = policy;
        this.currentReport = report;
        this.showRuleForm = !!report;

        // If editing an existing rule, populate the form
        if (report && report.rules && report.rules.length > 0) {
            const rule = report.rules[0]; // Assuming we're editing the first rule
            if (rule.rule_type === 'CALCULATED' && rule.meta_data) {
                this.ruleForm.patchValue({
                    valueType: rule.rule_type,
                    expenseTypeId: rule.expense_type,
                    threshold: rule.meta_data.threshold,
                    rate_before_threshold: rule.meta_data.rate_before_threshold,
                    rate_after_threshold: rule.meta_data.rate_after_threshold
                });
            }
        }
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
            selectionType: 'expenseType',
            threshold: 0,
            rate_before_threshold: 0,
            rate_after_threshold: 0
        });

        // Clear validators
        this.ruleForm.get('expenseTypeId')?.clearValidators();
        this.ruleForm.get('amount')?.clearValidators();
        this.ruleForm.get('operator')?.clearValidators();
        this.ruleForm.get('limitAmount')?.clearValidators();
        this.ruleForm.get('formula')?.clearValidators();
        this.ruleForm.get('threshold')?.clearValidators();
        this.ruleForm.get('rate_before_threshold')?.clearValidators();
        this.ruleForm.get('rate_after_threshold')?.clearValidators();

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
            this.ruleForm.get('threshold')?.setValidators([Validators.required, Validators.min(0)]);
            this.ruleForm.get('rate_before_threshold')?.setValidators([Validators.required, Validators.min(0)]);
            this.ruleForm.get('rate_after_threshold')?.setValidators([Validators.required, Validators.min(0)]);
        }

        // Update validity
        this.ruleForm.get('expenseTypeId')?.updateValueAndValidity();
        this.ruleForm.get('amount')?.updateValueAndValidity();
        this.ruleForm.get('operator')?.updateValueAndValidity();
        this.ruleForm.get('limitAmount')?.updateValueAndValidity();
        this.ruleForm.get('formula')?.updateValueAndValidity();
        this.ruleForm.get('threshold')?.updateValueAndValidity();
        this.ruleForm.get('rate_before_threshold')?.updateValueAndValidity();
        this.ruleForm.get('rate_after_threshold')?.updateValueAndValidity();
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
                    conditions: this.ruleUserConditions,
                    frequency: ruleData.frequency,
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
                                conditions: this.ruleUserConditions,
                                frequency: ruleData.frequency,
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
                    conditions: this.ruleUserConditions,
                    frequency: ruleData.frequency,
                });
            } else if (ruleData.valueType === 'CALCULATED') {
                newRules.push({
                    expense_type: parseInt(ruleData.expenseTypeId),
                    rule_type: ruleData.valueType,
                    amount: 0,
                    operator: '<',
                    conditions: this.ruleUserConditions,
                    frequency: ruleData.frequency,
                    meta_data: {
                        threshold: ruleData.threshold,
                        rate_before_threshold: ruleData.rate_before_threshold,
                        rate_after_threshold: ruleData.rate_after_threshold
                    }
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
            console.log(newRules);
            
        }
    }

    resetRuleForm(): void {
        console.log("rest");
        this.ruleForm.reset({
            valueType: '',
            selectionType: 'expenseType',
            expenseTypeId: '',
            amount: 0,
            operator: '<',
            limitAmount: 0,
            formula: '',
            userConditions: [],
            threshold: 0,
            rate_before_threshold: 0,
            rate_after_threshold: 0,
            frequency: 'DAILY',
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
        const prop = this.userConditionProperties.find((p:any) => p.type === selectedType);
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
        console.log("handle");
        this.ruleForm.reset({
            valueType: 'CONSTANT',
            amount: 0,
            operator: '<',
            limitAmount: 0,
            formula: '',
            userConditions: [],
            threshold: 0,
            rate_before_threshold: 0,
            rate_after_threshold: 0,
           frequency: 'DAILY',
        });
        console.log('addReport - selectedPolicy:', this.selectedPolicy);
    }

    handleSaveRule(): void {
        console.log("kefpekfp");
        
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
                return `< ${rule.amount}`;
            case 'CALCULATED':
                if (rule.meta_data) {
                    return `Threshold: ${rule.meta_data.threshold}, Rate Before: ${rule.meta_data.rate_before_threshold}, Rate After: ${rule.meta_data.rate_after_threshold}`;
                }
                return 'Custom calculated value';
            default:
                return '';
        }
    }

    addReport(policy: any): void {
        this.viewPolicy(policy,false);
        // this.selectedPolicy = { ...policy }; // Create a copy of the policy
        this.showReportModal = true;
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

    flattenGroupedRules(input: any): any{
        const rules: any[] = [];
        input.forEach((group:any) => {
            group.rules.forEach((rule:any) => {
            // Ensure each rule has the correct frequency
            rules.push({ ...rule, frequency: group.frequency });
            });
        });
        return { rules };
    }

    groupRulesByFrequency(input: any): any {
        const grouped: { [key: string]: any[] } = {};

        input.rules.forEach((rule:any) => {
            if (!grouped[rule.frequency]) {
            grouped[rule.frequency] = [];
            }
            grouped[rule.frequency].push(rule);
        });

        return Object.entries(grouped).map(([frequency, rules]) => ({
            frequency,
            rules,
        }));
    }

    onAddReport(): void {
        console.log('onAddReport - selectedPolicy:', this.selectedPolicy);
        if (this.selectedPolicy) {
            const newReport: PolicyReport = {
                rules: [...this.newReportRules]
            };
            console.log(this.newReportRules);
            console.log(newReport);
            
            let currentReport = this.groupRulesByFrequency(newReport);
            console.log(currentReport);
            
            if (!this.selectedPolicy.reports) {
                this.selectedPolicy.reports = [];
            }
            
            this.selectedPolicy.reports = currentReport;
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