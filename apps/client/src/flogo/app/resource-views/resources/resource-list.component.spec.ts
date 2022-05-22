import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Output, EventEmitter, DebugElement } from '@angular/core';

import { NoDependenciesFakeLanguageModule } from '@flogo-web/lib-client/language/testing';
import { TimeFromNowPipe, FlogoDeletePopupComponent } from '@flogo-web/lib-client/common';

import { ResourceBadgeComponent } from '../resource-badge';
import { ResourceComponent } from './resource.component';
import { ResourceListComponent } from './resource-list.component';

let fixture: ComponentFixture<TestContainerComponent>;

@Component({
  selector: 'flogo-test-container',
  template: `
    <div class="resources">
      <flogo-apps-resource-list [resources]="resources"></flogo-apps-resource-list>
    </div>
  `,
})
class TestContainerComponent {
  @Output() changes = new EventEmitter();
  resources: Array<any> = [
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '869',
      name: 'Log temperature 2',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date(),
    },
    {
      id: '987',
      name: 'Raise temperature & notifiy operator',
      description: 'A basic resource for apietusam',
      createdAt: new Date(),
    },
  ];

  resourcesUnordered: Array<any> = [
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date(),
    },
    {
      id: '987',
      name: 'Raise temperature',
      description: 'A basic resource for apietusam',
      createdAt: new Date(),
    },
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '869',
      name: 'Try to find pet',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex resource for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
  ];

  // helper function to repeat the event propagation
  changed(value, property) {
    this.changes.emit(value);
  }
}
describe('Application resources (AppsResourceList)', () => {
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      // declare the test component
      declarations: [
        TestContainerComponent,
        ResourceListComponent,
        ResourceComponent,
        ResourceBadgeComponent,
        TimeFromNowPipe,
        FlogoDeletePopupComponent,
      ],
    });
    return TestBed.compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TestContainerComponent);
    fixture.detectChanges();
  });

  it('Should render 4 resources', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.qa-resource')
    );
    expect(res.length).toEqual(4);
  });

  it('Should display the resource title', () => {
    de = fixture.debugElement.query(By.css('.qa-resource-title:nth-of-type(1)'));
    el = de.nativeElement;
    expect(el.innerText).toEqual('Log Temperature');
  });

  it('Should display the resource description', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.qa-resource-description')
    );
    el = res[3].nativeElement;
    expect(el.innerText).toEqual('A basic resource for apietusam');
  });
});
