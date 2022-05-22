import { MemberAccess } from './member-access';

export interface IReferenceCollector {
  addFunctionReference(func: MemberAccess[]): void;

  addMemberReference(member: MemberAccess[]): void;

  getFunctionReferences(): string[];

  getMemberReferences(): string[];
}
