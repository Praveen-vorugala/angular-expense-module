import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
// import { MatSnackBar, MatSnackBarRef, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PopOverService {
  private defaultDuration = 3000; // 3 seconds default duration

  constructor(
    private toast: MatSnackBar,
  ) { }

  /**
   * Show success toast message
   * @param message Message to display
   * @param duration Duration in milliseconds (optional)
   */
  showSuccess(message: string, duration?: number) {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };
    this.toast.open(message, '✓', config);
  }

  /**
   * Show error toast message
   * @param message Message to display
   * @param duration Duration in milliseconds (optional)
   */
  showError(message: string, duration?: number) {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };
    this.toast.open(message, '✕', config);
  }

  /**
   * Show warning toast message
   * @param message Message to display
   * @param duration Duration in milliseconds (optional)
   */
  showWarning(message: string, duration?: number) {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };
    this.toast.open(message, '⚠', config);
  }

  /**
   * Show info toast message
   * @param message Message to display
   * @param duration Duration in milliseconds (optional)
   */
  showInfo(message: string, duration?: number) {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };
    this.toast.open(message, 'ℹ', config);
  }

  // /**
  //  * Generic method to show custom toast message
  //  * @param message Message to display
  //  * @param action Action button text
  //  * @param config Custom configuration (optional)
  //  */
  // openSnackBar(message: string, action: string, config?: MatSnackBarConfig) {
  //   this.toast.open(message, action, config);
  // }
  showLog(text:string){
    console.log("text",text);
    
  }
}
