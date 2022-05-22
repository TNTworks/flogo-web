import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { serverConfigRule } from './server.rule';
import { clientConfigRule } from './client.rule';

const PLUGINS_DIR = 'plugins';

export default function(schema: any): Rule {
  const type = schema.type;
  return chain([
    externalSchematic('@nrwl/angular', 'library', {
      name: `${type}-client`,
      directory: PLUGINS_DIR,
      framework: 'angular',
      unitTestRunner: 'karma',
      prefix: `flogo-${type}`,
      tags: 'client,plugins',
      style: 'less',
      routing: true,
      lazy: true,
      simpleModuleName: true,
    }),
    externalSchematic('@nrwl/workspace', 'lib', {
      name: `${type}-server`,
      directory: PLUGINS_DIR,
      unitTestRunner: 'jest',
      tags: 'server,plugins',
    }),
    serverConfigRule(type, schema),
    clientConfigRule(type, schema),
    formatFiles(),
  ]);
}
