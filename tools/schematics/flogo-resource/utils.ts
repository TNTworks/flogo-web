export interface PluginNames {
  directoryName: string;
  rootPath: string;
  entrySymbol: string;
}

export function resolvePluginNames(
  pluginName: string
): { server: PluginNames; client: PluginNames } {
  const serverRootName = `${toFileName(pluginName)}-server`;
  const clientRootName = `${toFileName(pluginName)}-client`;
  return {
    server: {
      directoryName: serverRootName,
      rootPath: pluginPathToRoot(serverRootName),
      entrySymbol: `${pluginName}Plugin`,
    },
    client: {
      directoryName: clientRootName,
      rootPath: pluginPathToRoot(clientRootName),
      entrySymbol: `${toClassName(pluginName)}ClientModule`,
    },
  };
}

function pluginPathToRoot(rootFolderName) {
  return `libs/plugins/${rootFolderName}`;
}

export function toFileName(s: string): string {
  return s
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[ _]/g, '-');
}

export function toClassName(s: string): string {
  return s.charAt(0).toUpperCase() + s.substr(1);
}
