export interface DropdownOption {
    id: string;
    value: string;
    isActive: boolean;
}

export interface DropdownType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    options?: DropdownOption[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    grade: string;
}

export interface ExpensePolicy {
    id: string;
    name: string;
    description: string;
    frequency: 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    conditions: PolicyCondition[];
    condition?: PolicyCondition[];
    rules: ExpenseRule[];
    reports: PolicyReport[];
}

export interface ExpenseCategory {
    id: string;
    name: string;
    description?: string;
}

export interface ExpenseType {
    id: string;
    name: string;
    category: string;
    description?: string;
    is_active: boolean;
    category_name?: string;
}

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface ExpenseReport {
    id: string;
    employeeId: string;
    date: string;
    policyId: string;
    expenses: any[];
    status: ExpenseStatus;
    submittedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    reimbursedAt?: string;
}

export interface PolicyReport {
    frequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY';
    rules: ExpenseRule[];
}

// Mock Data
export const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        grade: 'MS5'
    },
    {
        id: '2',
        name: 'Mike Manager',
        email: 'manager@example.com',
        role: 'MANAGER',
        grade: 'MS4'
    },
    {
        id: '3',
        name: 'Emily Employee',
        email: 'employee@example.com',
        role: 'EMPLOYEE',
        grade: 'MS2'
    }
];

export const mockExpenseTypes: ExpenseType[] = [
    {
        id: '1',
        name: 'HQ',
        description: 'Expenses related to headquarters operations',
        category: 'FIELDWORK',
        is_active: true
    },
    {
        id: '2',
        name: 'Ex-HQ',
        description: 'Expenses outside headquarters',
        category: 'FIELDWORK',
        is_active: true
    },
    {
        id: '3',
        name: 'Hill-station',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        is_active: true
    },
    {
        id: '4',
        name: 'OS',
        description: 'Expenses related to hill station visits',
        category: 'FIELDWORK',
        is_active: true
    },
    {
        id: '5',
        name: 'Meeting with Accomadation',
        description: 'Expenses related to hill station visits',
        category: 'ADMIN',
        is_active: true
    },
    {
        id: '6',
        name: 'Meeting without Accomadation',
        description: 'Expenses related to hill station visits',
        category: 'ADMIN',
        is_active: true
    },
    {
        id: '7',
        name: 'Petrol Allowance',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        is_active: true
    },
    {
        id: '8',
        name: 'Miscellanous',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        is_active: true
    },
    {
        id: '9',
        name: 'Local conveyance',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        is_active: true
    }
];

export const mockPolicies: ExpensePolicy[] = [
    {
        id: '1',
        name: 'Standard Travel Policy',
        description: 'Standard policy for all travel related expenses',
        frequency: 'MONTHLY',
        conditions: [
            { property_type: 'ROLE', value: 'EMPLOYEE' },
            { property_type: 'GRADE', value: 'MS1' }
        ],
        rules: [{
            expense_type: 1,
            rule_type: 'CONSTANT',
            amount: 1000,
            operator: '<',
            conditions: [],
            userConditions: []
        }],
        reports: []
    },
    {
        "name": "New Policy for ms 1",
        "description": "For ms1",
        "id": "2",
        "frequency": "DAILY",
        "conditions": [
            {
                "property_type": "ROLE",
                "value": "EMPLOYEE"
            },
            {
                "property_type": "GRADE",
                "value": "MS1"
            }
        ],
        "rules": [
            {
                "expense_type": 1,
                "rule_type": "CONSTANT",
                "amount": 325,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 2,
                "rule_type": "CONSTANT",
                "amount": 325,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 4,
                "rule_type": "CONSTANT",
                "amount": 800,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 5,
                "rule_type": "CONSTANT",
                "amount": 200,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 6,
                "rule_type": "CONSTANT",
                "amount": 900,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 8,
                "rule_type": "ACTUAL",
                "amount": 1000,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 9,
                "rule_type": "ACTUAL",
                "amount": 500,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            },
            {
                "expense_type": 7,
                "rule_type": "CALCULATED",
                "amount": 0,
                "operator": "<",
                "conditions": [],
                "userConditions": []
            }
        ],
        reports: []
    },
    {
        "name": "Policy for ms3",
        "description": "des",
        "frequency": "DAILY",
        "conditions": [
            {
                "property_type": "ROLE",
                "value": "EMPLOYEE"
            }
        ],
        "id": "3",
        "rules": [],
        "reports": []
    }
];

export const mockExpenses: ExpenseReport[] = [];

export const mockDropdownTypes: DropdownType[] = [
    {
        id: '1',
        name: 'Cities',
        description: 'Indian Cities',
        isActive: true,
        options: [
            { id: '1', value: 'Mumbai', isActive: true },
            { id: '2', value: 'Delhi', isActive: true },
            { id: '3', value: 'Bangalore', isActive: true },
            { id: '4', value: 'Chennai', isActive: true }
        ]
    },
    {
        id: '2',
        name: 'Products',
        description: 'Available Products',
        isActive: true,
        options: [
            { id: '1', value: 'Product A', isActive: true },
            { id: '2', value: 'Product B', isActive: true },
            { id: '3', value: 'Product C', isActive: true }
        ]
    }
];

// Property value type
export interface PropertyValue {
    id: string;
    value: string;
    name: string;
}

// Property type
export interface PropertyType {
    id: string;
    name: string;
    type: string;
    values: PropertyValue[];
    createdAt: Date;
    updatedAt: Date;
    url?: string;
}

export const MOCK_PROPERTIES: PropertyType[] = [
    {
        id: '1',
        name: 'Role',
        type: 'ROLE',
        values: [
            { id: '1-1', value: 'EMPLOYEE', name: 'Employee Role' },
            { id: '1-2', value: 'MANAGER', name: 'Manager Role' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/api/auth/roles/'
    },
    {
        id: '2',
        name: 'Grade',
        type: 'GRADE',
        values: [
            { id: '2-1', value: 'MS1', name: 'Grade MS1' },
            { id: '2-2', value: 'MS2', name: 'Grade MS2' },
            { id: '2-3', value: 'MS3', name: 'Grade MS3' },
            { id: '2-4', value: 'MS4', name: 'Grade MS4' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/api/auth/grades/'
    },
    {
        id: '3',
        name: 'Position',
        type: 'POSITION',
        values: [
            { id: '3-1', value: 'FULLTIME', name: 'Full-time Position' },
            { id: '3-2', value: 'PROBATION', name: 'Probation Position' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export type RuleValueType = 'CONSTANT' | 'ACTUAL' | 'CALCULATED';
export type ComparisonOperator = '<' | '>' | '<=' | '>=';

export interface PolicyCondition {
    property_type: string;
    value: string | string[];  // Allow both single string and array of strings
}

export interface ExpenseRule {
    expense_type: number;
    rule_type: RuleValueType;
    amount: number;
    operator: ComparisonOperator;
    conditions: any[];
    userConditions: PolicyCondition[];
}