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
} from './usePathForm';

let mockUuidCounter = 1;
let mockUuid = jest.fn().mockImplementation(() => {
  return `uuid-${mockUuidCounter++}`;
});

jest.mock('uuid', () => ({
  v4: () => mockUuid(),
}));

const createMetaHelper = (uuid: string) => {
  return {
    uuid,
    dirty: false,
    touched: false,
    error: null,
  };
};

beforeEach(() => {
  mockUuidCounter = 1;
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
    expect(createStoreItemArray([1, 2, 3])).toMatchObject({
      type: 'array',
      meta: {
        uuid: 'uuid-1',
        dirty: false,
        touched: false,
        error: null,
      },
      value: [
        {
          type: 'primitive',
          meta: {
            uuid: 'uuid-2',
            dirty: false,
            touched: false,
            error: null,
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
          },
          value: 3,
        },
      ],
    });
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
        meta: createMetaHelper('uuid-1'),
        value: 'Special Orders TODO',
      },
      items: {
        type: 'array',
        meta: createMetaHelper('uuid-2'),
        value: [
          {
            type: 'primitive',
            meta: createMetaHelper('uuid-3'),
            value: 1,
          },
          {
            type: 'primitive',
            meta: createMetaHelper('uuid-4'),
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
        meta: createMetaHelper('string-example'),
        value: 'Hello World!',
      })
    ).toBe('Hello World!');

    expect(
      parseStoreItemPrimitive({
        type: 'primitive',
        meta: createMetaHelper('boolean-example'),
        value: false,
      })
    ).toBe(false);

    expect(
      parseStoreItemPrimitive({
        type: 'primitive',
        meta: createMetaHelper('number-example'),
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
          arrayExample: {
            type: 'array',
            meta: createMetaHelper('uuid-4'),
            value: [
              {
                type: 'primitive',
                meta: createMetaHelper('uuid-5'),
                value: 'hello world',
              },
              {
                type: 'primitive',
                meta: createMetaHelper('uuid-6'),
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
        },
        value: [
          {
            type: 'primitive',
            meta: {
              uuid: 'uuid-2',
              dirty: false,
              touched: false,
              error: null,
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
            },
            value: 3,
          },
        ],
      })
    ).toMatchObject([1, 2, 3]);
  });
});
