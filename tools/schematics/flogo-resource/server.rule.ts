import * as ts from 'typescript';
import {
  insertImport,
  findNodes,
  insertAfterLastOccurrence,
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  url,
  apply,
  chain,
  template,
  branchAndMerge,
  mergeWith,
  move,
  MergeStrategy,
  Rule,
  Tree,
  SchematicContext,
  SchematicsException,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { PluginNames, resolvePluginNames } from './utils';

const PLUGIN_CONFIGURATOR_FUNCTION_NAME = 'loadPlugins';
const PLUGINS_CONFIG_PATH = 'apps/server/src/plugins.ts';

export function serverConfigRule(resourceType: string, options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pluginNames = resolvePluginNames(resourceType);
    registerPluginInServer(pluginNames.server, tree);
    return chain([pluginFilesRule(resourceType, options.ref, pluginNames.server)])(
      tree,
      context
    );
  };
}

function pluginFilesRule(
  pluginType: string,
  pluginRef: string | null,
  serverProject: PluginNames
) {
  return (tree: Tree, _context: SchematicContext) => {
    const existingLibDir = tree.getDir(`${serverProject.rootPath}/src/lib`);
    existingLibDir.subfiles.forEach(file => tree.delete(existingLibDir.file(file).path));
    const resourceRef = !pluginRef ? '__DEV_RESOURCE_REF_PLACEHOLDER' : `'${pluginRef}'`;
    const templateSource = apply(url('./files/server/src'), [
      template({
        ...strings,
        entrySymbol: serverProject.entrySymbol,
        pluginRef,
        resourceRef,
        pluginType,
      }),
      move(`${serverProject.rootPath}/src`),
    ]);
    return chain([
      branchAndMerge(
        chain([mergeWith(templateSource, MergeStrategy.Overwrite)]),
        MergeStrategy.Overwrite
      ),
    ])(tree, _context);
  };
}

function registerPluginInServer(pluginNames: PluginNames, tree: Tree) {
  const pluginsConfigFileContent = tree.read(PLUGINS_CONFIG_PATH);
  if (pluginsConfigFileContent === null) {
    throw new SchematicsException(
      `Could not find server's plugin configuration file (apps/server/src/plugins.ts).`
    );
  }
  const source = ts.createSourceFile(
    PLUGINS_CONFIG_PATH,
    pluginsConfigFileContent.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );

  const importChange = insertImport(
    source,
    PLUGINS_CONFIG_PATH,
    pluginNames.entrySymbol,
    `@flogo-web/plugins/${pluginNames.directoryName}`
  );

  const pluginConfigChange = configurePlugin(
    tree,
    source,
    PLUGINS_CONFIG_PATH,
    pluginNames.entrySymbol
  );

  const recorder = tree.beginUpdate(PLUGINS_CONFIG_PATH);
  if (importChange instanceof InsertChange) {
    recorder.insertLeft(importChange.pos, importChange.toAdd);
  }
  if (pluginConfigChange instanceof InsertChange) {
    recorder.insertLeft(pluginConfigChange.pos, pluginConfigChange.toAdd);
  }
  tree.commitUpdate(recorder);
}

function configurePlugin(
  tree: Tree,
  source: ts.SourceFile,
  pathToFile: string,
  pluginSymbol: string
) {
  const functions = findNodes(source, ts.SyntaxKind.FunctionDeclaration);
  const configuratorFn = functions.find(
    (n: ts.FunctionDeclaration) =>
      n.name && n.name.text === PLUGIN_CONFIGURATOR_FUNCTION_NAME
  ) as ts.FunctionDeclaration;

  if (!configuratorFn) {
    throw new SchematicsException(
      `Could not find server's plugins configuration function ("${PLUGIN_CONFIGURATOR_FUNCTION_NAME}" in "apps/server/src/plugins.ts).`
    );
  }

  const registratorParam = configuratorFn.parameters[0];
  if (!registratorParam) {
    throw new SchematicsException(
      `Missing registrator parameter in function "${PLUGIN_CONFIGURATOR_FUNCTION_NAME}()" in "apps/server/src/plugins.ts).`
    );
  }

  if (registratorParam.name.kind !== ts.SyntaxKind.Identifier) {
    throw new SchematicsException(
      `Could not register the server plugin. Function "${PLUGIN_CONFIGURATOR_FUNCTION_NAME}()" in "apps/server/src/plugins.ts" is missing its parameter's name. Expected parameter name to be an Identifier.`
    );
  }
  const registratorName = registratorParam.name.text;
  return insertAfterLastOccurrence(
    Array.from(configuratorFn.body.statements),
    `\n  ${registratorName}.use(${pluginSymbol});
`,
    pathToFile,
    0
  );
}
