import { Injectable } from '@angular/core';

export const TYPE_PARAM_FUNCTION = 'mapper-param-function';
export const TYPE_PARAM_OUTPUT = 'mapper-param-output';

@Injectable()
export class DraggingService {
  type: string;
  data: any;

  dragStart(type: string, data: any) {
    this.type = type;
    this.data = data;
  }

  dragEnd() {
    this.type = null;
    this.data = null;
  }

  accepts(type: string) {
    return this.type === type;
  }

  getType() {
    return this.type;
  }

  getData() {
    return this.data;
  }
}
