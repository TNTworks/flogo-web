// import {ConfiguratorService} from './configurator.service';
// import {ConfigureTriggersMock, FlowMetaDataMock, InvalidConfigureTriggersMock, ConfigureTriggerSchema} from '../mocks/triggers.mock';
// import {Subject} from 'rxjs/Subject';
//
// // todo: fcastill re-enable tests after state changes are completed
// xdescribe('Service: ConfiguratorService', function (this: {
//   service: ConfiguratorService
// }) {
//   let MockData;
//
//   beforeEach(() => {
//     const storeMock = {
//       dispatch() {},
//       select() { return new Subject(); }
//     };
//     MockData = {
//       triggers: ConfigureTriggersMock,
//       flowMetadata: FlowMetaDataMock,
//       triggerConfigure: {
//         isOpen: true,
//         selectedTriggerId: 'trigger_1',
//         schemas: ConfigureTriggerSchema,
//         triggersForm: null
//       }
//     };
//     this.service = new ConfiguratorService(<any>storeMock);
//   });
//
//   it('Should mark current modal status state properly on open()', () => {
//     this.service.open(MockData);
//     expect(this.service.currentModalStatus.isOpen).toEqual(true);
//     expect(this.service.currentModalStatus.flowMetadata).toEqual(FlowMetaDataMock);
//     expect(this.service.currentModalStatus.selectedTriggerId).toEqual('trigger_1');
//   });
//
//   it('Should mark current modal status state properly on close()', () => {
//     this.service.close();
//     expect(this.service.currentModalStatus.isOpen).toEqual(false);
//     expect(this.service.currentModalStatus.flowMetadata).toEqual(null);
//     expect(this.service.currentModalStatus.selectedTriggerId).toEqual(null);
//     expect(this.service.triggersToConfigure.size).toEqual(0);
//   });
//
//   it('Should create the triggersToConfigure map with 2 entries in it', () => {
//     this.service.open(MockData);
//     expect(this.service.triggersToConfigure.size).toEqual(2);
//   });
//
//   it('Should mark the trigger as modified', () => {
//     this.service.open(MockData);
//     this.service.updateTriggerConfiguration({
//       isValid: true,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 2,
//               'value': 4754393
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//     expect(this.service.triggersToConfigure.get('trigger_1').isDirty).toEqual(true);
//   });
//
//   it('Should mark a trigger as invalid on init when the trigger mappings are invalid', () => {
//     MockData.triggers = InvalidConfigureTriggersMock;
//     this.service.open(MockData);
//     expect(this.service.triggersToConfigure.get('trigger_1').isValid).toEqual(false);
//   });
//
//   it('Should enable save when the trigger configurations are valid and modified', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       expect(nextStatus.disableSave).toEqual(false);
//       done();
//     });
//     this.service.updateTriggerConfiguration({
//       isValid: true,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 2,
//               'value': 4754393
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//   });
//
//   it('Should mark the trigger valid after correct modification to its configuration', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       const trigger = nextStatus.triggers.find(t => t.id === 'trigger_1');
//       expect(trigger.isValid).toEqual(true);
//       done();
//     });
//     this.service.updateTriggerConfiguration({
//       isValid: true,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 2,
//               'value': 4754393
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//   });
//
//   it('Should mark the trigger dirty after correct modification to its configuration', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       const trigger = nextStatus.triggers.find(t => t.id === 'trigger_1');
//       expect(trigger.isDirty).toEqual(true);
//       done();
//     });
//     this.service.updateTriggerConfiguration({
//       isValid: true,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 2,
//               'value': 4754393
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//   });
//
//   it('Should disable save when trigger configurations are modified and invalid', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       expect(nextStatus.disableSave).toEqual(true);
//       done();
//     });
//     this.service.updateTriggerConfiguration({
//       isValid: false,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 1,
//               'value': '47543dfafa'
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//   });
//
//   it('Should disable save when trigger configurations are modified to original state', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       expect(nextStatus.disableSave).toEqual(true);
//       done();
//     });
//     this.service.updateTriggerConfiguration({
//       isValid: true,
//       changedMappings: {
//         actionMappings: {
//           input: [
//             {
//               'mapTo': 'in',
//               'type': 2,
//               'value': 200
//             },
//             {
//               'mapTo': 'in2',
//               'type': 2,
//               'value': 56565656
//             }
//           ],
//           output: []
//         }
//       }
//     });
//   });
//
//   it('Should allow selecting other triggers to configure', (done) => {
//     this.service.open(MockData);
//     this.service.configuratorStatus$.subscribe(nextStatus => {
//       expect(nextStatus.selectedTriggerId).toEqual('trigger_2');
//       done();
//     });
//     this.service.selectTrigger('trigger_2');
//     expect(this.service.currentModalStatus.selectedTriggerId).toEqual('trigger_2');
//   });
// });
