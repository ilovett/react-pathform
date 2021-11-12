import React from 'react';
import { PathFormArrayUtils, PathFormPath, PathFormStoreMeta, toStorePath, usePathForm, usePathFormValue } from '.';
import { createStoreItem, get, set } from './storeUtils';

export type PathFormArrayItemProps = {
  arrayPath: PathFormPath;
  arrayUtils: PathFormArrayUtils;
  itemPath: PathFormPath;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  totalRows: number;
  meta: PathFormStoreMeta;
};

export type PathFormArrayEmptyProps = {
  arrayPath: PathFormPath;
  arrayUtils: PathFormArrayUtils;
  meta: PathFormStoreMeta;
};

export interface PathFormArrayWrapperItemProps {
  itemProps: PathFormArrayItemProps;
  renderItem: (props: PathFormArrayItemProps) => React.ReactElement;
}

export interface PathFormArrayWrapperEmptyProps {
  emptyProps: PathFormArrayEmptyProps;
  renderEmpty: (props: PathFormArrayEmptyProps) => React.ReactElement;
}

export interface PathFormArrayProps {
  path: PathFormPath;
  defaultValue: any;
  renderItem: (props: PathFormArrayItemProps) => React.ReactElement;
  renderEmpty?: (props: PathFormArrayEmptyProps) => React.ReactElement;
}

export const PathFormArray: React.FC<PathFormArrayProps> = ({ path, renderItem, renderEmpty, defaultValue }) => {
  const { state, array } = usePathForm();
  const [rows, meta] = usePathFormValue(path, defaultValue);
  const arrayPath = path;

  return rows?.length ? (
    rows.map((row: any, index: number) => {
      const isLast = index + 1 === rows.length;
      const isFirst = index === 0;
      const totalRows = rows.length;
      const itemPath = [...arrayPath, index];

      let storeItem = get(state.current.store, toStorePath(itemPath));

      // create and set the storeItem if not exists, this is probably first render
      if (!storeItem) {
        storeItem = createStoreItem(row);

        // since we are setting store items on array child indices, we need to verify that the parent array store item is valid
        // so we will validate the parent path only on the first child index, and assume it is valid after that
        set(state.current.store, toStorePath(itemPath), storeItem, { validateParentPath: isFirst });
      }

      const { meta } = storeItem;

      return (
        // TODO reason not to just `renderItem(...)` ? cuz it returns an element ? memo in the future ?
        <PathFormArrayWrapperItem
          key={meta?.key || index}
          renderItem={renderItem}
          itemProps={{
            arrayPath,
            arrayUtils: array,
            itemPath,
            index,
            isLast,
            isFirst,
            totalRows,
            meta,
          }}
        />
      );
    })
  ) : renderEmpty ? (
    <PathFormArrayWrapperEmpty key={meta.uuid} renderEmpty={renderEmpty} emptyProps={{ arrayPath, arrayUtils: array, meta }} />
  ) : null;
};

const PathFormArrayWrapperItem: React.FC<PathFormArrayWrapperItemProps> = ({ renderItem, itemProps }) => {
  return renderItem(itemProps);
};

const PathFormArrayWrapperEmpty: React.FC<PathFormArrayWrapperEmptyProps> = ({ renderEmpty, emptyProps }) => {
  return renderEmpty(emptyProps);
};
