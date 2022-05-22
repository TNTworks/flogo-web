import { FormGroup } from '@angular/forms';
import { MapperController } from '@flogo-web/lib-client/mapper';

export interface SaveParams {
  settings: FormGroup;
  streamInputMapper: MapperController;
  replyMapper?: MapperController;
}
