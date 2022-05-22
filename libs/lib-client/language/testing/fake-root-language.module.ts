import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { LanguageService } from '@flogo-web/lib-client/language';

@NgModule({
  imports: [TranslateModule.forRoot()],
  providers: [{ provide: LanguageService, useExisting: TranslateService }],
  exports: [TranslateModule],
})
export class FakeRootLanguageModule {}
