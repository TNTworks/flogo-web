import { NgModule } from '@angular/core';
import { fakeLanguageProvider } from './fake-language.provider';
import { FakeTranslatePipe } from './fake-translate.pipe';

@NgModule({
  providers: [fakeLanguageProvider],
  declarations: [FakeTranslatePipe],
  exports: [FakeTranslatePipe],
})
export class NoDependenciesFakeLanguageModule {}
