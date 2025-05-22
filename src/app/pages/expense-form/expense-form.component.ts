import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType, User, ExpensePolicy, ExpenseItem, ExpenseReport } from '../../types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';
import { PopOverService } from 'src/app/services/pop-over/pop-over.service';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
    expenseForm: FormGroup;
    currentMetric:string = '';
    expenseTypes: ExpenseType[] = [];
    selectedFiles: Map<string, File> = new Map();
    currentExpense: ExpenseReport = {
        id: '',
        policy: '',
        frequency : '',
        expenses: [],
        total_amount: 0,
        status: 'PENDING',
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
    policy : ExpensePolicy | undefined;
    policyFrequencies : any[] = [];
    selectedFrequency : string = '';
    fromDate : string = '';
    toDate : string = '';

    constructor(
        private fb: FormBuilder,
        private expenseService: ExpenseService,
        private router: Router,
        private popover: PopOverService,
        private baseAPI : BaseApiService
    ) {
        this.expenseForm = this.fb.group({
            expenseType: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0)]],
            description: [''],
            receiptFile: [null],
            fromLocation: [''],
            toLocation: [''],
            tripType: [''],
            distance:['']
        });

        // Initialize employeeId and policyId from service
        // const currentUser = this.expenseService.getCurrentUser();
        // if (currentUser) {
        //     this.currentExpense.employee_id = currentUser.id;
        // }
        this.getPolicyFrequencies();
        this.getCities();
        this.getUserPolicy('DAILY');
    }

    setFromDate(event : Event){
        this.fromDate = (event.target as HTMLInputElement).value;
        this.currentExpense.from_report_date = this.fromDate;
        this.currentExpense.to_report_date = this.fromDate;
    }
    
    // setToDate(event : Event){
    //     this.toDate = (event.target as HTMLInputElement).value;
    //     this.currentExpense.to_report_date = this.toDate;
    // }
    
    getPolicyFrequencies(){
        this.baseAPI.executeGet({
            url : apiDirectory.getUserPolicyFrequencies
        }).subscribe({
            next : (res)=>{
                const frequencies = res as any;
                if (frequencies && frequencies.length > 0) {
                    this.policyFrequencies = frequencies;
                }
            },
            error : (err)=>{
                console.log(err);
            }
        })
    }

    getUserPolicy(frequencyId : any){
        this.selectedFrequency = 'DAILY';
    //    const params = new Map<string,any>();
    //    params.set('frequency',frequencyId);
       this.baseAPI.executeGet({
        url : apiDirectory.getUserPolicy,
        // params : params
       }).subscribe({
        next : (res)=>{
            const policy = res as ExpensePolicy;
            if (policy) {
                console.log(policy);
                
                this.setExpenseTypes(policy);
                this.currentExpense.policy = policy.id; // Use first active policy
                this.policy = policy as ExpensePolicy;
            }
        },
        error : (err)=>{
            console.log(err);
        }
       }) 
    }
    petrolAllowance : any = null;
    calculateDistanceAndAmount(from: string, to: string, tripType : string): void {
        // For now, we'll use a mock distance calculation
        // In a real application, you would use a mapping API like Google Maps API
        const mockDistance = 10; // Mock distance in KM
        this.distance = mockDistance;
        let params = new Map<string, any>();
        params.set('source_city_id', from);
        params.set('destination_city_id', to);
        this.baseAPI.executeGet({
            url : apiDirectory.getDistance,
            params : params
        }).subscribe(
            {
                next : (res)=>{
                    this.expenseForm.get('distance')?.setValue(res.total_metric);
                    this.currentMetric= res.metric_type;
                    this.petrolAllowance = {distance : res, tripType : tripType};
                    this.expenseForm.get('amount')?.setValue(tripType === 'ROUND_TRIP' ? res.total_amount * 2 : res.total_amount);
                },
                error : (err)=>{
                    console.log(err);
                }
            }
        )
    }
    public cities : any[] = [];
    getCities(){
        this.baseAPI.executeGet({
            url : apiDirectory.getCities
        }).subscribe({
            next : (res)=>{
                const cities = res.results as any;
                if (cities && cities.length > 0) {
                    this.cities = cities;
                }
            },
            error : (err)=>{
                console.log(err);
            }
        })
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

    private setExpenseTypes(policy : any){
        this.expenseTypes = policy?.rules.map((rule : any)=>rule.expense_type)
    }
    ngOnInit(): void {
        // Initialize expense types
            
            // Subscribe to expense type changes after types are loaded
            this.expenseForm.get('expenseType')?.valueChanges.subscribe(typeId => {
                if (typeId) {
                    const type = this.expenseTypes.find(t => t.id === typeId);
                    this.isPetrolAllowance = type?.name?.toLowerCase() === 'petrol allowance';
                    
                    if (this.isPetrolAllowance) {
                        this.expenseForm.get('fromLocation')?.setValidators([Validators.required]);
                        this.expenseForm.get('toLocation')?.setValidators([Validators.required]);
                        this.expenseForm.get('tripType')?.setValidators([Validators.required]);
                        this.expenseForm.get('amount')?.clearValidators();
                        this.expenseForm.get('amount')?.disable();
                    } else {
                        this.expenseForm.get('fromLocation')?.clearValidators();
                        this.expenseForm.get('toLocation')?.clearValidators();
                        this.expenseForm.get('tripType')?.clearValidators();

                        this.expenseForm.get('fromLocation')?.disable();
                        this.expenseForm.get('toLocation')?.disable();
                        this.expenseForm.get('tripType')?.disable();

                        this.expenseForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
                        this.expenseForm.get('amount')?.enable();
                    }

                    this.expenseForm.updateValueAndValidity();

                    // const policy = this.policy.find(p => p.id === this.currentExpense.policyId);
                    if (this.policy) {
                        const rule:any = this.policy.rules.find((r : any) => r.expense_type.id === typeId);
                        if (rule) {
                            if (rule.rule_type === 'CONSTANT' && !this.isPetrolAllowance) {
                                this.expenseForm.get('amount')?.setValue(rule.amount);
                                this.expenseForm.get('amount')?.disable();
                            } else {
                                this.expenseForm.get('amount')?.enable();
                            }
                        }
                    }
                }
            });
            
        this.expenseForm.get('tripType')?.valueChanges.subscribe(tripType => {
            if (tripType) {
                this.expenseForm.get('tripType')?.markAsDirty();
                this.expenseForm.get('tripType')?.markAsTouched();
                this.expenseForm.updateValueAndValidity();
                
                // Recalculate amount when trip type changes if we have both locations
                const fromLocation = this.expenseForm.get('fromLocation')?.value;
                const toLocation = this.expenseForm.get('toLocation')?.value;
                const tripType = this.expenseForm.get('tripType')?.value;
                if (fromLocation && toLocation) {
                    this.calculateDistanceAndAmount(fromLocation, toLocation, tripType);
                }
            }
        })

        // Subscribe to location changes for petrol allowance
        this.expenseForm.get('fromLocation')?.valueChanges.subscribe(from => {
            const tripType = this.expenseForm.get('tripType')?.value;
            if (this.isPetrolAllowance && from && this.expenseForm.get('toLocation')?.value && tripType) {
                this.calculateDistanceAndAmount(from, this.expenseForm.get('toLocation')?.value,tripType);
            }
        });

        this.expenseForm.get('toLocation')?.valueChanges.subscribe(to => {
            const tripType = this.expenseForm.get('tripType')?.value;
            if (this.isPetrolAllowance && to && this.expenseForm.get('fromLocation')?.value && tripType) {
                this.calculateDistanceAndAmount(this.expenseForm.get('fromLocation')?.value, to,tripType);
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
                expense_type: expenseType,
                amount: amount,
                description: description,
                receipt_file: receipt ? receipt.name : '',
            };

            this.currentExpense.expenses.push(expense);
            this.usedExpenseTypes.add(expenseType);
            this.expenseForm.reset();
            this.selectedFiles.clear();
            this.updateTotalAmount();
        }
    }

    updateTotalAmount(): void {
        this.currentExpense.total_amount = this.currentExpense.expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    removeExpense(expense_type: any): void {
        const index = this.currentExpense.expenses.findIndex(expense => expense.expense_type === expense_type);
        if (index !== -1) {
            const expenseType = this.currentExpense.expenses[index].expense_type;
            this.currentExpense.expenses = this.currentExpense.expenses.filter(expense => expense.expense_type !== expense_type);
            this.usedExpenseTypes.delete(expenseType);
            this.updateTotalAmount();
            if(this.petrolAllowance && this.currentExpense.expenses[index].expense_type === 'petrol allowance'){
                this.petrolAllowance = null;
            }
        }
    }

    getAddedExpenses(): ExpenseItem[] {
        return this.currentExpense.expenses;
    }

    submitExpenses(): void {
        if (this.currentExpense.expenses.length > 0) {
            // Create a copy of the expense report to submit
            const expenseReport: any = {
                ...this.currentExpense,
                frequency : this.selectedFrequency,
                meta_data : {...this.petrolAllowance}
            };
            this.baseAPI.executePost(
                {
                    url : apiDirectory.expenseReports,
                    body : expenseReport
                }
            ).subscribe({
                next : (res)=>{
                    this.router.navigate(['/reports']);
                },
                error : (err)=>{
                    console.log(err);
                    this.popover.showLog(err);
                }
            })
            // this.expenseService.submitExpense(expenseReport).subscribe({
            //     next: (response) => {
            //         this.router.navigate(['/reports']);
            //     },
            //     error: (error: any) => {
            //         console.error('Error submitting expenses:', error);
            //         alert('Failed to submit expenses. Please try again.');
            //     }
            // });
        } else {
            alert('Please add at least one expense before submitting');
        }
    }

    onCancel(): void {
        this.router.navigate(['/expense-reports']);
    }




}