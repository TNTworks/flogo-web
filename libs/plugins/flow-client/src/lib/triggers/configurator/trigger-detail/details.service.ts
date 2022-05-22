import { isEmpty } from 'lodash';
import { Injectable } from '@angular/core';
import {
  SchemaSettingAttributeDescriptor as SchemaAttribute,
  TriggerSchema,
} from '@flogo-web/core';
import { Dictionary, TriggerHandler } from '@flogo-web/lib-client/core';
import { MapperController, MapperControllerFactory } from '@flogo-web/lib-client/mapper';
import {
  CurrentTriggerState,
  SettingControlInfo,
  TriggerInformation,
} from '../interfaces';
import { SettingsFormBuilder } from './settings-form-builder';
import { createValidatorsForSchema } from './settings-validation';
import { TriggerNameValidatorService } from './trigger-name-validator.service';
import { makeSnippet, MapperTranslator } from '../../../shared/mapper';

@Injectable()
export class ConfigureDetailsService {
  constructor(
    private settingsFormBuilder: SettingsFormBuilder,
    private mapperControllerFactory: MapperControllerFactory,
    private nameValidator: TriggerNameValidatorService,
    private mapperTranslator: MapperTranslator
  ) {}

  build(state: CurrentTriggerState) {
    const {
      flowMetadata,
      schema: triggerSchema,
      handler: { actionMappings },
      fields,
      trigger: { handlers },
    } = state;
    const { input, output } = actionMappings || { input: {}, output: {} };
    const disableCommonSettings = handlers.length > 1;
    const triggerInformation = this.getTriggerInformation(handlers, triggerSchema);
    const nameValidator = this.nameValidator.create(state.appId, state.trigger.id);
    return {
      settings: this.settingsFormBuilder.build(
        fields.settings,
        triggerInformation.settingsControls,
        disableCommonSettings,
        nameValidator
      ),
      flowInputMapper: this.createInputMapperController(
        flowMetadata,
        triggerSchema,
        input,
        state.functions
      ),
      replyMapper: this.createReplyMapperController(
        flowMetadata,
        triggerSchema,
        output,
        state.functions
      ),
      triggerInformation,
    };
  }

  private getTriggerInformation(
    handlers: TriggerHandler[],
    triggerSchema: TriggerSchema
  ): TriggerInformation {
    return {
      settingsControls: this.getAllSettingsControls(triggerSchema),
      trigger: {
        handlersCount: handlers.length,
        homePage: triggerSchema.homepage,
        readme: triggerSchema.homepage,
      },
    };
  }

  private getAllSettingsControls(
    schema: TriggerSchema
  ): TriggerInformation['settingsControls'] {
    const { settings: triggerSettings, handler } = schema;
    const { settings: handlerSettings } = handler;
    return {
      triggerSettings: this.reduceSettingsAndGetInfo(triggerSettings),
      handlerSettings: this.reduceSettingsAndGetInfo(handlerSettings),
    };
  }

  private createReplyMapperController(
    flowMetadata,
    triggerSchema,
    output: any,
    functions
  ): null | MapperController {
    const flowOutput = flowMetadata && flowMetadata.output ? flowMetadata.output : null;
    if (isEmpty(flowOutput) || isEmpty(triggerSchema.reply)) {
      return null;
    }
    return this.mapperControllerFactory.createController(
      triggerSchema.reply || [],
      flowMetadata && flowMetadata.output ? flowMetadata.output : [],
      output,
      functions,
      makeSnippet,
      this.mapperTranslator
    );
  }

  private createInputMapperController(
    flowMetadata,
    triggerSchema,
    input: any,
    functions
  ): null | MapperController {
    const flowInput = flowMetadata && flowMetadata.input ? flowMetadata.input : null;
    if (isEmpty(flowInput) || isEmpty(triggerSchema.outputs)) {
      return null;
    }
    return this.mapperControllerFactory.createController(
      flowInput,
      triggerSchema.outputs || [],
      input,
      functions,
      makeSnippet,
      this.mapperTranslator
    );
  }

  private reduceSettingsAndGetInfo(
    settings: SchemaAttribute[]
  ): Dictionary<SettingControlInfo> {
    return (settings || []).reduce((allSettings, setting) => {
      allSettings[setting.name] = {
        ...setting,
        propsAllowed: [],
        validations: createValidatorsForSchema(setting),
      };
      return allSettings;
    }, {});
  }
}
