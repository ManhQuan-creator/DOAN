import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyVnd', standalone: true })
export class CurrencyVndPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || value === undefined) return '0 VNĐ';
    return value.toLocaleString('vi-VN') + ' VNĐ';
  }
}