import { Component, OnInit } from '@angular/core';
import { ExpensePolicy, ExpenseReport, ExpenseStatus, mockPolicies, mockExpenses } from '../../types/expense';
import { ExpenseService } from '../../services/expense.service';

// Mock expense reports data
const mockReports: ExpenseReport[] = [
  {
    id: '1',
    date: '2024-05-15',
    totalAmount: 250.00,
    status: 'APPROVED',
    employeeId: '1',
    policyId: '1',
    items: [
      {
        id: '1',
        expenseType: '1',
        amount: 100.00,
        description: 'Business lunch with client',
        receiptFile: 'lunch_receipt.pdf',
        date: '2024-05-15'
      },
      {
        id: '2',
        expenseType: '2',
        amount: 150.00,
        description: 'Taxi fare to client meeting',
        receiptFile: 'taxi_receipt.pdf',
        date: '2024-05-15'
      }
    ]
  },
  {
    id: '2',
    date: '2024-05-10',
    totalAmount: 120.00,
    status: 'PENDING',
    employeeId: '1',
    policyId: '1',
    items: [
      {
        id: '3',
        expenseType: '3',
        amount: 120.00,
        description: 'Office supplies',
        receiptFile: 'office_supplies_receipt.pdf',
        date: '2024-05-10'
      }
    ]
  },
  {
    id: '3',
    date: '2024-05-05',
    totalAmount: 350.00,
    status: 'REJECTED',
    employeeId: '1',
    policyId: '1',
    items: [
      {
        id: '4',
        expenseType: '4',
        amount: 350.00,
        description: 'Conference registration',
        receiptFile: 'conference_receipt.pdf',
        date: '2024-05-05'
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
  selectedReport: ExpenseReport | null = null;
  expenseTypes: Record<string, string> = {};

  constructor(private expenseService: ExpenseService) {
    // Get expense types for display
    this.expenseService.getExpenseTypes().subscribe(types => {
      this.expenseTypes = types.reduce((acc, type) => {
        acc[type.id] = type.name;
        return acc;
      }, {} as Record<string, string>);
    });

    // Subscribe to expenses from service
    this.expenseService.expenses$.subscribe(reports => {
      this.submittedReports = reports;
      // Calculate total amount for each report
      this.submittedReports.forEach(report => {
        report.totalAmount = report.items.reduce((total, item) => total + item.amount, 0);
      });
    });
  }

  viewReportDetails(report: ExpenseReport): void {
    this.selectedReport = report;
  }

  closeDetails(): void {
    this.selectedReport = null;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  ngOnInit() {
    // Sort reports by date (newest first)
    this.submittedReports = [...this.submittedReports].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }


}