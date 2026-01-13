import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ae-button, button[aeButton]',
  templateUrl: './ae-button.component.html',
  styleUrls: ['./ae-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'angular-editor-button',
    '[tabIndex]': '-1',
    '[attr.type]': '"button"',
  },
  standalone: false
})
export class AeButtonComponent {

  readonly iconName = input('');

  constructor() {
  }

}
