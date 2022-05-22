const PerspectivePlugin = require('@finos/perspective-webpack-plugin');

module.exports = (config, options) => {
  config.plugins.push(
    new PerspectivePlugin(),
    /*  temp fix to remove source map loader added by perspective plugin which causes compilation warnings */
    {
      apply(compiler) {
        compiler.hooks.afterPlugins.tap(
          'PerspectiveConfigFixerPlugin',
          removePerspectiveSourceMapLoader
        );
      },
    }
  );
  return config;
};

function removePerspectiveSourceMapLoader(compiler) {
  const rules = (((compiler || {}).options || {}).module || {}).rules || [];
  const ruleIndex = rules.findIndex(isPerspectiveSourceMapLoaderRule);
  if (ruleIndex > -1) {
    rules.splice(ruleIndex, 1);
  }
}

function isSameRegex(regex1, regex2) {
  return (
    regex1 instanceof RegExp &&
    regex2 instanceof RegExp &&
    regex1.source === regex2.source
  );
}

const matchRegex = /\.js$/;
function isPerspectiveSourceMapLoaderRule(rule) {
  return (
    rule &&
    rule.loader === 'source-map-loader' &&
    rule.test &&
    isSameRegex(matchRegex, rule.test)
  );
}
