import { Component, HostBinding, Inject } from '@angular/core';
import { Resource } from '@flogo-web/core';
import { ERROR_CODE } from '@flogo-web/lib-client/core';
import { NotificationsService } from '@flogo-web/lib-client/notifications';
import { MODAL_TOKEN, modalAnimate, ModalControl } from '@flogo-web/lib-client/modal';
import { AppDetailService } from '../core';

export interface ExportFlowsData {
  flows: Array<Resource>;
}

@Component({
  selector: 'flogo-export-flow',
  templateUrl: 'export-flows.component.html',
  styleUrls: ['export-flows.component.less'],
  animations: modalAnimate,
})
export class FlogoExportFlowsComponent {
  @HostBinding('@modalAnimate')
  checkedFlows = [];
  checkAllFlows = [];

  constructor(
    @Inject(MODAL_TOKEN) public exportFlowsData: ExportFlowsData,
    public control: ModalControl,
    private appDetailService: AppDetailService,
    private notificationsService: NotificationsService
  ) {
    this.resetForm();
    this.selectAllFlows();
  }

  public selectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
    this.exportFlowsData.flows.forEach((flow, index) => {
      this.checkAllFlows.push(index);
      this.checkedFlows.push(flow.id);
    });
  }

  public unselectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
  }

  public flowSelect(flowId: string, isChecked: boolean, index) {
    if (isChecked) {
      this.checkedFlows.push(flowId);
      this.checkAllFlows.push(index);
    } else {
      const indexOfFlows = this.checkedFlows.indexOf(flowId);
      const indexOfIndices = this.checkAllFlows.indexOf(index);
      this.checkedFlows.splice(indexOfFlows, 1);
      this.checkAllFlows.splice(indexOfIndices, 1);
    }
  }

  public exportFlows() {
    let flowsToExport;
    if (this.checkedFlows.length === this.exportFlowsData.flows.length) {
      flowsToExport = [];
    } else {
      flowsToExport = this.checkedFlows;
    }
    return () =>
      this.appDetailService
        .exportResources(flowsToExport)
        .then(appWithFlows => {
          this.control.close('Flows Exported');
          return [
            {
              fileName: 'flows.json',
              data: appWithFlows,
            },
          ];
        })
        .catch(errRsp => {
          if (
            errRsp &&
            errRsp.errors &&
            errRsp.errors[0] &&
            errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW
          ) {
            this.notificationsService.error({
              key: 'DETAILS-EXPORT:CANNOT-EXPORT',
            });
          } else {
            console.error(errRsp.errors);
            this.notificationsService.error({
              key: 'DETAILS-EXPORT:ERROR_UNKNOWN',
            });
          }
        });
  }

  public closeModal() {
    this.control.close();
  }

  private resetForm() {
    this.unselectAllFlows();
  }
}
