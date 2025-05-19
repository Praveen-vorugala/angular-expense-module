export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type ExpenseCategory = 'FIELDWORK' | 'MEALS' | 'LODGING' | 'OTHER'| 'ADMIN';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export type Grade = 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'MS5';

export type PolicyFrequency = 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY';

export type RuleValueType = 'ACTUAL' | 'CONSTANT' | 'CALCULATED';

export type ComparisonOperator = '<' | '>' | '<=' | '>=';

export interface ExpenseType {
    id: string;
    name: string;
    description: string;
    category: ExpenseCategory;
    isActive: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    grade: Grade;
}

export interface ExpenseTypeLimit {
    expenseTypeId: string;
    amount: number;
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

export interface PolicyCondition {
    propertyType: 'ROLE' | 'GRADE' | 'POSITION';
    value: string;
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

// Mock data for static usage
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
        isActive: true
    },
    {
        id: '2',
        name: 'Ex-HQ',
        description: 'Expenses outside headquarters',
        category: 'FIELDWORK',
        isActive: true
    },
    {
        id: '3',
        name: 'Hill-station',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        isActive: true
    },
    {
        id: '4',
        name: 'OS',
        description: 'Expenses related to hill station visits',
        category: 'FIELDWORK',
        isActive: true
    },
    {
        id: '5',
        name: 'Meeting with Accomadation',
        description: 'Expenses related to hill station visits',
        category: 'ADMIN',
        isActive: true
    },
    {
        id: '6',
        name: 'Meeting without Accomadation',
        description: 'Expenses related to hill station visits',
        category: 'ADMIN',
        isActive: true
    },
    {
        id: '7',
        name: 'Petrol Allownce',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        isActive: true
    },
    {
        id: '8',
        name: 'Miscellanous',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        isActive: true
    },
    {
        id: '9',
        name: 'Local conveyance',
        description: 'Expenses related to hill station visits',
        category: 'OTHER',
        isActive: true
    }
];

export const mockPolicies: ExpensePolicy[] = [
    {
        id: '1',
        name: 'Standard Travel Policy',
        description: 'Standard policy for all travel related expenses',
        frequency: 'MONTHLY',
        conditions: [
            { propertyType: 'ROLE', value: 'EMPLOYEE' },
            { propertyType: 'GRADE', value: 'MS1' }
        ],
        rules: [{
            id: '1',
            expenseTypeId: '1',
            valueType: 'CONSTANT',
            amount: 1000,
            userConditions: [],
            conditions: []
        }]
    },
    {
        id: '2',
        name: 'Food & Dining Policy',
        description: 'Policy covering all food and dining expenses',
        frequency: 'DAILY',
        conditions: [
            { propertyType: 'ROLE', value: 'MANAGER' },
            { propertyType: 'GRADE', value: 'MS3' }
        ],
        rules: []
    },
    {
        "name": "New Policy for ms 1",
        "description": "For ms1",
        "frequency": "DAILY",
        "conditions": [
            {
                "propertyType": "ROLE",
                "value": "EMPLOYEE"
            },
            {
                "propertyType": "GRADE",
                "value": "MS1"
            }
        ],
        "rules": [
            {
                "id": "1747306007609-1",
                "groupId": "1747306007609",
                "expenseTypeId": "1",
                "valueType": "CONSTANT",
                "amount": 325,
                "userConditions": []
            },
            {
                "id": "1747306007609-2",
                "groupId": "1747306007609",
                "expenseTypeId": "2",
                "valueType": "CONSTANT",
                "amount": 325,
                "userConditions": []
            },
            {
                "id": "1747306007609-4",
                "groupId": "1747306007609",
                "expenseTypeId": "4",
                "valueType": "CONSTANT",
                "amount": 800,
                "userConditions": []
            },
            {
                "id": "1747306007609-5",
                "groupId": "1747306007609",
                "expenseTypeId": "5",
                "valueType": "CONSTANT",
                "amount": 200,
                "userConditions": []
            },
            {
                "id": "1747306007609-6",
                "groupId": "1747306007609",
                "expenseTypeId": "6",
                "valueType": "CONSTANT",
                "amount": 900,
                "userConditions": []
            },
            {
                "id": "1747306017967",
                "expenseTypeId": "8",
                "valueType": "ACTUAL",
                "amount": 0,
                "operator": "<",
                "limitAmount": 1000,
                "userConditions": []
            },
            {
                "id": "1747306031250",
                "expenseTypeId": "9",
                "valueType": "ACTUAL",
                "amount": 0,
                "operator": "<",
                "limitAmount": 500,
                "userConditions": []
            },
            {
                "id": "1747311621860",
                "expenseTypeId": "7",
                "valueType": "CALCULATED",
                "amount": 0,
                "userConditions": []
            }
        ],
        "id": "3"
    }
];

export const mockExpenses: ExpenseReport[] = [
    {
        id: '1',
        employeeId: '3',
        date: '2025-05-15',
        policyId: '1',
        expenses: [
            {
                expenseTypeId: '1',
                amount: 850,
                description: 'Flight to New York',
                receiptUrl: '/mock-receipt-1.pdf',
            },
            {
                expenseTypeId: '5',
                amount: 200,
                description: 'Meeting accommodation in New York',
                receiptUrl: '/mock-receipt-1a.pdf',
            }
        ],
        status: 'PENDING',
        submittedAt: '2024-03-16T10:00:00Z'
    },
    {
        id: '2',
        employeeId: '3',
        date: '2025-05-16',
        policyId: '2',
        expenses: [
            {
                expenseTypeId: '2',
                amount: 75,
                description: 'Client dinner',
                receiptUrl: '/mock-receipt-2.pdf',
            },
            {
                expenseTypeId: '9',
                amount: 30,
                description: 'Local taxi to client office',
                receiptUrl: '/mock-receipt-2a.pdf',
            }
        ],
        status: 'APPROVED',
        submittedAt: '2024-03-17T09:00:00Z',
        approvedBy: '2',
        approvedAt: '2024-03-17T14:00:00Z'
    }
];

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