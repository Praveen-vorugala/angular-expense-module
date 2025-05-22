import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { 
    User, 
    ExpensePolicy, 
    ExpenseReport, 
    ExpenseType, 
    ExpenseStatus,
    DropdownType,
    DropdownOption,
    PropertyType,
    PropertyValue,
    mockUsers,
    mockExpenseTypes,
    mockPolicies,
    mockExpenses,
    mockDropdownTypes,
    MOCK_PROPERTIES,
    ExpenseCategory,
    ExpenseItem
} from '../types/expense';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private policiesSubject = new BehaviorSubject<ExpensePolicy[]>(mockPolicies);
    private expensesSubject = new BehaviorSubject<ExpenseReport[]>(mockExpenses);
    private expenseTypesSubject = new BehaviorSubject<ExpenseType[]>(mockExpenseTypes);
    private dropdownTypesSubject = new BehaviorSubject<DropdownType[]>(mockDropdownTypes);
    private propertiesSubject = new BehaviorSubject<PropertyType[]>(MOCK_PROPERTIES);

    currentUser$ = this.currentUserSubject.asObservable();
    policies$ = this.policiesSubject.asObservable();
    expenses$ = this.expensesSubject.asObservable();
    expenseTypes$ = this.expenseTypesSubject.asObservable();
    dropdownTypes$ = this.dropdownTypesSubject.asObservable();
    properties$ = this.propertiesSubject.asObservable();

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getPolicies(): ExpensePolicy[] {
        return this.policiesSubject.value;
    }

    constructor() {}

    login(user: any): Observable<any> {
        // const user = mockUsers.find(u => u.email === email);
        // if (user) {
            this.currentUserSubject.next(user);
            return of(user);
        // }
        // return of(null);
    }

    logout(): void {
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
    }

    getDropdownTypes(): Observable<DropdownType[]> {
        return of(mockDropdownTypes);
    }

    createDropdownType(type: Omit<DropdownType, 'id'>): Observable<DropdownType> {
        const newType: DropdownType = {
            ...type,
            id: Date.now().toString(),
            options: type.options || []
        };
        mockDropdownTypes.push(newType);
        return of(newType);
    }

    deleteDropdownType(id: string): Observable<void> {
        const index = mockDropdownTypes.findIndex(type => type.id === id);
        if (index !== -1) {
            mockDropdownTypes.splice(index, 1);
        }
        return of(void 0);
    }

    addDropdownOption(typeId: string, option: Omit<DropdownOption, 'id'>): void {
        const newOption: DropdownOption = {
            ...option,
            id: Date.now().toString()
        };
        const type = mockDropdownTypes.find(t => t.id === typeId);
        if (type) {
            type.options = [...(type.options || []), newOption];
        }
    }

    updateDropdownOption(typeId: string, option: DropdownOption): void {
        const type = mockDropdownTypes.find(t => t.id === typeId);
        if (type && type.options) {
            const index = type.options.findIndex(opt => opt.id === option.id);
            if (index !== -1) {
                type.options[index] = option;
            }
        }
    }

    getProperties(): Observable<PropertyType[]> {
        return of(MOCK_PROPERTIES);
    }

    getExpenseTypes(): Observable<ExpenseType[]> {
        return this.expenseTypes$;
    }

    submitExpense(expense: ExpenseReport): Observable<ExpenseReport> {
        // Add to mock expenses
        mockExpenses.push({...expense, id: Date.now().toString()});
        this.expensesSubject.next([...mockExpenses]);
        return of({...expense, id: Date.now().toString()});
    }

    createProperty(property: Omit<PropertyType, 'id' | 'createdAt' | 'updatedAt' | 'values'>): Observable<PropertyType> {
        const newProperty: PropertyType = {
            ...property,
            id: Date.now().toString(),
            values: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        MOCK_PROPERTIES.push(newProperty);
        this.propertiesSubject.next([...MOCK_PROPERTIES]);
        return of(newProperty);
    }

    deleteProperty(id: string): Observable<void> {
        const index = MOCK_PROPERTIES.findIndex(prop => prop.id === id);
        if (index !== -1) {
            MOCK_PROPERTIES.splice(index, 1);
            this.propertiesSubject.next([...MOCK_PROPERTIES]);
        }
        return of(void 0);
    }

    addPropertyValue(propertyId: string, value: Omit<PropertyValue, 'id'>): Observable<PropertyValue> {
        const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
        if (property) {
            const newValue: PropertyValue = {
                ...value,
                id: Date.now().toString()
            };
            property.values.push(newValue);
            property.updatedAt = new Date();
            this.propertiesSubject.next([...MOCK_PROPERTIES]);
            return of(newValue);
        }
        return of(null as any);
    }

    deletePropertyValue(propertyId: string, valueId: string): Observable<void> {
        const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
        if (property) {
            const idx = property.values.findIndex(v => v.id === valueId);
            if (idx !== -1) {
                property.values.splice(idx, 1);
                property.updatedAt = new Date();
                this.propertiesSubject.next([...MOCK_PROPERTIES]);
            }
        }
        return of(void 0);
    }

    private currentExpense: ExpenseReport | null = null;

    getCurrentExpense(): ExpenseReport | null {
        return this.currentExpense;
    }

    setCurrentExpense(expense: ExpenseReport): void {
        this.currentExpense = expense;
    }

    addExpenseItem(expenseItem: ExpenseItem): void {
        if (!this.currentExpense) {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return;

            this.currentExpense = {
                frequency : 'DAILY',
                expenses: [],
                total_amount: 0,
                submitted_at: new Date().toISOString()
            };
        }

        // Check if this expense type is already added
        const existingItem = this.currentExpense.expenses.find(item => item.expense_type === expenseItem.expense_type);
        if (existingItem) {
            alert('This expense type has already been added');
            return;
        }

        this.currentExpense.expenses.push(expenseItem);
    }

    submitCurrentExpense(): Observable<ExpenseReport> {
        if (!this.currentExpense) {
            throw new Error('No expenses to submit');
        }

        const newExpense = { ...this.currentExpense };
        mockExpenses.push(newExpense);
        this.expensesSubject.next([...mockExpenses]);
        this.currentExpense = null;

        return of(newExpense);
    }

    updateExpenseStatus(expenseId: string, status: ExpenseStatus, remarks?: string): void {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser) return;

        const expense = mockExpenses.find(e => e.id === expenseId);
        if (expense) {
            expense.status = status;
            if (status === 'APPROVED') {
                expense.approvedBy = currentUser.id;
                expense.approvedAt = new Date().toISOString();
            } else if (status === 'REJECTED') {
                expense.rejectionReason = remarks;
            } else if (status === 'REIMBURSED') {
                expense.reimbursedAt = new Date().toISOString();
            }
            this.expensesSubject.next([...mockExpenses]);
        }
    }

    addPolicy(policy: Omit<ExpensePolicy, 'id'>): void {
        const newPolicy: ExpensePolicy = {
            ...policy,
            id: (mockPolicies.length + 1).toString()
        };
        mockPolicies.push(newPolicy);
        this.policiesSubject.next([...mockPolicies]);
    }

    updatePolicy(policy: ExpensePolicy): void {
        const index = mockPolicies.findIndex(p => p.id === policy.id);
        if (index !== -1) {
            mockPolicies[index] = policy;
            this.policiesSubject.next([...mockPolicies]);
        }
    }

    addExpenseType(expenseType: Omit<ExpenseType, 'id'>): void {
        const newExpenseType: ExpenseType = {
            ...expenseType,
            id: (mockExpenseTypes.length + 1).toString()
        };
        mockExpenseTypes.push(newExpenseType);
        this.expenseTypesSubject.next([...mockExpenseTypes]);
    }

    updateExpenseType(expenseType: ExpenseType): void {
        const index = mockExpenseTypes.findIndex(et => et.id === expenseType.id);
        if (index !== -1) {
            mockExpenseTypes[index] = expenseType;
            this.expenseTypesSubject.next([...mockExpenseTypes]);
        }
    }

    toggleExpenseTypeStatus(expenseTypeId: string): void {
        const expenseType = mockExpenseTypes.find(et => et.id === expenseTypeId);
        if (expenseType) {
            expenseType.is_active = !expenseType.is_active;
            this.expenseTypesSubject.next([...mockExpenseTypes]);
        }
    }

    getExpenseCategories(): Observable<ExpenseCategory[]> {
        // For now, return mock data. Replace with actual API call later
        return of([
            { id: 'FIELDWORK', name: 'Fieldwork', description: 'Fieldwork related expenses' },
            { id: 'MEALS', name: 'Meals', description: 'Meal related expenses' },
            { id: 'LODGING', name: 'Lodging', description: 'Lodging related expenses' },
            { id: 'OTHER', name: 'Other', description: 'Other expenses' },
            { id: 'ADMIN', name: 'Admin', description: 'Administrative expenses' }
        ]);
    }
}