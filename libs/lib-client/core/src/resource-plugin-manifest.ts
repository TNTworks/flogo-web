import { LoadChildren } from '@angular/router';

export interface ResourcePluginManifest {
  type: string;
  /**
   * It should be the same as the type.
   * Need to repeat it is a current technical limitation due the way the bundling and loading works
   */
  path: string;
  /**
   * Needs to match @angular/router Route.loadChildren to enable bundling
   * Example:
   */
  loadChildren: LoadChildren;
  /**
   * Label/title to be displayed in the UI for this type of resources.
   */
  label: string;
  /**
   * Any valid css color, will be used to identify this type of resource.
   * Examples:
   * '#96a7f8'
   * 'rgba(150, 167, 248, 1)'
   */
  color: string;
}
