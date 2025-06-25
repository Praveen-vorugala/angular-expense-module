import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseReport } from 'React project/src/types/expense';
import { BaseApiService } from 'src/app/services/api/base.api.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { apiDirectory } from 'src/global';

@Component({
  selector: 'app-expense-reports-approval',
  templateUrl: './expense-reports-approval.component.html',
  styleUrls: ['./expense-reports-approval.component.scss']
})
export class ExpenseReportsApprovalComponent {
displayedColumns: string[] = ['date', 'amount', 'status', 'details'];
  submittedReports: Array<any> = [];
  selectedReport: any | null = null;
  expenseTypes: Record<string, string> = {};
  isLoading: boolean = false;
  getExpenseItems:boolean = false;
  statusOptions:Array<any> = [{label:'All',value:''},{label:'In review',value: 'IN_REVIEW' },{label:'Approved',value:'APPROVED'}]
  statusFilter:string = 'IN_REVIEW';
  showPopup:boolean = false;
  hoveredIndex:number = -1;
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
    // this.submittedReports = [];
    console.log(this.isLoading);
    let params = new Map<string,any>();
    params.set('page_size',100);
    params.set('status',this.statusFilter);
    this.baseAPI.executeGet(
      {
        url : apiDirectory.expenseApprovalReports,
        params: params,
      }
    ).subscribe((res : any) => {
      this.isLoading= false;
      this.submittedReports = res.results;
    })
  }

  openWindow(url:string){
    window.open(url,'_BLANK');
  }

  acceptReport(){
    let body:any = {};
    body['expenses'] = this.selectedReport.expense_report.expenses;
    console.log(body);
    
    this.baseAPI.executePost({url: `${apiDirectory.approveExpenses}${this.selectedReport['id']+'/approve/' }`, body:body }).subscribe(res => {
      console.log('Status updated:', res);
      this.selectedReport = null;
      this.getReports();
    })
  }

  rejectReport(){
    let body:any = {};
    body['expenses'] = this.selectedReport.expense_report.expenses;
    this.baseAPI.executePost({url: `${apiDirectory.approveExpenses}${this.selectedReport['id']+'/reject/' }`, body:body }).subscribe(res => {
      console.log('Status updated:', res);
      this.selectedReport = null;
    })
  }

  viewReportDetails(report: ExpenseReport): void {
    this.getExpenseItems = false;
    this.selectedReport = report;
    console.log(this.selectedReport);
    this.baseAPI.executeGet({
      url : apiDirectory.expenseApprovalReports + this.selectedReport.id + '/'
    }).subscribe(
      (res : any) => {
        this.getExpenseItems = true;
        this.selectedReport = res;
        this.selectedReport.expense_report.expenses.forEach((item:any) =>{
          item.previous_amount = item.latest_amount;
          
        })
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
}
