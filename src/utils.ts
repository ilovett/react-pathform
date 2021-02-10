import lodashSet from 'lodash/set';
import lodashGet from 'lodash/get';
import lodashMapValues from 'lodash/mapValues';
import { v4 as uuidv4 } from 'uuid';
import { ObjectIterator } from 'lodash';

import { PathFormPath } from './usePathForm';

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
