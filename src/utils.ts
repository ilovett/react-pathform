import { PathFormPath, PathFormValuePrimitive } from '.';

export function mapValues(obj: Record<string, any>, iteratee?: (item: any, key: string | number) => any) {
  if (!obj) {
    return {};
  }

  return Object.entries(obj).reduce((newObj, [key, what]) => {
    newObj[key] = iteratee?.(obj[key], key);
    return newObj;
  }, {} as Record<string, any>);
}

export function getValue(obj: Record<string | number, any>, path: PathFormPath, defaultValue?: any) {
  const result = path.reduce((prevObj, key) => {
    return prevObj?.[key];
  }, obj);

  return typeof result === 'undefined' ? defaultValue : result;
}

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @param {Object} object The object to modify.
 * @param {PathFormPath} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }] }
 *
 * set({}, ['items', 0, 'name'], 'Joey Joe Joe Jr.')
 */
export function setValue(obj: Record<string | number, any>, path: PathFormPath, value: any) {
  const length = path.length;
  const lastIndex = length - 1;
  let index = -1;
  let nested = obj;

  while (nested != null && ++index < length) {
    const key = path[index];
    let newValue = value;

    // determine new value if we are not at the leaf path
    if (index !== lastIndex) {
      const existing = nested[key];

      // if path item doesnt exist
      // create new value (object or array) based on nested path index type
      if (typeof existing === 'undefined') {
        newValue = typeof path[index + 1] === 'number' ? [] : {};
      } else {
        newValue = existing;
      }
    }

    // assign the new value
    nested[key] = newValue;

    // lets go deeper
    nested = nested[key];
  }

  return obj;
}

/**
 * Returns `true` if two arrays have the equal primitive values in the same order.
 * Otherwise, returns `false`.
 *
 *
 * @example
 * equals([1, 2, 3], [1, 2, 3]); // true
 * equals([1, 2], [2, 1]); // false
 */
export function equals(arrA: Array<PathFormValuePrimitive>, arrB: Array<PathFormValuePrimitive>) {
  if (arrA?.length !== arrB?.length) {
    return false;
  }

  for (let i in arrA) {
    const a = arrA[i];
    const b = arrB[i];

    if (a !== b) {
      return false;
    }
  }

  return true;
}
