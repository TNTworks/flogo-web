import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { ResourceInterfaceBuilderService } from '@flogo-web/lib-client/resource-interface-builder';
import { ModalControl } from '@flogo-web/lib-client/modal';
import { FlowMetadata } from '../core/interfaces/flow/flow-metadata';

@Component({
  selector: 'flogo-flow-params-schema',
  templateUrl: 'params-schema.component.html',
  styleUrls: ['params-schema.component.less'],
})
export class ParamsSchemaComponent implements OnInit {
  paramsForm: FormGroup;
  metadata: FlowMetadata;
  selectTypes: ValueType[] = [];
  displayInputParams: boolean;
  data: { action: string; metadata: FlowMetadata };
  constructor(
    private resourceInterfaceBuilderService: ResourceInterfaceBuilderService,
    public control: ModalControl<FlowMetadata>
  ) {
    this.selectTypes = Array.from(ValueType.allTypes);
    this.metadata = this.control.data;
  }

  ngOnInit() {
    this.configureForm();
  }

  showOutputParams() {
    this.displayInputParams = false;
  }

  showInputParams() {
    this.displayInputParams = true;
  }

  cancelInputSchemaModel() {
    this.data = { action: 'cancel', metadata: null };
    this.closeInputSchemaModel(this.data);
  }

  closeInputSchemaModel(data) {
    this.displayInputParams = false;
    this.control.close(data);
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.resourceInterfaceBuilderService.createParamFormRow();
    control.push(paramControl);
  }

  saveParams() {
    const mapParamsToFlow = params =>
      params
        // filter out empty attributes
        .filter(param => param.name && param.name.trim().length > 0)
        .map(param => ({
          name: param.name.trim(),
          type: param.type || ValueType.String,
        }));

    const updatedParams = this.paramsForm.value;
    const input = mapParamsToFlow(updatedParams.input);
    const output = mapParamsToFlow(updatedParams.output);
    this.data = { action: 'save', metadata: { input, output } };
    this.closeInputSchemaModel(this.data);
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    control.removeAt(index);
  }
  private configureForm() {
    this.displayInputParams = true;
    this.paramsForm = this.resourceInterfaceBuilderService.createForm(
      this.metadata.input,
      this.metadata.output
    );
  }
}
