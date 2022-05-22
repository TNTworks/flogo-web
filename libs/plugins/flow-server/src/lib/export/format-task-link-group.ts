import { isEmpty } from 'lodash';
import { FlowData, FlowResourceModel } from '@flogo-web/plugins/flow-core';
import { ResourceExportContext } from '@flogo-web/lib-server/core';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export interface TaskLinkGroup {
  tasks?: FlowResourceModel.Task[];
  links?: FlowResourceModel.Link[];
}

export function formatTaskLinkGroups(
  flow: Partial<FlowData>,
  context: ResourceExportContext
): { root: TaskLinkGroup; error: TaskLinkGroup } {
  const rootTask = {
    tasks: flow.tasks,
    links: flow.links,
  };
  const errorHandler = flow.errorHandler || {};
  return {
    root: formatGroup(context, rootTask),
    error: formatGroup(context, errorHandler),
  };
}

function formatGroup(
  { contributions, resourceIdReconciler, refAgent }: ResourceExportContext,
  { tasks, links }: { tasks?; links? }
) {
  const group: { tasks?: any[]; links?: any[] } = {};
  const formattedTasks = formatTasks(
    tasks,
    contributions,
    resourceIdReconciler,
    refAgent
  );
  if (!isEmpty(formattedTasks)) {
    group.tasks = formattedTasks;
  }
  const formattedLinks = formatLinks(links, refAgent);
  if (!isEmpty(formattedLinks)) {
    group.links = formattedLinks;
  }
  return group;
}
