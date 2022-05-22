# @flogo-web/assets

Flogo Web UI application assets such as fonts, styles and images.

## Why is this not under `@flogo-web/lib-client` ?

Unlike the other client specific packages, this package is directly under `libs` mostly because technical limitations when
referencing the assets from `.less` source files.

In order to make the following import in a `.less` file work:

```less
// in libs/lib-client/sublib/foo.less
@import '~@flogo-web/assets/_some-other-less-file';
```

We need to rely on yarn's [`link`](https://yarnpkg.com/lang/en/docs/cli/link/) feature to symlink the assets package (`node_modules/@flogo-web/assets`).
If assets were placed under `libs/lib-client/assets` we would need to link the whole `lib-client` directory instead.
