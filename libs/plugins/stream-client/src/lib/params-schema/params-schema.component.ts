import { isEmpty } from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';
import { ResourceInterfaceBuilderService } from '@flogo-web/lib-client/resource-interface-builder';
import { modalAnimate, ModalControl } from '@flogo-web/lib-client/modal';

@Component({
  selector: 'flogo-stream-params-schema',
  templateUrl: 'params-schema.component.html',
  styleUrls: ['params-schema.component.less'],
})
export class ParamsSchemaComponent implements OnInit {
  @ViewChild('modal', { static: true })
  paramsForm: FormGroup;
  metadata: StreamMetadata;
  selectTypes: ValueType[] = [];
  displayInputParams: boolean;
  groupBy: string;
  data: { action: string; metadata: StreamMetadata };
  constructor(
    private resourceInterfaceBuilderService: ResourceInterfaceBuilderService,
    public control: ModalControl<any>
  ) {
    this.selectTypes = Array.from(ValueType.allTypes);
    this.metadata = this.control.data;
  }

  ngOnInit() {
    this.configureForm();
  }

  updateGroupBy(groupBy) {
    this.groupBy = groupBy;
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
    const mapParamsToStream = params =>
      params
        // filter out empty attributes
        .filter(param => param.name && param.name.trim().length > 0)
        .map(param => ({
          name: param.name.trim(),
          type: param.type || ValueType.String,
        }));

    const updatedParams = this.paramsForm.value;
    const input = mapParamsToStream(updatedParams.input);
    const output = mapParamsToStream(updatedParams.output);
    const metadata = this.normalizeMetadata(input, output, this.groupBy);
    this.data = { action: 'save', metadata: metadata };
    this.closeInputSchemaModel(this.data);
  }

  normalizeMetadata(input, output, groupBy) {
    if (isEmpty(input) && isEmpty(output)) {
      return null;
    }
    return { input, output, groupBy };
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const removeParam =
      control.controls[index].value && control.controls[index].value.name;
    if (fromParams === 'input' && removeParam === this.groupBy) {
      this.updateGroupBy(null);
    }
    control.removeAt(index);
  }

  private configureForm() {
    this.displayInputParams = true;
    const metadata = isEmpty(this.metadata)
      ? {
          input: [],
          output: [],
        }
      : this.metadata;
    this.paramsForm = this.resourceInterfaceBuilderService.createForm(
      metadata.input,
      metadata.output
    );

    if (this.metadata && this.metadata.groupBy) {
      this.updateGroupBy(this.metadata.groupBy);
    }
  }
}
