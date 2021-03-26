import lodashSet from 'lodash/set';
import lodashGet from 'lodash/get';
import lodashMapValues from 'lodash/mapValues';
import { v4 as uuidv4 } from 'uuid';
import { ObjectIterator } from 'lodash';

import { PathFormPath, PathFormValueType } from './usePathForm';

// tree shakeable wrappers
export const get = (obj: object, path: PathFormPath, defaultValue?: any) => {
  return lodashGet(obj, path, defaultValue);
};

export const set = (obj: object, path: PathFormPath, value: any) => {
  return lodashSet(obj, path, value);
};

export const mapValues = <T>(obj: object, callback: ObjectIterator<object, T>): any => {
  return lodashMapValues(obj, callback);
};

export const uuid = () => {
  return uuidv4();
};

/**
 * Sugar function for returning the value type.
 * Since an array is an object, checks if array first,
 * then object, otherwise its a primitive value.
 *
 * @param value Any value in the store, object, array, or primitive.
 * @returns PathFormValueType
 */
export const typeOf = (value: any): PathFormValueType => {
  if (Array.isArray(value)) {
    return 'array';
  } else if (Object(value) === value) {
    return 'object';
  } else {
    return 'primitive';
  }
};

/**
 * Sugar function for comparing two values.
 *
 * @param a Any unknown value (object, array, primitive).
 * @param b Any unknown value (object, array, primitive).
 * @returns Returns `true` if the object types match, otherwise `false`.
 */
export const typesMatch = (a: any, b: any) => {
  return typeOf(a) === typeOf(b);
};
