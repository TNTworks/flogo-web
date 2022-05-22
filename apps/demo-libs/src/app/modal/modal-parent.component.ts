import { Component, Input } from '@angular/core';
import { ModalService, ModalSize, ModalInstance } from '@flogo-web/lib-client/modal';
import { ModalContentComponent, UserParams } from './modal-content.component';

@Component({
  selector: 'demo-modal',
  templateUrl: './modal-parent.component.html',
  styleUrls: ['./modal-parent.component.less'],
})
export class ModalParentComponent {
  lastReply?: { user: string; reply?: string } = null;

  constructor(private modalService: ModalService) {}

  openDemoModal(user?: string) {
    user = user ? user.trim() : 'stranger';
    const modalControl = this.modalService.openModal<UserParams>(
      // our modal content
      ModalContentComponent,
      { name: user }
    );

    // subscribe to the modal result
    modalControl.result.subscribe((reply?) => {
      this.lastReply = {
        user,
        reply,
      };
    });
  }

  openDynamicSizeModal(size: ModalSize) {
    this.modalService.openModal<ModalSize>(DynamicSizeModalComponent, size);
  }
}

@Component({
  styles: ['.is-padded { }'],
  template: `
    <flogo-modal [size]="size" (close)="modalInstance.close()">
      <flogo-modal-header>
        <h2 data-flogo-modal-title>I'm a {{ size }} modal</h2>
      </flogo-modal-header>
      <flogo-modal-body
        [class.is-padded]="isSmall"
        [style.padding]="isSmall ? undefined : '0 1.5rem'"
      >
        <p>I'm the body of this modal.</p>
        <p>Size: {{ size }}</p>

        <div *ngIf="!isSmall">
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
            felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat
            massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,
            arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam
            dictum felis eu pede <a class="external ext" href="#">link</a> mollis pretium.
            Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
            vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae,
            eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a,
            tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.
            Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper
            ultricies nisi.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            pellentesque eu, pretium quis, sem.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            pellentesque eu, pretium quis, sem.
          </p>
          <ul>
            <li>Lorem ipsum dolor sit amet consectetuer.</li>
            <li>Aenean commodo ligula eget dolor.</li>
            <li>Aenean massa cum sociis natoque penatibus.</li>
          </ul>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            pellentesque eu, pretium quis, sem.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            pellentesque eu, pretium quis, sem.
          </p>
          <table class="data">
            <tr>
              <th>Entry Header 1</th>
              <th>Entry Header 2</th>
              <th>Entry Header 3</th>
              <th>Entry Header 4</th>
            </tr>
            <tr>
              <td>Entry First Line 1</td>
              <td>Entry First Line 2</td>
              <td>Entry First Line 3</td>
              <td>Entry First Line 4</td>
            </tr>
            <tr>
              <td>Entry Line 1</td>
              <td>Entry Line 2</td>
              <td>Entry Line 3</td>
              <td>Entry Line 4</td>
            </tr>
            <tr>
              <td>Entry Last Line 1</td>
              <td>Entry Last Line 2</td>
              <td>Entry Last Line 3</td>
              <td>Entry Last Line 4</td>
            </tr>
          </table>

          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo
            ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            pellentesque eu, pretium quis, sem.
          </p>
        </div>
      </flogo-modal-body>
      <flogo-modal-footer>I'm the footer</flogo-modal-footer>
    </flogo-modal>
  `,
})
export class DynamicSizeModalComponent {
  size: ModalSize;
  constructor(public modalInstance: ModalInstance<ModalSize>) {
    this.size = this.modalInstance.data;
  }

  get isSmall() {
    return this.size === 'small';
  }
}
