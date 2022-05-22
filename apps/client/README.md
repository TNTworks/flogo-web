# Flogo Web Client Application

### Style Guides for Reference

Refer to the following style guides if need be:

- [JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
- [HTML/CSS Style Guide](https://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml)
- [Angular Style Guide](https://angular.io/guide/styleguide)

## Code conventions

Follow the official [Angular Style Guide](https://angular.io/guide/styleguide).

## Unit and Integration tests

Read [angular's official testing guide](https://angular.io/guide/testing) and about the [different types of testing](https://vsavkin.com/three-ways-to-test-angular-2-components-dcea8e90bd8d).

DO NOT import the TranslateModule directly, instead use the [language testing utilities](/libs/lib-client/language/testing) under `@flogo-web/lib-client/language/testing`.

Run tests

```bash
# from project root
yarn test client
```

Run tests and watch for changes

```bash
# from project root
yarn test client --watch
```
