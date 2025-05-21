import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';

interface MetaData {
    attachments: string;
    history: string | string[];
}

interface ExpenseValue {
    value: number;
    meta: MetaData;
}

type Status = 'IN REVIEW' | 'APPROVED' | 'REJECTED';

interface ExpenseConfig {
    [date: string]: {
        [key: string]: ExpenseValue | string | any;
        status: Status;
    };
}

@Component({
    selector: 'app-expense-approval',
    templateUrl: './expense-approval.component.html',
    styleUrls: ['./expense-approval.component.scss']
})
export class ExpenseApprovalComponent implements OnInit {
    frequencyOptions = [
        { value: 'DAILY', label: 'Daily' },
        // { value: 'WEEKLY', label: 'Weekly' },
        // { value: 'FORTNIGHTLY', label: 'Fortnightly' },
        { value: 'MONTHLY', label: 'Monthly' },
        // { value: 'QUARTERLY', label: 'Quarterly' },
        // { value: 'HALF_YEARLY', label: 'Half Yearly' },
        // { value: 'ANNUALLY', label: 'Annually' }
    ];
    frequency:FormControl = new FormControl('DAILY');
    expenseConfig: ExpenseConfig[] = [];

    dates: string[] = [];
    columns: string[] = [];

    constructor(private baseAPI: BaseApiService) {}

    ngOnInit() {
        
        this.getExpensConfiguration();
    }

    private initializeTable() {
        // Get all dates from all config objects
        this.dates = this.expenseConfig
            .map(config => Object.keys(config))
            .flat()
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        // Get all unique column names (expense types)
        const columnSet = new Set<string>();
        this.expenseConfig.forEach(config => {
            Object.values(config).forEach(dateConfig => {
                Object.keys(dateConfig).forEach(key => {
                    if (key !== 'status') { // Exclude status from columns
                        columnSet.add(key);
                    }
                });
            });
        });
        this.columns = Array.from(columnSet);
    }

    getExpensConfiguration(){
        this.baseAPI.executeGet({url: apiDirectory.expenseSummary}).subscribe(res =>{
            this.expenseConfig = res;
            this.initializeTable();
        })
    }

    getExpenseValue(date: string, column: string): any {
        const config = this.expenseConfig.find(c => c[date]);
        if (!config) return null;
        
        const value = config[date][column];
        if (typeof value === 'string') return null;
        return value?.amount || 0;
    }

    chekStatusFields(column:string,date:string) {
        const config = this.expenseConfig.find(c =>c[date]);
        if (config) {
            return config?.[date][column].status? true : false;
        }
        return null;
    }

    getMetaData(date: string, column: string): MetaData | null {
        const config = this.expenseConfig.find(c => c[date]);
        if (!config) return null;
        
        const value = config[date][column];
        if (typeof value === 'string') return null;
        return value?.meta || null;
    }

    getStatus(date: string): Status {
        const config:any = this.expenseConfig.find(c => c[date]);
        return config?.[date]?.status || 'PENDING';
    }

    getOverallStatus(date: string):Status{
        const config:any = this.expenseConfig.find(c => c[date]);
        return config?.[date]?.['overall_status'] || 'PENDING';
    }

    getApprovalStatus(date: string,column:string): Status {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            console.log(config[date][column]);
            return config[date][column].status.toUpperCase() as Status;
        }
        return 'IN REVIEW';
    }

    getStatusClass(status: Status): string {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }

    hasAttachments(date: string, column: string): boolean {
        const meta = this.getMetaData(date, column);
        return meta?.attachments ? true : false;
    }

    hasHistory(date: string, column: string): boolean {
        const meta = this.getMetaData(date, column);
        return meta?.history ? true : false;
    }

    approveStatus(date: string,column:string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            config[date][column].status = 'APPROVED';
        }
    }

    onFrequencyChange(event: any) {
        console.log(event.target.value)
    }

    rejectStatus(date: string,column:string) {
        const config = this.expenseConfig.find(c => c[date]);
        if (config) {
            config[date][column].status = 'REJECTED';
        }
    }
} 