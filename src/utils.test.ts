import { difference, getValue, mapValues, noDifference, setValue } from './utils';

describe('getValue', () => {
  it('gets nested values as expected', () => {
    expect(
      getValue(
        {
          a: 'a',
          b: {
            aa: 'aa',
            bb: 'bb',
            cc: {
              aaa: 'aaa',
              bbb: 'bbb',
            },
          },
        },
        ['b', 'cc', 'bbb']
      )
    ).toBe('bbb');
  });

  it('returns undefined for unmappable paths', () => {
    expect(getValue({ one: 'one', two: 'two' }, ['three'])).toBe(undefined);
  });

  it('handles numbers as array', () => {
    expect(getValue({ a: { b: [{ name: 'A' }, { name: 'B' }] } }, ['a', 'b', 0, 'name'])).toBe('A');
  });
});

describe('setValue', () => {
  it('sets nested objects as expected', () => {
    const obj = {};

    setValue(obj, ['a', 'b', 'c'], 'hello world');

    expect(obj).toMatchObject({
      a: {
        b: {
          c: 'hello world',
        },
      },
    });
  });

  it('create an array at number path items', () => {
    const obj = {};

    setValue(obj, ['arr', 0, 'name'], 'Joey Joe Joe Jr.');

    expect(obj).toMatchObject({
      arr: [{ name: 'Joey Joe Joe Jr.' }],
    });
  });

  it('handles numbers as indices on preexisting arrays', () => {
    const obj = { arr: [{ name: 'Bart' }, { name: 'Homer' }] };

    setValue(obj, ['arr', 0, 'name'], 'Marge');

    expect(obj).toMatchObject({
      arr: [
        {
          name: 'Marge',
        },
        {
          name: 'Homer',
        },
      ],
    });
  });
});

describe('mapValues', function() {
  const array = [1, 2],
    object = { a: 1, b: 2 };

  it('should map values in `object` to a new object', () => {
    expect(mapValues(object, String)).toMatchObject({ a: '1', b: '2' });
  });

  it('should treat arrays like objects', () => {
    expect(mapValues(array, String)).toMatchObject({ '0': '1', '1': '2' });
  });
});

describe('difference', () => {
  it('returns array of differing primary items', () => {
    expect(difference([1, 2, 3], [2, 3, 4])).toStrictEqual([1]);
  });

  it('returns no difference when all items match', () => {
    expect(difference([1], [1])).toStrictEqual([]);
  });

  it('returns no difference when no items in either', () => {
    expect(difference([], [])).toStrictEqual([]);
  });

  it('handles string', () => {
    expect(difference(['one', 'two', 'three'], ['two'])).toStrictEqual(['one', 'three']);
  });

  it('handles boolean', () => {
    expect(difference([true, false], [true])).toStrictEqual([false]);
  });
});

describe('noDifference', () => {
  it('returns `true` when all primary array items exist in secondary', () => {
    expect(noDifference([1, 2, 3], [2, 3, 4, 5, 1])).toBe(true);
  });

  it('returns `false` when all primary array items are not contained in secondary', () => {
    expect(noDifference([1, 2, 3], [2, 3, 4])).toBe(false);
  });
});
