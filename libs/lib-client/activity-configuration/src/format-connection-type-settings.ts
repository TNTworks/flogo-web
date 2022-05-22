import { TypeConnection } from '@flogo-web/core';

export function formatConnectionTypeSettings(activitySettings, schema) {
  const connectionSettings = schema.settings?.filter(
    setting => setting.type === TypeConnection.Connection
  );
  if (connectionSettings && connectionSettings.length) {
    connectionSettings.forEach(connection => {
      const connectionSetting = activitySettings[connection.name];
      if (connectionSetting) {
        activitySettings[connection.name] = connectionSetting.mapping;
      }
    });
  }
  return activitySettings;
}
