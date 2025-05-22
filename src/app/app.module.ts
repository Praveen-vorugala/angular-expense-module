import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptorInterceptor } from './services/http-interceptor.interceptor';
import { ExpenseReportsComponent } from './pages/expense-reports/expense-reports.component';
import { AuthService } from './services/auth.service';
import { LayoutModule } from './layout/layout.module';
import { PopOverService } from './services/pop-over/pop-over.service';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        LayoutModule
    ],
    providers: [
        AuthService,
        PopOverService,
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
