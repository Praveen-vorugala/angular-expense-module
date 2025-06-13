import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderscore'
})
export class RemoveUnderscorePipe implements PipeTransform {

  transform(value: any , separator: string): string {
    if(!value)
      return value
    let regex=new RegExp(separator,"g");
    return value.replace(regex, " ");
  }

}
