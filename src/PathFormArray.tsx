import React from 'react';
import { PathFormPath, PathFormStoreMeta, toStorePath, usePathForm, usePathFormValue } from '.';
import { get } from './utils';

export interface PathFormInputProps {
  name: string;
  value: any;
  onChange: (event?: any, value?: any) => any;
  onBlur: (event?: any) => any;
}

export type PathFormArrayItemProps = {
  arrayPath: PathFormPath;
  itemPath: PathFormPath;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  totalRows: number;
  meta: PathFormStoreMeta;
};

export type PathFormArrayEmptyProps = {
  arrayPath: PathFormPath;
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

export const PathFormArray: React.FC<PathFormArrayProps> = ({ path, renderItem, renderEmpty }) => {
  const { state } = usePathForm();
  const [rows, meta] = usePathFormValue(path);
  const arrayPath = path;

  return rows?.length ? (
    rows.map((row: any, index: number) => {
      const isLast = index + 1 === rows.length;
      const isFirst = index === 0;
      const totalRows = rows.length;
      const itemPath = [...arrayPath, index];
      const storeItem = get(state.current.store, toStorePath(itemPath));
      const { meta } = storeItem || {}; // TODO default

      return (
        // TODO reason not to just `renderItem(...)` ? cuz it returns an element ? memo in the future ?
        <PathFormArrayWrapperItem
          key={meta?.key || index}
          renderItem={renderItem}
          itemProps={{
            arrayPath,
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
    <PathFormArrayWrapperEmpty key={meta.uuid} renderEmpty={renderEmpty} emptyProps={{ arrayPath, meta }} />
  ) : null;
};

const PathFormArrayWrapperItem: React.FC<PathFormArrayWrapperItemProps> = ({ renderItem, itemProps }) => {
  return renderItem(itemProps);
};

const PathFormArrayWrapperEmpty: React.FC<PathFormArrayWrapperEmptyProps> = ({ renderEmpty, emptyProps }) => {
  return renderEmpty(emptyProps);
};
