import { Component, Input } from '@angular/core';
import { ICON_TRIGGER_DEFAULT } from '@flogo-web/core';

@Component({
  selector: 'flogo-trigger-icon',
  templateUrl: './trigger-icon.component.html',
  styles: [
    `
      .icon {
        width: 100%;
        height: auto;
      }

      .default-icon {
        padding: 0 4px;
      }

      :host {
        display: flex;
        padding: 4px;
        background-color: #ffffff;
        border-radius: 50%;
        height: 32px;
        width: 32px;
      }
    `,
  ],
})
export class TriggerIconComponent extends Component {
  @Input() iconUrl?: string;

  defaultIconUrl = ICON_TRIGGER_DEFAULT;
}
