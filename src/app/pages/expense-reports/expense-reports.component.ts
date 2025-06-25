import { Component, OnInit } from '@angular/core';
import { ExpensePolicy, ExpenseReport, ExpenseStatus, mockPolicies, mockExpenses } from '../../types/expense';
import { ExpenseService } from '../../services/expense.service';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { apiDirectory } from 'src/global';
import { Router } from '@angular/router';

// Mock expense reports data
const mockReports: ExpenseReport[] = [
  {
    id: '1',
    date: '2024-05-15',
    total_amount: 250.00,
    status: 'APPROVED',
    policy: '1',
    frequency: 'DAILY',
    expenses: [
      {
        id: '1',
        expense_type: '1',
        amount: 100.00,
        description: 'Business lunch with client',
        receipt_file: 'lunch_receipt.pdf',
      },
      {
        id: '2',
        expense_type: '2',
        amount: 150.00,
        description: 'Taxi fare to client meeting',
        receipt_file: 'taxi_receipt.pdf',
      }
    ]
  },
  {
    id: '2',
    date: '2024-05-10',
    total_amount: 120.00,
    status: 'PENDING',
    policy: '1',
    frequency : 'DAILY',
    expenses: [
      {
        id: '3',
        expense_type: '3',
        amount: 120.00,
        description: 'Office supplies',
        receipt_file: 'office_supplies_receipt.pdf',
      }
    ]
  },
  {
    id: '3',
    date: '2024-05-05',
    total_amount: 350.00,
    status: 'REJECTED',
    policy: '1',
    frequency : 'MONTHLY',
    expenses: [
      {
        id: '4',
        expense_type: '4',
        amount: 350.00,
        description: 'Conference registration',
        receipt_file: 'conference_receipt.pdf',
      }
    ]
  }
];

@Component({
  selector: 'app-expense-reports',
  templateUrl: './expense-reports.component.html',
  styleUrls: ['./expense-reports.component.scss']
})
export class ExpenseReportsComponent implements OnInit {
  displayedColumns: string[] = ['date', 'amount', 'status', 'details'];
  submittedReports: ExpenseReport[] = [];
  selectedReport: any | null = null;
  expenseTypes: Record<string, string> = {};
  isLoading: boolean = false;
  getExpenseItems:boolean = false;
  hoveredIndex:number = -1;
  popupPosition: 'top' | 'bottom' = 'bottom';

  constructor(
    private expenseService: ExpenseService,
    private baseAPI : BaseApiService,
    private router: Router,
  )
     {
    // Get expense types for display
    this.expenseService.getExpenseTypes().subscribe(types => {
      this.expenseTypes = types.reduce((acc, type) => {
        acc[type.id] = type.name;
        return acc;
      }, {} as Record<string, string>);
    });

    // Subscribe to expenses from service
    // this.expenseService.expenses$.subscribe(reports => {
    //   this.submittedReports = reports;
    //   // Calculate total amount for each report
    //   this.submittedReports.forEach(report => {
    //     report.total_amount = report.expenses.reduce((total, item) => total + item.amount, 0);
    //   });
    // });
  }

  getReports(){
    this.isLoading = true;
    this.baseAPI.executeGet(
      {
        url : apiDirectory.expenseReports
      }
    ).subscribe((res : any) => {
      this.isLoading= false;

      this.submittedReports = res.results;
    })
  }

  viewReportDetails(report: ExpenseReport): void {
    this.selectedReport = report;
    this.getExpenseItems = false;
    console.log(this.selectedReport);
    this.baseAPI.executeGet({
      url : apiDirectory.expenseReports + this.selectedReport.id + '/'
    }).subscribe(
      (res : any) => {
        this.getExpenseItems = true;
        this.selectedReport = res;
      },
      (err : any) => {
        console.log(err);
      }
    )
  }

  closeDetails(): void {
    this.selectedReport = null;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  ngOnInit() {
    // Sort reports by date (newest first)
    this.getReports();
  }

  editReportDetails(report: ExpenseReport): void {
    this.router.navigate(['/submit-expense/', report.id]);
  }

  openWindow(url:string){
    window.open(url,'_BLANK');
  }

  onMouseEnter(event: MouseEvent, index: number, element: HTMLElement) {
    this.hoveredIndex = index;

    const rect = element.getBoundingClientRect();
    const popupHeight = 60; // Adjust based on popup height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.popupPosition = spaceBelow < popupHeight ? 'top' : 'bottom';
  }


}