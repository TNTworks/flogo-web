import { Context } from 'koa';
import { FlowExporter } from '../../../../modules/transfer/export/flow-exporter';

export function findAndExportFlow(flowExporter: FlowExporter) {
  return async (context: Context, next) => {
    const { data } = await flowExporter.export(context.request.body.actionId);
    context.state.flow = transformToProcess(data);
    return next();
  };
}

function transformToProcess(data) {
  const { name, description, metadata } = data;
  return {
    ...data,
    name: name,
    description: description || '',
    metadata: metadata || { input: [], output: [] },
  };
}
