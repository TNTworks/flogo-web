export enum ProcessStatus {
  New = 'new',
  Running = 'running',
  Paused = 'paused',
  Closed = 'closed',
  Errored = 'errored',
}

export enum InputMappingType {
  SeparateByColumn = 'separate-by-column',
  SingleInput = 'single-input',
  Custom = 'custom',
}

export interface ResourceConfig {
  simulation?: SimulationConfig;
}

export interface SimulationConfig {
  inputMappingType?: InputMappingType;
}
