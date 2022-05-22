import {
  ContributionType,
  FlogoAppModel,
  SchemaSettingAttributeDescriptor,
  TypeConnection,
} from '@flogo-web/core';
import { ExportRefAgent, ImportsRefAgent } from '../extensions';

export function transformConnectionTypeSettings(
  settings: FlogoAppModel.Settings,
  settingsSchema: SchemaSettingAttributeDescriptor[],
  refAgent: ImportsRefAgent | ExportRefAgent,
  isImport: boolean
) {
  const connectionSettings = settingsSchema?.filter(
    setting => setting.type === TypeConnection.Connection
  );
  if (connectionSettings && connectionSettings.length) {
    connectionSettings.forEach(connection => {
      const connectionSetting = settings[connection.name];
      if (connectionSetting) {
        connectionSetting.ref = isImport
          ? (<ImportsRefAgent>refAgent).getPackageRef(
              ContributionType.Connection,
              connectionSetting.ref
            )
          : (<ExportRefAgent>refAgent).getAliasRef(
              ContributionType.Connection,
              connectionSetting.ref
            );
      }
    });
  }
  return settings;
}
