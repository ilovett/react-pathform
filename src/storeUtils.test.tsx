import {
  createStore,
  createStoreItemObject,
  createStoreItemArray,
  createStoreItemPrimitive,
  toStorePath,
  parseStoreItemObject,
  parseStoreItemArray,
  parseStoreItemPrimitive,
  fromDotPath,
  flattenStore,
  set,
  createStoreItem,
} from './storeUtils';

const createMetaHelper = (uuid: string, defaultValue: any) => {
  return {
    uuid,
    dirty: false,
    touched: false,
    error: null,
    validations: null,
    defaultValue,
  };
};

describe('set', () => {
  it('doesnt validate parent paths unless explicitly defined', () => {
    const fakeStore = {};
    const storeItem = createStoreItem('Hello World');

    set(fakeStore, ['rootItem', 'value', 'parentObject', 'value', 'primitiveLeaf', 'value'], storeItem);

    // note that `type` and `meta` are missing on parent items
    expect(fakeStore).toMatchInlineSnapshot(`
      Object {
        "rootItem": Object {
          "value": Object {
            "parentObject": Object {
              "value": Object {
                "primitiveLeaf": Object {
                  "value": Object {
                    "meta": Object {
                      "defaultValue": "Hello World",
                      "dirty": false,
                      "error": null,
                      "touched": false,
                      "uuid": "uuid-1",
                      "validations": null,
                    },
                    "type": "primitive",
                    "value": "Hello World",
                  },
                },
              },
            },
          },
        },
      }
    `);
  });

  it('validates parent paths when setting deep leaf nodes', () => {
    const fakeStore = {};
    const storeItem = createStoreItem('Hello World');

    set(fakeStore, ['rootItem', 'value', 'parentObject', 'value', 'primitiveLeaf', 'value'], storeItem, { validateParentPath: true });

    // expect that rootItem, parentObject have type/meta assigned
    expect(fakeStore).toMatchInlineSnapshot(`
      Object {
        "rootItem": Object {
          "value": Object {
            "meta": Object {
              "defaultValue": undefined,
              "dirty": false,
              "error": null,
              "touched": false,
              "uuid": "uuid-3",
              "validations": null,
            },
            "parentObject": Object {
              "value": Object {
                "meta": Object {
                  "defaultValue": undefined,
                  "dirty": false,
                  "error": null,
                  "touched": false,
                  "uuid": "uuid-2",
                  "validations": null,
                },
                "primitiveLeaf": Object {
                  "value": Object {
                    "meta": Object {
                      "defaultValue": "Hello World",
                      "dirty": false,
                      "error": null,
                      "touched": false,
                      "uuid": "uuid-1",
                      "validations": null,
                    },
                    "type": "primitive",
                    "value": "Hello World",
                  },
                },
                "type": "primitive",
              },
            },
            "type": "primitive",
          },
        },
      }
    `);
  });
});

describe('toStorePath', () => {
  it('works as expected', () => {
    expect(toStorePath(['set'])).toEqual(['set']);
    expect(toStorePath(['set', 0])).toEqual(['set', 'value', 0]);
    expect(toStorePath(['set', 0, 'obj'])).toEqual(['set', 'value', 0, 'value', 'obj']);
    expect(toStorePath(['set', 0, 'obj', 'name'])).toEqual(['set', 'value', 0, 'value', 'obj', 'value', 'name']);

    // string integers `'0'` converted to object paths
    // prettier-ignore
    expect(toStorePath(['set', '0', 'obj', 'name'])).toEqual(['set', 'value', '0', 'value', 'obj', 'value', 'name']);
  });
});

describe('fromDotPath', () => {
  it('parses dotpath as expected', () => {
    expect(fromDotPath('items[0].nested.name')).toEqual(['items', 0, 'nested', 'name']);

    // parenthesis `[#]` imply array
    expect(fromDotPath('items[100].nested.name')).toEqual(['items', 100, 'nested', 'name']);

    // dots `.#.` imply object
    expect(fromDotPath('items.100.nested.name')).toEqual(['items', '100', 'nested', 'name']);
  });
});

describe('createStoreItemPrimitive', () => {
  it('works as expected', () => {
    expect(createStoreItemPrimitive('Hello World!')).toMatchObject({
      type: 'primitive',
      meta: {
        uuid: 'uuid-1',
        dirty: false,
        touched: false,
        error: null,
      },
      value: 'Hello World!',
    });
  });
});

describe('createStoreItemObject', () => {
  it('works as expected', () => {
    expect(
      createStoreItemObject({
        one: 1,
        two: 2,
      })
    ).toMatchObject({
      type: 'object',
      meta: {
        uuid: 'uuid-1',
        dirty: false,
        touched: false,
        error: null,
      },
      value: {
        one: {
          type: 'primitive',
          meta: {
            uuid: 'uuid-2',
            dirty: false,
            touched: false,
            error: null,
          },
          value: 1,
        },
        two: {
          type: 'primitive',
          meta: {
            uuid: 'uuid-3',
            dirty: false,
            touched: false,
            error: null,
          },
          value: 2,
        },
      },
    });
  });
});

describe('createStoreItemArray', () => {
  it('works as expected', () => {
    expect(createStoreItemArray([1, 2, 3])).toMatchInlineSnapshot(`
      Object {
        "meta": Object {
          "defaultFieldUuids": Array [
            "uuid-1",
            "uuid-2",
            "uuid-3",
          ],
          "defaultValue": Array [
            1,
            2,
            3,
          ],
          "dirty": false,
          "error": null,
          "touched": false,
          "uuid": "uuid-4",
          "validations": null,
        },
        "type": "array",
        "value": Array [
          Object {
            "meta": Object {
              "defaultValue": 1,
              "dirty": false,
              "error": null,
              "touched": false,
              "uuid": "uuid-1",
              "validations": null,
            },
            "type": "primitive",
            "value": 1,
          },
          Object {
            "meta": Object {
              "defaultValue": 2,
              "dirty": false,
              "error": null,
              "touched": false,
              "uuid": "uuid-2",
              "validations": null,
            },
            "type": "primitive",
            "value": 2,
          },
          Object {
            "meta": Object {
              "defaultValue": 3,
              "dirty": false,
              "error": null,
              "touched": false,
              "uuid": "uuid-3",
              "validations": null,
            },
            "type": "primitive",
            "value": 3,
          },
        ],
      }
    `);
  });
});

describe('createStore', () => {
  it('works as expected', () => {
    expect(
      createStore({
        name: 'Special Orders TODO',
        items: [1, 2],
      })
    ).toMatchObject({
      name: {
        type: 'primitive',
        meta: createMetaHelper('uuid-1', 'Special Orders TODO'),
        value: 'Special Orders TODO',
      },
      items: {
        type: 'array',
        meta: { ...createMetaHelper('uuid-4', [1, 2]), defaultFieldUuids: ['uuid-2', 'uuid-3'] },
        value: [
          {
            type: 'primitive',
            meta: createMetaHelper('uuid-2', 1),
            value: 1,
          },
          {
            type: 'primitive',
            meta: createMetaHelper('uuid-3', 2),
            value: 2,
          },
        ],
      },
    });
  });
});

describe('parseStoreItemPrimitive', () => {
  it('works as expected', () => {
    expect(
      parseStoreItemPrimitive({
        type: 'primitive',
        meta: createMetaHelper('string-example', 'Hello World!'),
        value: 'Hello World!',
      })
    ).toBe('Hello World!');

    expect(
      parseStoreItemPrimitive({
        type: 'primitive',
        meta: createMetaHelper('boolean-example', false),
        value: false,
      })
    ).toBe(false);

    expect(
      parseStoreItemPrimitive({
        type: 'primitive',
        meta: createMetaHelper('number-example', 420.69),
        value: 420.69, // $GME
      })
    ).toBe(420.69);
  });
});

describe('parseStoreItemObject', () => {
  it('works as expected', () => {
    expect(
      parseStoreItemObject({
        type: 'object',
        meta: {
          uuid: 'uuid-1',
          dirty: false,
          touched: false,
          error: null,
          validations: null,
          defaultValue: {
            one: 1,
            two: 2,
            arrayExample: ['hello world', false],
          },
        },
        value: {
          one: {
            type: 'primitive',
            meta: {
              uuid: 'uuid-2',
              dirty: false,
              touched: false,
              error: null,
              validations: null,
              defaultValue: 1,
            },
            value: 1,
          },
          two: {
            type: 'primitive',
            meta: {
              uuid: 'uuid-3',
              dirty: false,
              touched: false,
              error: null,
              validations: null,
              defaultValue: 2,
            },
            value: 2,
          },
          arrayExample: {
            type: 'array',
            meta: { ...createMetaHelper('uuid-4', ['hello world', false]), defaultFieldUuids: ['uuid-5', 'uuid-6'] },
            value: [
              {
                type: 'primitive',
                meta: createMetaHelper('uuid-5', 'hello world'),
                value: 'hello world',
              },
              {
                type: 'primitive',
                meta: createMetaHelper('uuid-6', false),
                value: false,
              },
            ],
          },
        },
      })
    ).toMatchObject({
      one: 1,
      two: 2,
      arrayExample: ['hello world', false],
    });
  });
});

describe('parseStoreItemArray', () => {
  it('works as expected', () => {
    expect(
      parseStoreItemArray({
        type: 'array',
        meta: {
          uuid: 'uuid-1',
          dirty: false,
          touched: false,
          error: null,
          validations: null,
          defaultValue: [1, 2, 3],
          defaultFieldUuids: ['uuid-2', 'uuid-3', 'uuid-4'],
        },
        value: [
          {
            type: 'primitive',
            meta: {
              uuid: 'uuid-2',
              dirty: false,
              touched: false,
              error: null,
              validations: null,
              defaultValue: 1,
            },
            value: 1,
          },
          {
            type: 'primitive',
            meta: {
              uuid: 'uuid-3',
              dirty: false,
              touched: false,
              error: null,
              validations: null,
              defaultValue: 2,
            },
            value: 2,
          },
          {
            type: 'primitive',
            meta: {
              uuid: 'uuid-4',
              dirty: false,
              touched: false,
              error: null,
              validations: null,
              defaultValue: 3,
            },
            value: 3,
          },
        ],
      })
    ).toMatchObject([1, 2, 3]);
  });
});

describe('flattenStore', () => {
  it('works as expected', () => {
    expect(
      flattenStore({
        items: {
          type: 'array',
          meta: {
            uuid: 'uuid-1',
            dirty: false,
            touched: false,
            error: null,
            validations: null,
            defaultValue: [1, 2, 3],
            defaultFieldUuids: ['uuid-2', 'uuid-3', 'uuid-4'],
          },
          value: [
            {
              type: 'primitive',
              meta: {
                uuid: 'uuid-2',
                dirty: false,
                touched: false,
                error: null,
                validations: null,
                defaultValue: 1,
              },
              value: 1,
            },
            {
              type: 'primitive',
              meta: {
                uuid: 'uuid-3',
                dirty: false,
                touched: false,
                error: null,
                validations: null,
                defaultValue: 2,
              },
              value: 2,
            },
            {
              type: 'primitive',
              meta: {
                uuid: 'uuid-4',
                dirty: false,
                touched: false,
                error: null,
                validations: null,
                defaultValue: 3,
              },
              value: 3,
            },
          ],
        },
      })
    ).toMatchObject([
      { dotpath: 'items', path: ['items'], storeItem: { meta: { uuid: 'uuid-1' } } },
      { dotpath: 'items[0]', path: ['items', 0], storeItem: { meta: { uuid: 'uuid-2' }, value: 1 } },
      { dotpath: 'items[1]', path: ['items', 1], storeItem: { meta: { uuid: 'uuid-3' }, value: 2 } },
      { dotpath: 'items[2]', path: ['items', 2], storeItem: { meta: { uuid: 'uuid-4' }, value: 3 } },
    ]);
  });
});
