export interface IconProvider {
  getIconUrlById(taskId: string): string | null;
}
