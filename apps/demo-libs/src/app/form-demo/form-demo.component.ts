import { Component } from '@angular/core';

@Component({
  selector: 'demo-dropdown',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.css'],
})
export class FormDemoComponent {
  currentValue: string;
  currentValueForDefault = 'Some default';

  constructor() {}

  select(selection) {
    this.currentValue = selection.value;
  }
}
