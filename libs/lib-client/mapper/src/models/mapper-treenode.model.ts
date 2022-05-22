/**
 * Created by szuniga on 5/4/17.
 */
import { TreeNode } from 'primeng/components/common/api';
import { MapperTreeNodeType } from '@flogo-web/lib-client/mapper-icons';

export interface HintOption {
  label: string;
  value: any;
}

export interface MapperTreeNode extends TreeNode, MapperTreeNodeType {
  path?: string;
  snippet?: string;
  level?: number;
  hintOptions?: Array<HintOption>;
  isVisible?: boolean;
  isInvalid?: boolean;
  isSelectable?: boolean;
  isRequired?: boolean;
  isDirty?: boolean;
}
