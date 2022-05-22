const expectedApp = {
  id: expect.any(String),
  name: 'RestApp',
  type: 'flogo:app',
  version: '0.0.1',
  description: 'My rest app',
  properties: [],
  createdAt: expect.any(String),
  updatedAt: null,
};

const expectedTrigger = {
  id: expect.any(String),
  ref: 'some_path_to_repo/trigger/rest',
  name: 'Receive HTTP Message',
  description: 'Simple REST Trigger',
  createdAt: expect.any(String),
  updatedAt: null,
  settings: {
    port: '9094',
  },
  handlers: [
    expect.objectContaining({
      resourceId: expect.any(String),
      settings: {
        method: 'GET',
        path: '/status/:id',
        autoIdReply: null,
        useReplyHandler: 'true',
      },
      actionMappings: {
        input: {
          id: '=$.params.id',
        },
        output: {
          code: '=$.code',
          data: '=$.status',
        },
      },
    }),
  ],
};

const expectedResource = {
  id: expect.any(String),
  name: 'GetStatus',
  description: '',
  type: 'flow',
  createdAt: expect.any(String),
  updatedAt: null,
  metadata: expect.objectContaining({
    input: [
      {
        name: 'id',
        type: 'string',
      },
    ],
    output: [
      {
        name: 'status',
        type: 'object',
      },
      {
        name: 'code',
        type: 'integer',
      },
    ],
  }),
  data: expect.any(Object),
};

export function assertCorrectImportedApp(imported) {
  expect(imported).toMatchObject(expectedApp);

  expect(imported && imported.triggers).toHaveLength(1);
  expect(imported.triggers[0]).toMatchObject(expectedTrigger);

  expect(imported && imported.resources).toHaveLength(1);
  expect(imported.resources[0]).toMatchObject(expectedResource);
}
