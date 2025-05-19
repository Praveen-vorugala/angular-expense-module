import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    User,
    ExpensePolicy,
    ExpenseReport,
    mockUsers,
    mockPolicies,
    mockExpenses,
    ExpenseStatus,
    ExpenseCategory,
    ExpenseType,
    mockExpenseTypes,
    mockDropdownTypes,
    DropdownType,
    DropdownOption
} from '../types/expense';

export interface ExpenseContextType {
    currentUser: User | null;
    policies: ExpensePolicy[];
    expenses: ExpenseReport[];
    expenseTypes: ExpenseType[];
    dropdownTypes: DropdownType[];
    login: (email: string) => void;
    logout: () => void;
    addExpense: (reportDate: string, policyId: string, expenses: { 
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
    }[]) => void;
    updateExpenseStatus: (expenseId: string, status: ExpenseStatus, remarks?: string) => void;
    addPolicy: (policy: Omit<ExpensePolicy, 'id'>) => void;
    updatePolicy: (policy: ExpensePolicy) => void;
    addExpenseType: (expenseType: Omit<ExpenseType, 'id'>) => void;
    updateExpenseType: (expenseType: ExpenseType) => void;
    toggleExpenseTypeStatus: (expenseTypeId: string) => void;
    addDropdownType: (type: Omit<DropdownType, 'id'>) => void;
    updateDropdownType: (type: DropdownType) => void;
    addDropdownOption: (typeId: string, option: Omit<DropdownOption, 'id'>) => void;
    updateDropdownOption: (typeId: string, option: DropdownOption) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [policies, setPolicies] = useState<ExpensePolicy[]>(mockPolicies);
    const [expenses, setExpenses] = useState<ExpenseReport[]>(mockExpenses);
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(mockExpenseTypes);
    const [dropdownTypes, setDropdownTypes] = useState<DropdownType[]>(mockDropdownTypes);

    const login = (email: string) => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
        }
        // In real app: Make API call to authenticate user
        // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email }) });
        // const user = await response.json();
        // setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
        // In real app: Make API call to logout
        // await fetch('/api/logout', { method: 'POST' });
    };

    const addExpense = (reportDate: string, policyId: string, expenseItems: {
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
    }[]) => {
        const newExpense: ExpenseReport = {
            id: (expenses.length + 1).toString(),
            employeeId: currentUser?.id || '',
            date: reportDate,
            policyId: policyId,
            expenses: expenseItems,
            status: 'PENDING',
            submittedAt: new Date().toISOString()
        };
        setExpenses([...expenses, newExpense]);
        // In real app: Make API call to create expense
        // await fetch('/api/expenses', { method: 'POST', body: JSON.stringify(newExpense) });
    };

    const updateExpenseStatus = (expenseId: string, status: ExpenseStatus, remarks?: string) => {
        setExpenses(expenses.map(expense => {
            if (expense.id === expenseId) {
                return {
                    ...expense,
                    status,
                    ...(status === 'APPROVED' && {
                        approvedBy: currentUser?.id,
                        approvedAt: new Date().toISOString()
                    }),
                    ...(status === 'REJECTED' && {
                        rejectionReason: remarks
                    }),
                    ...(status === 'REIMBURSED' && {
                        reimbursedAt: new Date().toISOString()
                    })
                };
            }
            return expense;
        }));
        // In real app: Make API call to update expense
        // await fetch(`/api/expenses/${expenseId}`, { 
        //     method: 'PUT', 
        //     body: JSON.stringify({ status, remarks }) 
        // });
    };

    const addPolicy = (policy: Omit<ExpensePolicy, 'id'>) => {
        const newPolicy: ExpensePolicy = {
            ...policy,
            id: (policies.length + 1).toString()
        };
        setPolicies([...policies, newPolicy]);
        // In real app: Make API call to create policy
        // await fetch('/api/policies', { method: 'POST', body: JSON.stringify(newPolicy) });
    };

    const updatePolicy = (policy: ExpensePolicy) => {
        setPolicies(policies.map(p => p.id === policy.id ? policy : p));
        // In real app: Make API call to update policy
        // await fetch(`/api/policies/${policy.id}`, { 
        //     method: 'PUT', 
        //     body: JSON.stringify(policy) 
        // });
    };

    const addExpenseType = (expenseType: Omit<ExpenseType, 'id'>) => {
        const newExpenseType: ExpenseType = {
            ...expenseType,
            id: (expenseTypes.length + 1).toString()
        };
        setExpenseTypes([...expenseTypes, newExpenseType]);
    };

    const updateExpenseType = (expenseType: ExpenseType) => {
        setExpenseTypes(expenseTypes.map(et => et.id === expenseType.id ? expenseType : et));
    };

    const toggleExpenseTypeStatus = (expenseTypeId: string) => {
        setExpenseTypes(expenseTypes.map(et => 
            et.id === expenseTypeId ? { ...et, isActive: !et.isActive } : et
        ));
    };

    const addDropdownType = (type: Omit<DropdownType, 'id'>) => {
        const newType: DropdownType = {
            ...type,
            id: Date.now().toString()
        };
        setDropdownTypes(prev => [...prev, newType]);
    };

    const updateDropdownType = (type: DropdownType) => {
        setDropdownTypes(prev =>
            prev.map(t => (t.id === type.id ? type : t))
        );
    };

    const addDropdownOption = (typeId: string, option: Omit<DropdownOption, 'id'>) => {
        const newOption: DropdownOption = {
            ...option,
            id: Date.now().toString()
        };
        setDropdownTypes(prev =>
            prev.map(type =>
                type.id === typeId
                    ? { ...type, options: [...type.options, newOption] }
                    : type
            )
        );
    };

    const updateDropdownOption = (typeId: string, option: DropdownOption) => {
        setDropdownTypes(prev =>
            prev.map(type =>
                type.id === typeId
                    ? {
                          ...type,
                          options: type.options.map(opt =>
                              opt.id === option.id ? option : opt
                          )
                      }
                    : type
            )
        );
    };

    return (
        <ExpenseContext.Provider value={{
            currentUser,
            policies,
            expenses,
            expenseTypes,
            dropdownTypes,
            login,
            logout,
            addExpense,
            updateExpenseStatus,
            addPolicy,
            updatePolicy,
            addExpenseType,
            updateExpenseType,
            toggleExpenseTypeStatus,
            addDropdownType,
            updateDropdownType,
            addDropdownOption,
            updateDropdownOption
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}; 