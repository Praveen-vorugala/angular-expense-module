import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType, User, ExpensePolicy, ExpenseItem, ExpenseReport } from '../../types/expense';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
    expenseForm: FormGroup;
    expenseTypes: ExpenseType[] = [];
    selectedFiles: Map<string, File> = new Map();
    currentExpense: ExpenseReport = {
        id: '',
        employeeId: '',
        date: new Date().toISOString(),
        policyId: '',
        items: [],
        totalAmount: 0,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        approvedBy: undefined,
        approvedAt: undefined,
        rejectionReason: undefined,
        reimbursedAt: undefined
    };
    usedExpenseTypes: Set<string> = new Set();
    showDropdown: boolean = false;
    isPetrolAllowance: boolean = false;
    petrolRate: number = 2.15; // Default rate
    distance: number = 0; // Calculated distance

    constructor(
        private fb: FormBuilder,
        private expenseService: ExpenseService,
        private router: Router
    ) {
        this.expenseForm = this.fb.group({
            expenseType: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0)]],
            description: [''],
            receiptFile: [null],
            fromLocation: [''],
            toLocation: ['']
        });

        // Initialize employeeId and policyId from service
        const currentUser = this.expenseService.getCurrentUser();
        if (currentUser) {
            this.currentExpense.employeeId = currentUser.id;
        }

        const policies = this.expenseService.getPolicies();
        if (policies && policies.length > 0) {
            this.currentExpense.policyId = policies[0].id; // Use first active policy
        }
    }

    calculateDistanceAndAmount(from: string, to: string): void {
        // For now, we'll use a mock distance calculation
        // In a real application, you would use a mapping API like Google Maps API
        const mockDistance = 10; // Mock distance in KM
        this.distance = mockDistance;
        const amount = mockDistance * this.petrolRate;
        this.expenseForm.get('amount')?.setValue(amount);
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    selectExpenseType(type: ExpenseType) {
        this.expenseForm.get('expenseType')?.setValue(type.id);
        this.showDropdown = false;
        
        // Update form based on expense type
        this.expenseForm.get('expenseType')?.markAsDirty();
        this.expenseForm.get('expenseType')?.markAsTouched();
        this.expenseForm.updateValueAndValidity();
    }



    get expenseTypeErrors(): any {
        const control = this.expenseForm.get('expenseType');
        return control?.errors || {};
    }

    ngOnInit(): void {
        // Initialize expense types
        this.expenseService.getExpenseTypes().subscribe(types => {
            this.expenseTypes = types;
            
            // Subscribe to expense type changes after types are loaded
            this.expenseForm.get('expenseType')?.valueChanges.subscribe(typeId => {
                if (typeId) {
                    const type = this.expenseTypes.find(t => t.id === typeId);
                    this.isPetrolAllowance = type?.name?.toLowerCase() === 'petrol allowance';
                    
                    if (this.isPetrolAllowance) {
                        this.expenseForm.get('fromLocation')?.setValidators([Validators.required]);
                        this.expenseForm.get('toLocation')?.setValidators([Validators.required]);
                        this.expenseForm.get('amount')?.clearValidators();
                        this.expenseForm.get('amount')?.disable();
                    } else {
                        this.expenseForm.get('fromLocation')?.clearValidators();
                        this.expenseForm.get('toLocation')?.clearValidators();
                        this.expenseForm.get('fromLocation')?.disable();
                        this.expenseForm.get('toLocation')?.disable();
                        this.expenseForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
                        this.expenseForm.get('amount')?.enable();
                    }

                    this.expenseForm.updateValueAndValidity();

                    const policy = this.expenseService.getPolicies().find(p => p.id === this.currentExpense.policyId);
                    if (policy) {
                        const rule = policy.rules.find(r => r.expenseTypeId === typeId);
                        if (rule) {
                            if (rule.valueType === 'CONSTANT' && !this.isPetrolAllowance) {
                                this.expenseForm.get('amount')?.setValue(rule.amount);
                                this.expenseForm.get('amount')?.disable();
                            } else {
                                this.expenseForm.get('amount')?.enable();
                            }
                        }
                    }
                }
            });
        });

        // Subscribe to location changes for petrol allowance
        this.expenseForm.get('fromLocation')?.valueChanges.subscribe(from => {
            if (this.isPetrolAllowance && from && this.expenseForm.get('toLocation')?.value) {
                this.calculateDistanceAndAmount(from, this.expenseForm.get('toLocation')?.value);
            }
        });

        this.expenseForm.get('toLocation')?.valueChanges.subscribe(to => {
            if (this.isPetrolAllowance && to && this.expenseForm.get('fromLocation')?.value) {
                this.calculateDistanceAndAmount(this.expenseForm.get('fromLocation')?.value, to);
            }
        });
    }

    getAvailableExpenseTypes(): ExpenseType[] {
        return this.expenseTypes.filter(type => !this.usedExpenseTypes.has(type.id));
    }

    getExpenseTypeName(expenseTypeId: string): string {
        const type = this.expenseTypes.find(t => t.id === expenseTypeId);
        return type ? type.name : 'Unknown';
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size exceeds 10MB limit');
                input.value = '';
                return;
            }
            if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
                alert('Please upload a PNG, JPG, or PDF file');
                input.value = '';
                return;
            }
            const expenseType = this.expenseForm.get('expenseType')?.value;
            if (expenseType) {
                this.selectedFiles.set(expenseType, file);
                this.expenseForm.get('receipt')?.setValue(file.name);
            } else {
                alert('Please select an expense type before uploading a receipt');
                input.value = '';
            }
        }
    }

    addExpense(): void {
        if (this.expenseForm.valid) {
            const expenseType = this.expenseForm.get('expenseType')?.value;
            const amount = this.expenseForm.get('amount')?.value;
            const description = this.expenseForm.get('description')?.value || '';
            const receipt = this.selectedFiles.get('receipt');

            const expense: ExpenseItem = {
                id: Date.now().toString(),
                expenseType: expenseType,
                amount: amount,
                description: description,
                receiptFile: receipt ? receipt.name : '',
                date: new Date().toISOString()
            };

            this.currentExpense.items.push(expense);
            this.usedExpenseTypes.add(expenseType);
            this.expenseForm.reset();
            this.selectedFiles.clear();
        }
    }

    removeExpense(expenseId: string): void {
        const index = this.currentExpense.items.findIndex(expense => expense.id === expenseId);
        if (index !== -1) {
            const expenseType = this.currentExpense.items[index].expenseType;
            this.currentExpense.items = this.currentExpense.items.filter(expense => expense.id !== expenseId);
            this.usedExpenseTypes.delete(expenseType);
        }
    }

    getAddedExpenses(): ExpenseItem[] {
        return this.currentExpense.items;
    }

    submitExpenses(): void {
        if (this.currentExpense.items.length > 0) {
            // Create a copy of the expense report to submit
            const expenseReport: ExpenseReport = {
                ...this.currentExpense,
                date: new Date(this.currentExpense.date).toISOString(),
                submittedAt: new Date().toISOString()
            };

            this.expenseService.submitExpense(expenseReport).subscribe({
                next: (response) => {
                    this.router.navigate(['/reports']);
                },
                error: (error: any) => {
                    console.error('Error submitting expenses:', error);
                    alert('Failed to submit expenses. Please try again.');
                }
            });
        } else {
            alert('Please add at least one expense before submitting');
        }
    }

    onCancel(): void {
        this.router.navigate(['/expense-reports']);
    }




}