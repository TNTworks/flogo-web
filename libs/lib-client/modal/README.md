# @flogo-web/lib-client/modal

## Usage

1. Import the modal module into your module

```typescript
// my.module.ts
import { NgModule } from '@angular/core';
import { ModalModule } from '@flogo-web/lib-client/modal';

@NgModule({
  imports: [ModalModule],
  declarations: [],
  entryComponents: [],
})
export class MyModule {}
```

2. Create the component that will be used as the content of the modal.

```typescript
// user-modal.component.ts
import { Component } from '@angular/core';
import { ModalInstance } from '@flogo-web/lib-client/modal';

interface User {
  name: string;
  lastName: string;
}

@Component({
  selector: 'user-modal-component',
  templateUrl: 'user-modal.component.html',
})
class UserModalComponent {
  public user: User;
  constructor(
    // inject the modal instance to:
    //  1. control this modal's instance state
    //  2. Recieve any data sent by the caller
    //  2. communicate to the caller
    private modalInstance: ModalInstance<User>
  ) {
    // get the data sent by the caller
    this.user = modalInstance.data;
  }

  reply(answer: string) {
    // close the modal and send the answer back to the caller
    this.modalInstance.close(answer);
  }
}
```

```html
<!--user-modal.component.html-->
<!--use flogo modal components to use pre-defined styles and layout-->
<flogo-modal size="small">
  <flogo-modal-header> <h2 data-flogo-modal-title>Confirm</h2> </flogo-modal-header>
  <flogo-modal-body>
    Are you {{ user.name }} {{ user.lastName }}? <br />
  </flogo-modal-body>
  <flogo-modal-footer>
    <button (click)="reply('yes')">Yes</button> <button (click)="reply('no')">No</button>
  </flogo-modal-footer>
</flogo-modal>
```

3. Add your modal component to the entrypoints of its module

```typescript
// my.module.ts
import { NgModule } from '@angular/core';
import { ModalModule } from '@flogo-web/lib-client/modal';

import { UserModalComponent } from './user-modal.component';
import { ParentComponent } from './parent.component';

@NgModule({
  imports: [ModalModule],
  declarations: [ParentComponent, UserModalComponent],
  // it is important the modal content component is declared as an entryComponents
  // so it can be dynamically instantiated
  entryComponents: [UserModalComponent],
})
export class MyModule {}
```

4. Instantiate your modal

```typescript
// parent.component.ts

import { Component } from '@angular/core';
import { ModalService } from '@flogo-web/lib-client/modal';

import { UserModalComponent, User } from './user-modal.component';

@Component({...})
export class ParentComponent {
  constructor(private modalService: ModalService) {}

  openModal() {
    // open the modal
    const modalControl = this.modalService.openModal<User>(
      // our modal content
      UserModalComponent,
      // data we want to send to the modal
      { name: 'Jon', lastName: 'Snow' }
    );

    // subscribe to the modal result
    modalControl.result.subscribe(answer => console.log(answer));

    // or close the modal yourself
    modalControl.close();
  }
}
```
