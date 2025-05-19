export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type ExpenseCategory = 'FIELDWORK' | 'MEALS' | 'LODGING' | 'OTHER' | 'ADMIN';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
export type Grade = 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'MS5';
export type PolicyFrequency = 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY';
export type RuleValueType = 'ACTUAL' | 'CONSTANT' | 'CALCULATED';
export type ComparisonOperator = '<' | '>' | '<=' | '>=';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    grade: Grade;
}

export interface ExpenseType {
    id: string;
    name: string;
    description: string;
    category: ExpenseCategory;
    isActive: boolean;
}

export interface PolicyCondition {
    propertyType: 'ROLE' | 'GRADE' | 'POSITION';
    value: string;
}

export interface ExpenseRule {
    id: string;
    groupId?: string;
    expenseTypeId: string;
    valueType: RuleValueType;
    amount: number;
    operator?: ComparisonOperator;
    limitAmount?: number;
    userConditions: PolicyCondition[];
    conditions?: {
        dropdownTypeId: string;
        optionId: string;
        amount: number;
    }[];
}

export interface ExpensePolicy {
    id: string;
    name: string;
    description: string;
    frequency: PolicyFrequency;
    conditions: PolicyCondition[];
    rules: ExpenseRule[];
}

export interface ExpenseItem {
    expenseTypeId: string;
    amount: number;
    description: string;
    receiptUrl: string;
    travelDetails?: {
        fromCity: string;
        toCity: string;
        kilometers: number;
        tripType: 'ONE_WAY' | 'TWO_WAY';
        calculatedFare: number;
    };
}

export interface ExpenseReport {
    id: string;
    employeeId: string;
    date: string;
    policyId: string;
    expenses: ExpenseItem[];
    status: ExpenseStatus;
    submittedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    reimbursedAt?: string;
}

export interface DropdownOption {
    id: string;
    value: string;
    isActive: boolean;
}

export interface DropdownType {
    id: string;
    name: string;
    description: string;
    options: DropdownOption[];
    isActive: boolean;
} 