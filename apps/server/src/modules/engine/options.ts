type BuildType = 'test' | 'build';

export const TYPE_TEST: BuildType = 'test';
export const TYPE_BUILD: BuildType = 'build';

export type Options = Record<string, any>;

export interface CliOptions {
  /**
   * Embed application config into executable. Default false.
   */
  embedConfig?: boolean;
  /**
   * Specify a flogo.json to build
   */
  file?: string;
  /**
   * Optimize for embedded flows. Default false.
   */
  optimize?: boolean;
  /**
   * Build the app as shim, pass trigger id as value.
   * Will map to 'shim' flag of flogo cli
   */
  shimTriggerId?: string;
  /**
   * Build the app with sync option. defaults to false
   */
  syncImports?: boolean;
}

export type BuildOptions = CliOptions & {
  type?: BuildType;
  /**
   * where to place the generated build. Due to current limitations it will be copied to specified destination
   */
  target?: string;
  /**
   * If should also make a copy of the generated flogo.json.
   */
  copyFlogoDescriptor?: boolean;
  compile?: {
    /**
     * Target operating system.
     * default value false.
     * Falsy value will fallback to engine host's default os.
     */
    os?: string | false;
    /**
     * Target compilation architechture. Default value false.
     * Falsy value will fallback to engine host's default arch.
     */
    arch?: string | false;
  };
};
