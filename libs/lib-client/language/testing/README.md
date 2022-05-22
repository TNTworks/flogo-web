# Testing Language Module

Testing Utilities for [shallow and integration testing](https://vsavkin.com/three-ways-to-test-angular-2-components-dcea8e90bd8d).

In order to ease the development of unit and integration tests and to decouple the flogo implementation from third party
libraries this module provides several utilities to configure the language features in testing modules.

Tests should be as simple as possible and that includes adding as few dependencies as possible. But different test implementation
require different configurations, that's why this module contains different strategies to configure your test module.

The following list should help to select the most appropriate strategy for a test, they're ordered by simplicity
i.e. from most preferable to least preferable:

1. If neither your component nor any module imported in your test uses the `LanguageService` or the `translate` then
   you don't need any of these utilities and you can skip this guide.
2. If you **only** need the `LanguageService` use the [fakeLanguageProvider](#fakeLanguageprovider-for-languageservice)
3. If you **only** need the `translate` pipe use the [FakeTranslatePipe](#fake-translate-pipe)
4. If you need both the `LanguageService` and the `translate` pipe and your test doesn't depend on flogo's SharedModule
   nor flogo's CoreModule then use the [NoDependenciesFakeLanguageModule](#nodependenciesfakelanguagemodule)
5. If you're importing flogo's CoreModule or flogo's SharedModule (or one of your test dependencies import them) then
   use [FakeRootLanguageModule](#fakerootlanguagemodule). _Note:_ This option is most suitable for integration testing,
   if you're not implementing an integration test and the only suitable option seems to be the FakeRootLanguageModule
   please re-evaluate your component's design and component test' design to see if it can be simplified.

## fakeLanguageProvider for LanguageService

Use this approach if you _only_ need the LanguageService.

```javascript
import { fakeLanguageProvider } from '@flogo-web/lib-client/language/testing';
TestBed.configureTestingModule({
  imports: [],
  declarations: [],
  providers: [fakeLanguageProvider],
});
```

## fake translate pipe

Use this approach if you only need the translate pipe.
For example if your template declares something like `<div>{{ 'MY-TRANSLATE-KEY': translate }}</div>`.

Example:

```javascript
import { FakeTranslatePipe } from '@flogo-web/lib-client/language/testing';
TestBed.configureTestingModule({
  imports: [],
  declarations: [FakeTranslatePipe, MyComponentUnderTestThatUsesTranslatePipe],
  providers: [],
});
```

## NoDependenciesFakeLanguageModule

Use this if you need both the LanguageService and the translate pipe and your test module and its dependent submodules
**DO NOT** depend on flogo's CoreModule or SharedModule.

Example:

```javascript
import { NoDependenciesFakeLanguageModule } from '@flogo-web/lib-client/language/testing';
TestBed.configureTestingModule({
  imports: [NoDependenciesFakeLanguageModule],
  declarations: [MyComponentUnderTestThatUsesLanguageServiceAndTranslatePipe],
  providers: [],
});
```

## FakeRootLanguageModule

Use this if your test module depends on flogo's CoreModule or SharedModule.

Example:

```javascript
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';
TestBed.configureTestingModule({
  imports: [
    FakeRootLanguageModule,
    CoreModule,
    SharedModule,
    AnotherModuleThatUsesCoreModuleOrSharedModule,
  ],
  declarations: [ComponentUnderTest],
  providers: [],
});
```
