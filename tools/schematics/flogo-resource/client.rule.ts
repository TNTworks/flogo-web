import * as ts from 'typescript';
import {
  findNodes,
  insertAfterLastOccurrence,
  getDecoratorMetadata,
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { strings } from '@angular-devkit/core';
import {
  apply,
  url,
  chain,
  externalSchematic,
  template,
  move,
  mergeWith,
  MergeStrategy,
  branchAndMerge,
  Rule,
  Tree,
  SchematicContext,
  SchematicsException,
} from '@angular-devkit/schematics';

import { resolvePluginNames, PluginNames, toClassName } from './utils';

const PLUGINS_CONFIG_FILE = 'apps/client/src/plugins.ts';
const CLIENT_TS_CONFIG = 'apps/client/tsconfig.app.json';
const RESOURCE_PLUGINS_DECLARATOR = 'resourcePlugins';

const pluginModule = subpackageName => `@flogo-web/plugins/${subpackageName}`;

export function clientConfigRule(pluginType: string, options): Rule {
  const pluginNames = resolvePluginNames(pluginType);
  const projectName = pluginNames.client.directoryName;
  return chain([
    externalSchematic('@schematics/angular', 'component', {
      name: 'main',
      project: `plugins-${projectName}`,
      styleext: 'less',
      module: `${projectName}.module.ts`,
    }),
    createSampleFiles(pluginNames.client, {
      name: pluginType,
      prefix: `flogo-${pluginType}`,
    }),
    (tree: Tree, context: SchematicContext) => {
      registerPluginInClient(pluginType, pluginNames.client, tree);
      includePluginInClientTsConfig(projectName, tree);
      return tree;
    },
  ]);
}

function createSampleFiles(
  info: PluginNames,
  options: { name?: string; prefix?: string } = {}
) {
  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url('./files/client'), [
      template({
        ...strings,
        ...options,
      }),
      move(`${info.rootPath}/src/lib`),
    ]);
    return chain([
      branchAndMerge(
        chain([mergeWith(templateSource, MergeStrategy.Overwrite)]),
        MergeStrategy.Overwrite
      ),
    ])(tree, _context);
  };
}

export function registerPluginInClient(
  pluginType: string,
  pluginNames: PluginNames,
  tree: Tree
) {
  const pluginsConfigFileContent = tree.read(PLUGINS_CONFIG_FILE);
  if (pluginsConfigFileContent === null) {
    throw new SchematicsException(
      `Could not find client app's plugin configuration file (${PLUGINS_CONFIG_FILE}).`
    );
  }
  const source = ts.createSourceFile(
    PLUGINS_CONFIG_FILE,
    pluginsConfigFileContent.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const variables = findNodes(source, ts.SyntaxKind.VariableDeclaration);
  const resourcePluginDeclarations = variables.find(
    (v: ts.VariableDeclaration) =>
      v.name && v.name.getText() === RESOURCE_PLUGINS_DECLARATOR
  ) as ts.VariableDeclaration;
  if (
    resourcePluginDeclarations.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    throw new SchematicsException(
      `Could not register the client plugin. "resourcePlugins" in ${PLUGINS_CONFIG_FILE} is not an array literal expression`
    );
  }

  const elements = Array.from(
    (resourcePluginDeclarations.initializer as ts.ArrayLiteralExpression).elements
  );
  const pluginAsClassName = toClassName(pluginType);
  const pluginModuleName = pluginModule(pluginNames.directoryName);
  const change = insertAfterLastOccurrence(
    Array.from(elements),
    `${elements.length > 0 ? ',' : ''}
   {
      label: '${pluginAsClassName}',
      type: '${pluginType}',
      path: '${pluginType}',
      loadChildren: () => import('${pluginModuleName}').then(m => m.${
      pluginNames.entrySymbol
    }),
      color: '#2b4d8d',
   }`,
    PLUGINS_CONFIG_FILE,
    0
  );

  if (change instanceof InsertChange) {
    const recorder = tree.beginUpdate(PLUGINS_CONFIG_FILE);
    recorder.insertLeft(change.pos, change.toAdd);
    tree.commitUpdate(recorder);
  }
}

function includePluginInClientTsConfig(pluginFolderName: string, tree: Tree) {
  const clientTsConfig = tree.read(CLIENT_TS_CONFIG);
  const source = ts.createSourceFile(
    CLIENT_TS_CONFIG,
    clientTsConfig.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const includeStart = source.text.indexOf('"include":');
  const endOfInclude = source.text.indexOf(']', includeStart);

  const recorder = tree.beginUpdate(CLIENT_TS_CONFIG);
  recorder.insertLeft(
    endOfInclude,
    `, "../../libs/plugins/${pluginFolderName}/src/index.ts"\n`
  );
  tree.commitUpdate(recorder);
}

export function getNgModuleNode(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression {
  const nodes = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');

  return nodes.length === 1 && nodes[0].kind === ts.SyntaxKind.ObjectLiteralExpression
    ? (nodes[0] as ts.ObjectLiteralExpression)
    : null;
}
