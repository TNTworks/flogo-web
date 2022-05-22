import { ImportsRefAgent } from '@flogo-web/lib-server/core';
import { LegacyRefsDecorator } from './legacy-refs-decorator';
import { ContributionType } from '@flogo-web/core';

describe('LegacyRefsDecorator', () => {
  const mockRefs = new Map<string, string>([
    ['#log', 'dummy_ref_to_contrib/log'],
    ['#oldReturn', 'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn'],
    ['#newReturn', 'github.com/TNTworks/flogo-contrib/activity/actreturn'],
  ]);

  const mockAgent: ImportsRefAgent = {
    getPackageRef: (type, ref) => mockRefs.get(ref) || ref,
  };
  let refsDecorator: LegacyRefsDecorator;

  beforeEach(() => {
    refsDecorator = new LegacyRefsDecorator(mockAgent);
  });

  it('Should return the full reference as it is', () => {
    expect(
      refsDecorator.getPackageRef(ContributionType.Activity, 'dummy_contrib_path/contrib')
    ).toEqual('dummy_contrib_path/contrib');
  });

  it('Should return the alias with its reference', () => {
    expect(refsDecorator.getPackageRef(ContributionType.Activity, '#log')).toEqual(
      'dummy_ref_to_contrib/log'
    );
    expect(refsDecorator.getPackageRef(ContributionType.Activity, '#newReturn')).toEqual(
      'github.com/TNTworks/flogo-contrib/activity/actreturn'
    );
  });

  it('Should return the old special contrib with its new reference', () => {
    expect(refsDecorator.getPackageRef(ContributionType.Activity, '#oldReturn')).toEqual(
      'github.com/TNTworks/flogo-contrib/activity/actreturn'
    );
    expect(
      refsDecorator.getPackageRef(
        ContributionType.Activity,
        'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn'
      )
    ).toEqual('github.com/TNTworks/flogo-contrib/activity/actreturn');
  });
});
