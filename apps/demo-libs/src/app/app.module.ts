import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

import { CoreModule } from '@flogo-web/lib-client/core';
import { NotificationsModule } from '@flogo-web/lib-client/notifications';
import { ModalModule } from '@flogo-web/lib-client/modal';
import { ContextPanelModule } from '@flogo-web/lib-client/context-panel';
import { SearchModule } from '@flogo-web/lib-client/search';
import { SelectModule } from '@flogo-web/lib-client/select';

import { AppComponent, HomeComponent } from './app.component';
import { NotificationsComponent } from './notifications';
import { ModalParentComponent, ModalDemoModule } from './modal';
import { ContextPanelComponent } from './context-panel/context-panel.component';
import { SearchComponent, PeopleComponent } from './search';
import { FormDemoComponent } from './form-demo/form-demo.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotificationsComponent,
    ContextPanelComponent,
    SearchComponent,
    PeopleComponent,
    FormDemoComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    OverlayModule,

    CoreModule,
    NotificationsModule,
    ModalModule,
    ContextPanelModule,
    SearchModule,
    SelectModule,

    RouterModule.forRoot(
      [
        { path: 'notifications', component: NotificationsComponent },
        { path: 'modals', component: ModalParentComponent },
        { path: 'context-panel', component: ContextPanelComponent },
        { path: 'search', component: SearchComponent },
        { path: 'forms', component: FormDemoComponent },
        { path: '', component: HomeComponent },
        { path: '**', redirectTo: '' },
      ],
      {
        initialNavigation: 'enabled',
      }
    ),

    // app modules
    ModalDemoModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
