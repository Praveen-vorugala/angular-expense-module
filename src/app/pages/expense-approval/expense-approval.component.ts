import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { from } from 'rxjs';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';

interface MetaData {
    attachments: string;
    history: string[];
}

interface ExpenseValue {
    amount: number | string;
    attachments: string;
    history: string[];
    id?: number;
    original_amount?: number;
}

interface ApprovalLevel {
    id: number;
    approval_level: number;
    status: string;
    comments: string;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    expense_report: number;
    approver: number;
}

interface ExpenseConfig {
    [date: string]: {
        [key: string]: ExpenseValue | ApprovalLevel | string| any;
        overall_status: string;
    };
}

interface ExpenseChange {
    id: number;
    amount: number;
    previous_amount: number;
}

@Component({
    selector: 'app-expense-approval',
    templateUrl: './expense-approval.component.html',
    styleUrls: ['./expense-approval.component.scss']
})
export class ExpenseApprovalComponent implements OnInit {
    isLoading:boolean = false;
    frequencyOptions = [
        { value: 'DAILY', label: 'Daily' },
        { value: 'MONTHLY', label: 'Monthly' }
    ];
    frequency: FormControl = new FormControl('DAILY');
    fromDate: FormControl = new FormControl("2025-06-01");
    toDate: FormControl = new FormControl("2025-06-29");
    expenseConfig: ExpenseConfig[] = [];
    changedExpenses: ExpenseChange[] = [];
    showPopup: boolean = false;

    dates: string[] = [];
    columns: string[] = [];

    constructor(private baseAPI: BaseApiService) {}

    ngOnInit() {
        console.log(this.fromDate.value);
        
        this.getExpensConfiguration();
    }

    private initializeTable() {
        this.dates = this.expenseConfig
            .map(config => Object.keys(config))
            .flat()
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        const columnSet = new Set<string>();
        this.expenseConfig.forEach(config => {
            Object.values(config).forEach(dateConfig => {
                Object.keys(dateConfig).forEach(key => {
                    // if (key !== 'overall_status') {
                        columnSet.add(key);
                    // }
                });
            });
        });
        this.columns = Array.from(columnSet);
    }

    getColumnName(column:string):string{
        const config:any = Object.values(this.expenseConfig[0])[0];
        console.log(column);
        
        return config[column]['name'] ;
    }

    getExpensConfiguration() {
        this.isLoading = true;
        const params = new Map<string, string>();
        params.set('from_date', this.fromDate.value || '');
        params.set('to_date', this.toDate.value || '');
        this.baseAPI.executeGet({url: apiDirectory.expenseSummary,params:params}).subscribe(res => {
            this.expenseConfig = res;
            console.log(res);
            
            this.isLoading = false;
            this.expenseConfig.forEach(config => {
                Object.values(config).forEach(dateConfig => {
                    Object.entries(dateConfig).forEach(([key, value]) => {
                        if (typeof value !== 'string' && 'amount' in value && 'id' in value) {
                            value.original_amount = parseFloat(value.amount.toString());
                        }
                    });
                });
            });
            this.initializeTable();
        });
    }

    getExpenseValue(date: string, column: string): any {
        const config = this.expenseConfig.find(c => c[date]);
        if (!config) return null;
        
        const value = config[date][column];
        if (typeof value === 'string') return null;
        if ('amount' in value) {
            return value.amount || 0;
        }
        return 0;
    }

    isEditable(date: string, column: string): boolean {
        const config = this.expenseConfig.find(c => c[date]);
        if (!config) return false;
        
        const value = config[date][column];
        if (typeof value === 'string') return false;
        return 'id' in value && 'amount' in value;
    }

    onAmountChange(date: string, column: string, newAmount: string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (!config) return;

        const value = config[date][column];
        if (typeof value === 'string' || !('id' in value) || !('amount' in value)) return;

        const currentAmount = parseFloat(newAmount);
        const originalAmount = value.original_amount || parseFloat(value.amount.toString());

        if (currentAmount !== originalAmount && value.id) {
            // Remove any existing change for this expense
            this.changedExpenses = this.changedExpenses.filter(e => e.id !== value.id);
            
            // Add new change with original amount from backend
            this.changedExpenses.push({
                id: value.id,
                amount: currentAmount,
                previous_amount: originalAmount
            });

            // Update the value in the config
            value.amount = currentAmount;
        }
        console.log(this.changedExpenses);
        
    }

    setToDate(event:any) {
        this.getExpensConfiguration();
    }

    chekStatusFields(column: string, date: string): boolean {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            if (typeof value === 'string') return false;
            return 'status' in value;

        }
        return false;
    }

    getStatus(date: string): string {
        const config: any = this.expenseConfig.find(c => c[date]);
        return config?.[date]?.status || 'IN_REVIEW';
    }

    getOverallStatus(date: string): string {
        const config: any = this.expenseConfig.find(c => c[date]);
        return config?.[date]?.['overall_status'] || 'IN_REVIEW';
    }

    checkColumns(date: string,column:string):boolean {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            return value['is_permitted'] && (value['status'] != 'APPROVED');
        }
        return false;
    }

    showHistory(date: string, column: string,value:boolean){
        console.log(value);
        
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            value.show_popup = value;
        }
        return value;
    }
    canViewHistory(date: string, column: string){
        const config = this.expenseConfig.find(c => c[date]);
         if (config) {
            return config[date][column]['show_popup'];
         }
         return false
    }

    getHistoryValues(date: string, column: string,key:string): number {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            return value['history'][0][key];
        }
        return 0;
    }

    checkHistory(date: string, column: string): boolean {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            if(value['history'].length>0){
                return true;
            }
            // if (typeof value === 'string') return false;
            // return 'history' in value && Array.isArray(value.history) && value.history.length > 0;
        }
        return false;
    }

    getApprovalStatus(date: string, column: string): string {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            const value = config[date][column];
            if (typeof value === 'string') return 'IN_REVIEW';
            if ('status' in value) {
                return value.status.toUpperCase();
            }
        }
        return 'IN_REVIEW';
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }

    approveStatus(date: string, column: string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            let body:any = {};
            body['expenses'] = [...this.changedExpenses];
            this.baseAPI.executePost({url: `${apiDirectory.approveExpenses}${config[date][column]['id']+'/approve/' }`, body:body }).subscribe(res => {
                console.log('Status updated:', res);
                const value = config[date][column];
                if (typeof value === 'string') return;
                if ('status' in value) {
                    value.status = 'APPROVED';
                }
            })
            
        }
    }

    rejectStatus(date: string, column: string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            // const value = config[date][column];
            // if (typeof value === 'string') return;
            // if ('status' in value) {
            //     value.status = 'REJECTED';
            // }
            let body ={};
            this.baseAPI.executePost({url: `${apiDirectory.approveExpenses}${config[date][column]['id']+'/reject/' }`, body:body }).subscribe(res => {
                console.log('Status updated:', res);
                const value = config[date][column];
                if (typeof value === 'string') return;
                if ('status' in value) {
                    value.status = 'REJECTED';
                }
            })

        }
    }

    temporarySave(date: string, column: string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            // const value = config[date][column];
            // if (typeof value === 'string') return;
            // if ('status' in value) {
            //     value.status = 'REJECTED';
            // }
            let body:any ={};
            body['expenses'] = [...this.changedExpenses];
            this.baseAPI.executePost({url: `${apiDirectory.approveExpenses}${config[date][column]['id']+'/temp-save/' }`, body:body }).subscribe(res => {
                console.log('Status updated:', res);
                const value = config[date][column];
                // if (typeof value === 'string') return;
                // if ('status' in value) {
                //     value.status = 'REJECTED';
                // }
            })

        }
    }

    onFrequencyChange(event: any) {
        console.log(event.target.value);
        // Implement frequency change logic
    }

    saveChanges() {
        if (this.changedExpenses.length > 0) {
            const payload = {
                expenses: this.changedExpenses
            };
            this.baseAPI.executePost({
                url: apiDirectory.expenseSummary,
                body: payload
            }).subscribe(response => {
                console.log('Changes saved:', response);
                this.changedExpenses = []; // Clear changes after successful save
                this.getExpensConfiguration();
            });
        }
    }
} 