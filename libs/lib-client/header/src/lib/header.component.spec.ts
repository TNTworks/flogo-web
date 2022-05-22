import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';

import { HeaderModule } from './header.module';
import { HeaderComponent } from './header.component';

describe('HeaderComponent component', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [HeaderModule, FakeRootLanguageModule],
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('Should make both back icon and app name active on hover', () => {
    const backIcon = fixture.nativeElement.querySelector('.qa-icon-back');
    const appName = fixture.nativeElement.querySelector('.qa-app-name');
    component.isHoveredOnBack = true;
    fixture.detectChanges();
    expect(backIcon.classList.contains('--hover')).toEqual(true);
    expect(appName.classList.contains('--hover')).toEqual(true);
  });

  it('Should emit back to application event when click on back icon', () => {
    const backIcon = fixture.nativeElement.querySelector('.qa-icon-back');
    spyOn(component.goBack, 'emit');
    backIcon.click();
    fixture.detectChanges();
    expect(component.goBack.emit).toHaveBeenCalled();
  });

  it('Should emit back to application event when click on app name', () => {
    const backIcon = fixture.nativeElement.querySelector('.qa-app-name');
    spyOn(component.goBack, 'emit');
    backIcon.click();
    fixture.detectChanges();
    expect(component.goBack.emit).toHaveBeenCalled();
  });

  it('Should emit change in resource name', done => {
    const name = fixture.debugElement.query(By.css('.qa-resource-name'));
    component.changeName.subscribe(changes => {
      expect(changes).toEqual('changed name');
      done();
    });
    const nameElement = name.nativeElement;
    name.triggerEventHandler('focus', null);
    fixture.detectChanges();
    nameElement.innerHTML = 'changed name';
    name.triggerEventHandler('blur', null);
    fixture.detectChanges();
  });

  it('Should emit change in resource description', done => {
    const description = fixture.debugElement.query(By.css('.qa-resource-description'));
    component.changeDescription.subscribe(changes => {
      expect(changes).toEqual('changed description');
      done();
    });
    const descriptionElement = description.nativeElement;
    description.triggerEventHandler('focus', null);
    fixture.detectChanges();
    descriptionElement.innerHTML = 'changed description';
    description.triggerEventHandler('blur', null);
    fixture.detectChanges();
  });
});
