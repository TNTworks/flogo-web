import { IReferenceCollector, MemberAccess } from './validator';

export class ReferenceCollector implements IReferenceCollector {
  functions = [];
  memberAccess = [];

  constructor(public replaceRelativePathsWith?: string) {}

  addFunctionReference(func: MemberAccess[]) {
    this.functions.push(this.processPath(func));
  }

  addMemberReference(member: MemberAccess[]) {
    this.memberAccess.push(this.processPath(member));
  }

  getFunctionReferences() {
    return this.functions;
  }

  getMemberReferences() {
    return this.memberAccess;
  }

  private processPath(parts: MemberAccess[]) {
    if (this.replaceRelativePathsWith && parts[0].name === '$') {
      parts = [...parts];
      parts[0] = <MemberAccess>{ name: this.replaceRelativePathsWith };
    }

    return parts
      .filter(p => p.type !== 'accessor')
      .map(p => p.name)
      .join('.');
  }
}
