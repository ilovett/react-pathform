import { equals, getValue, mapValues, setValue } from './utils';

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

describe('equals', () => {
  it('returns `true` when the arrays have matching primitive values', () => {
    expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(equals([true, true, false], [true, true, false])).toBe(true);
    expect(equals(['one', 'two', 'three'], ['one', 'two', 'three'])).toBe(true);
  });

  it('returns `false` when the arrays have mismatching primitive values', () => {
    expect(equals([1, 2, 3], [1])).toBe(false);
    expect(equals([1, 2, 3], [1, 2, 3, 4])).toBe(false);
    expect(equals([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(equals([true], [false])).toBe(false);
  });
});
