import { RefAgent } from './ref-agent';
import { FunctionRefFinder } from './function-ref-finder';
import { ContributionType } from '@flogo-web/core';
import { ParsedImport } from '../../common/parsed-import';

describe('ref agent', () => {
  let refAgent: RefAgent;
  const functionsReverseLookupStub: Partial<FunctionRefFinder> = {
    findPackage(functionName: string) {
      if (functionName === 'used.function') {
        return 'github.com/some-package-with-functions/ref';
      }
    },
  };

  beforeEach(() => {
    refAgent = new RefAgent(functionsReverseLookupStub as FunctionRefFinder);
  });

  test('it returns the type from a ref', () => {
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/TNTworks/flogo-contrib/activity/rest'
      )
    ).toEqual('#rest');
  });

  test('it returns the same type for the same ref', () => {
    const ref = 'github.com/TNTworks/flogo-contrib/activity/rest';
    expect(refAgent.getAliasRef(ContributionType.Activity, ref)).toEqual(
      refAgent.getAliasRef(ContributionType.Activity, ref)
    );
  });

  test('it ensures types are unique', () => {
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/project-flogo/ACTIVITY/rest'
      )
    ).toEqual('#rest');
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/project-flogo/ANOTHER_REPO/rest'
      )
    ).toEqual('#rest_1');
    // repeated on purpose
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/project-flogo/ANOTHER_REPO/rest'
      )
    ).toEqual('#rest_1');
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/project-flogo/SOMETHING_ELSE/rest'
      )
    ).toEqual('#rest_2');
    expect(
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/project-flogo/SOMETHING_ELSE/rest_1'
      )
    ).toEqual('#rest_1_1');
  });

  test('it formats into the flogo.json imports syntax', () => {
    refAgent.getAliasRef(ContributionType.Action, 'github.com/project-flogo/flow');
    refAgent.getAliasRef(
      ContributionType.Activity,
      'github.com/TNTworks/flogo-contrib/activity/rest'
    );
    refAgent.getAliasRef(
      ContributionType.Activity,
      'github.com/different-repo/activity/rest'
    );
    refAgent.getAliasRef(
      ContributionType.Trigger,
      'github.com/TNTworks/flogo-contrib/trigger/rest'
    );
    refAgent.getAliasRef(
      ContributionType.Activity,
      'github.com/TNTworks/flogo-contrib/activity/log'
    );
    refAgent.registerFunctionName('used.function');
    expect(refAgent.formatImports()).toEqual(
      [
        'github.com/TNTworks/flogo-contrib/activity/log',
        'github.com/TNTworks/flogo-contrib/activity/rest',
        'rest_1 github.com/different-repo/activity/rest',
        'github.com/TNTworks/flogo-contrib/trigger/rest',
        'github.com/project-flogo/flow',
        'github.com/some-package-with-functions/ref',
      ].sort()
    );
  });

  describe('with predetermined imports', () => {
    beforeEach(() => {
      refAgent = new RefAgent(
        functionsReverseLookupStub as FunctionRefFinder,
        new Map<ContributionType, ParsedImport[]>().set(ContributionType.Activity, [
          {
            ref: 'github.com/TNTworks/flogo-contrib/activity/rest',
            isAliased: true,
            type: 'myCoolRestAlias',
          },
          {
            ref: 'github.com/TNTworks/flogo-contrib/activity/log',
            isAliased: true,
            type: 'log',
          },
          {
            ref: 'github.com/TNTworks/flogo-contrib/activity/wont-be-used',
            isAliased: false,
            type: 'wont-be-used',
          },
        ])
      );
    });

    test('it should return the corresponding predetermined type when registering a matching ref', () => {
      expect(
        refAgent.getAliasRef(
          ContributionType.Activity,
          'github.com/TNTworks/flogo-contrib/activity/rest'
        )
      ).toEqual('#myCoolRestAlias');
    });

    test('it should consider the predetermined imports when ensuring type uniqueness', () => {
      expect(
        refAgent.getAliasRef(ContributionType.Activity, 'github.com/other-repo/log')
      ).toEqual('#log_1');
    });

    test('it should format only the used the imports', () => {
      refAgent.getAliasRef(
        ContributionType.Trigger,
        'github.com/TNTworks/flogo-contrib/trigger/rest'
      );
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/TNTworks/flogo-contrib/activity/rest'
      );
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/external/repo/with-yet-another/rest'
      );
      refAgent.getAliasRef(
        ContributionType.Activity,
        'github.com/external/repo/cloned/with-yet-another/rest'
      );
      expect(refAgent.formatImports()).toEqual(
        [
          'rest_1 github.com/external/repo/cloned/with-yet-another/rest',
          'github.com/external/repo/with-yet-another/rest',
          'myCoolRestAlias github.com/TNTworks/flogo-contrib/activity/rest',
          'github.com/TNTworks/flogo-contrib/trigger/rest',
        ].sort()
      );
    });
  });
});
