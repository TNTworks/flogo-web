import {
  Component,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { PerfectScrollbarDirective as ScrollbarDirective } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'flogo-mapper-function-details',
  templateUrl: 'function-details.component.html',
  styleUrls: ['function-details.component.css'],
})
export class FunctionDetailsComponent implements OnChanges {
  @Input() name: string;
  // todo: fix wrong interface coming from wi
  @Input() description: string;
  @ViewChildren(ScrollbarDirective) scrollbars: QueryList<ScrollbarDirective>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['help']) {
      this.updateScrollbars();
    }
  }

  private updateScrollbars() {
    setTimeout(() => {
      if (this.scrollbars) {
        this.scrollbars.forEach(scrollbar => {
          scrollbar.scrollTo(0);
          return scrollbar.update();
        });
      }
    }, 0);
  }
}
