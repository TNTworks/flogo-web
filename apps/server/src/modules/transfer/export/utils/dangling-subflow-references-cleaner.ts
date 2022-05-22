import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

export class DanglingSubflowReferencesCleaner {
  static create() {
    return new DanglingSubflowReferencesCleaner();
  }

  cleanMappings(task, linkedFlow) {
    const linkedFlowInputMetadata = this.getFlowMetadata(linkedFlow);
    if (!linkedFlowInputMetadata || isEmpty(task.inputMappings)) {
      return {};
    }

    const finalMappingNames = linkedFlowInputMetadata.map(input => input.name);
    task.inputMappings = pick(task.inputMappings, finalMappingNames);
    return task.inputMappings;
  }

  getFlowMetadata(linkedFlow) {
    if (linkedFlow && linkedFlow.metadata && linkedFlow.metadata.input) {
      return linkedFlow.metadata.input;
    }
    return null;
  }
}
