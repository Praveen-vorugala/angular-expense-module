import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseType, User, ExpensePolicy, ExpenseItem, ExpenseReport } from '../../types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';
import { PopOverService } from 'src/app/services/pop-over/pop-over.service';
import { of, Observable, forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
    expenseForm: FormGroup;
    currentMetric:string = '';
    expenseTypes: ExpenseType[] = [];
    selectedFiles: Map<string, string> = new Map();
    isLoading: boolean = false;
    currentExpenseName:string = '';
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
    editExpenses: boolean = false;
    places:any [] = []
    editingExpenseIndex: number = -1;  // Add this to track which expense is being edited
    firstChange: boolean = true;
    loadingText: string = '';
    cities : any[] = [];
    constructor(
        private fb: FormBuilder,
        private expenseService: ExpenseService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private popover: PopOverService,
        private baseAPI : BaseApiService,
        private cdr: ChangeDetectorRef
    ) {
        activeRoute.params.subscribe(params => {
            if(params['id']){
                this.currentExpense.id = params['id'];
                this.editExpenses = true;
            } 
        })
        this.expenseForm = this.fb.group({
            id:[''],
            expenseType: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0)]],
            description: [''],
            receiptFile: [null],
            fromLocation: [''],
            toLocation: [''],
            tripType: [''],
            places:[''],
            distance:['']
        });

        // Initialize employeeId and policyId from service
        // const currentUser = this.expenseService.getCurrentUser();
        // if (currentUser) {
        //     this.currentExpense.employee_id = currentUser.id;
        // }
        // this.getPolicyFrequencies();
        // this.getCities();
        // this.getPlaces()
        // this.getUserPolicy('DAILY');
    }

    setFromDate(event : Event){
        if(this.firstChange){
            this.initialiseExpenseTypes();
        }
        this.fromDate = (event.target as HTMLInputElement).value;
        this.currentExpense.from_report_date = this.fromDate;
        this.currentExpense.to_report_date = this.fromDate;
        this.getDefaultExpenses();
    }
    
    // setToDate(event : Event){
    //     this.toDate = (event.target as HTMLInputElement).value;
    //     this.currentExpense.to_report_date = this.toDate;
    // }
    

    getDefaultExpenses(){
        const params = new Map<string, any>();
        params.set('visit_date', this.fromDate);
        this.baseAPI.executeGet({url:apiDirectory.defaultExpnses,params:params}).subscribe(res =>{
            let some:ExpenseItem[] = res.rules;
            this.updateCurrentExpenses(some);
            // const cleanedRules: ExpenseItem[] = some.map(({ expense_type,amount,description }) => ({
            // expense_type,
            // amount,
            // description
            // }));
            // console.log(cleanedRules);
            
        })
    }

    getUserPolicy(frequencyId : any){
        this.isLoading = true;
        this.selectedFrequency = 'DAILY';
    //    const params = new Map<string,any>();
    //    params.set('frequency',frequencyId);
       this.baseAPI.executeGet({
        url : apiDirectory.getUserPolicy,
        // params : params
       }).subscribe({
        next : (res)=>{
            this.isLoading = false;
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
        let givenParams:any = this.policy?.rules.find((rule:any)=>rule.rule_type == 'CALCULATED');
        Object.keys(givenParams?.meta_data ).forEach((key) => {
            params.set(key, givenParams?.meta_data[key]);
        })
        // this.expenseTypes.map((type: ExpenseType) => type.id === 'petrol allowance' ? params.set('expense_type', type.id) : null);
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

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    selectExpenseType(type: ExpenseType) {
        this.currentExpenseName = type.code? type.code:'';
        this.expenseForm.get('expenseType')?.setValue(type.id);
        this.showDropdown = false;
        
        // Update form based on expense type
        this.updateFormForExpenseType(type);
    }

    private updateFormForExpenseType(type: ExpenseType) {
        const isPetrolAllowance = type?.name?.toLowerCase() === 'petrol allowance';
        this.isPetrolAllowance = isPetrolAllowance;

        if (isPetrolAllowance) {
            this.expenseForm.get('fromLocation')?.setValidators([Validators.required]);
            this.expenseForm.get('toLocation')?.setValidators([Validators.required]);
            this.expenseForm.get('tripType')?.setValidators([Validators.required]);
        } else {
            this.expenseForm.get('fromLocation')?.clearValidators();
            this.expenseForm.get('toLocation')?.clearValidators();
            this.expenseForm.get('tripType')?.clearValidators();
        }

        // Update all form controls
        ['fromLocation', 'toLocation', 'tripType'].forEach(controlName => {
            this.expenseForm.get(controlName)?.updateValueAndValidity();
        });

        // Force change detection
        this.cdr.detectChanges();
    }

    get expenseTypeErrors(): any {
        const control = this.expenseForm.get('expenseType');
        return control?.errors || {};
    }

    private setExpenseTypes(policy : any){
        this.expenseTypes = policy?.rules.map((rule : any)=>rule.expense_type)
    }
    ngOnInit(): void {
        console.log(this.currentExpense);
        
        // If we have an ID, we're in edit mode
        if (this.currentExpense.id) {
            this.getCurrentExpenses();
        } else {
            // Initialize expense types for new expense
            // this.initialiseExpenseTypes()
;        }
            
        // Subscribe to expense type changes
        this.expenseForm.get('expenseType')?.valueChanges.subscribe(typeId => {
            if (typeId) {
                const type = this.expenseTypes.find(t => t.id === typeId);
                if (type) {
                    this.updateFormForExpenseType(type);
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

    initialiseExpenseTypes(){
        this.isLoading = true;
        forkJoin({
            policyFrequencies : this.baseAPI.executeGet({ url: apiDirectory.getUserPolicyFrequencies }),
            cities : this.baseAPI.executeGet({ url : apiDirectory.getCities }),
            places : this.baseAPI.executeGet({ url : apiDirectory.getPlaces }),
            userPolicies : this.baseAPI.executeGet({ url : apiDirectory.getUserPolicy })
        }).subscribe((response)=>{
            console.log(response);
            this.isLoading = false;
            this.firstChange = false;
            const frequencies = response.policyFrequencies as any;
            if (frequencies && frequencies.length > 0) {
                this.policyFrequencies = frequencies;
            }
            const cities = response.cities.results as any;
            if (cities && cities.length > 0) {
                this.cities = cities;
            }
            const places = response.places.results as any;
            if (places && places.length > 0) {
                this.places = places;
            }

            this.selectedFrequency = 'DAILY';
            const policy = response.userPolicies as ExpensePolicy;
            if (policy) {
                this.setExpenseTypes(policy);
                this.currentExpense.policy = policy.id; // Use first active policy
                this.policy = policy as ExpensePolicy;
            }
        },
        (error)=>{
            this.isLoading = false;
            this.popover.showError('Error while fetching resources. Please try again later',3000);
        })
    }

    getCurrentExpenses(){
        this.baseAPI.executeGet({url: `${apiDirectory.expenseReports}${this.currentExpense.id}/`}).subscribe(
            res =>{
                console.log(res);
                const expenseData = res as ExpenseReport;
                this.currentExpense = expenseData;
                console.log(this.currentExpense);
                
                // Set the frequency
                this.selectedFrequency = expenseData.frequency;
                
                // Set the dates
                if (expenseData.from_report_date) {
                    this.fromDate = expenseData.from_report_date;
                }
                if (expenseData.to_report_date) {
                    this.toDate = expenseData.to_report_date;
                }

                // Get the policy for this expense
                this.getUserPolicy(expenseData.frequency);
                this.updateCurrentExpenses(expenseData.expenses);
                // Prefill the expenses list
                // this.currentExpense.expenses = expenseData.expenses;
                // this.updateTotalAmount();
                // console.log(this.currentExpense.expenses);
                
                // // Mark expense types as used
                // expenseData.expenses.forEach((expense:any) => {
                //     expense.expense_type = expense.expense_type.id;
                //     this.usedExpenseTypes.add(expense.expense_type);
                //     console.log(this.usedExpenseTypes);
                    
                // });
            },
            error => {
                console.error('Error fetching expense:', error);
                this.popover.showError('Failed to load expense details');
            }
        )   
    }

    updateCurrentExpenses(expenseData:any){
        console.log(expenseData);
        
        this.currentExpense.expenses = expenseData;
        console.log(this.currentExpense);
        
        this.updateTotalAmount();
        console.log(this.currentExpense.expenses);
        
        // Mark expense types as used
        expenseData.forEach((expense:any) => {
            expense.expense_type = expense.expense_type.id;
            this.usedExpenseTypes.add(expense.expense_type);
            console.log(this.usedExpenseTypes);
            
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
            this.uploadSampleFile(file);
            // const expenseType = this.expenseForm.get('expenseType')?.value;
            // if (expenseType) {
            //     this.selectedFiles.set(expenseType, file);
            //     this.expenseForm.get('receipt')?.setValue(file.name);
            // } else {
            //     alert('Please select an expense type before uploading a receipt');
            //     input.value = '';
            // }
        }
    }

    uploadSampleFile(uploadedSampleFile:any){
        const file = new FormData();
        file.append('file',uploadedSampleFile);
        this.baseAPI.executePost({url:apiDirectory.uploadSampleFile,body:file}).subscribe(res =>{
            console.log(res);
            this.expenseForm.get('receiptFile')?.setValue(res.url);
            this.selectedFiles.set(this.expenseForm.get('expenseType')?.value, res.url);
            console.log(this.selectedFiles);
            
        })
    }

    openWindow(url:string | undefined ){
        window.open(url,'BLANK');
    }

    addExpense(): void {
        if (this.expenseForm.valid) {
            const expenseType = this.expenseForm.get('expenseType')?.value;
            const amount = this.expenseForm.get('amount')?.value;
            const description = this.expenseForm.get('description')?.value || '';
            const receipt = this.selectedFiles.get(expenseType);
            const fromLocation = this.expenseForm.get('fromLocation')?.value;
            const toLocation = this.expenseForm.get('toLocation')?.value;
            const tripType = this.expenseForm.get('tripType')?.value;
            const distance = this.expenseForm.get('distance')?.value;

            const expense: ExpenseItem = {
                id:  this.expenseForm.get('id')?.value,
                expense_type: expenseType,
                amount: amount,
                description: description,
                receipt_file: receipt ? receipt : '',
                from_location: fromLocation,
                to_location: toLocation,
                trip_type: tripType,
                distance: distance
            };
            console.log(expense);
            

            if (this.editingExpenseIndex !== -1) {
                // Update existing expense
                this.currentExpense.expenses[this.editingExpenseIndex] = expense;
                this.editingExpenseIndex = -1;
            } else {
                // Add new expense
                this.currentExpense.expenses.push(expense);
                this.usedExpenseTypes.add(expenseType);
                console.log(this.usedExpenseTypes);
                
            }

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

            // If we're editing this expense, cancel editing
            if (this.editingExpenseIndex === index) {
                this.cancelEditing();
            }
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
                frequency: this.selectedFrequency,
                meta_data : {...this.petrolAllowance}
            };
            console.log(expenseReport);
            expenseReport.expenses.map((item:any) =>{
                (item.id == ''|| item.id == null) ? delete item.id : null;
            })

            // Determine if this is a create or update operation
            const isUpdate = !!this.currentExpense.id;
            this.isLoading = true;
            this.loadingText = isUpdate? 'Updating...':'Creating...';
            const url = isUpdate 
                ? `${apiDirectory.expenseReports}${this.currentExpense.id}/`
                : apiDirectory.expenseReports;

            // Use appropriate HTTP method based on operation
            const request$ = isUpdate
                ? this.baseAPI.executePatch({ url, body: expenseReport })
                : this.baseAPI.executePost({ url, body: expenseReport });

            request$.subscribe({
                next: (res) => {
                    this.isLoading = false;
                    this.loadingText = '';
                    this.router.navigate(['/reports']);
                },
                error: (err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.loadingText = '';
                    Object.keys(err.error).forEach((key) => {
                        this.popover.showError(err.error[key][0]);
                    });
                }
            });
        } else {
            this.popover.showError('Please add at least one expense before submitting');
        }
    }

    onCancel(): void {
        this.router.navigate(['/expense-reports']);
    }

    // Add this method to start editing an expense
    startEditingExpense(expense: ExpenseItem, index: number): void {
        this.editingExpenseIndex = index;
        const expenseType = this.expenseTypes.find(t => t.id === expense.expense_type);
        
        // Prefill the form with the expense data
        this.expenseForm.patchValue({
            id: expense.id? expense.id:'',
            expenseType: expense.expense_type,
            amount: expense.amount,
            description: expense.description || '',
            fromLocation: expense.from_location || '',
            toLocation: expense.to_location || '',
            tripType: expense.trip_type || '',
            distance: expense.distance || ''
        });

        // If there's a receipt file, set it in the selectedFiles map
        if (expense.receipt_file) {
            // Note: In a real application, you might want to fetch the actual file
            // For now, we'll just store the filename
            this.selectedFiles.set(expense.expense_type, '');
        }

        // Update form for expense type
        if (expenseType) {
            this.updateFormForExpenseType(expenseType);
        }

        // Scroll to the form
        const formElement = document.querySelector('.expense-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Add method to cancel editing
    cancelEditing(): void {
        this.editingExpenseIndex = -1;
        this.expenseForm.reset();
        this.selectedFiles.clear();
    }
}
