import React from 'react';
import { PathFormPath, PathFormStoreMeta, toStorePath, usePathForm, usePathFormValue } from '.';
import { get } from './utils';

interface PathFormArrayProps {
  path: PathFormPath;
  defaultValue: any; // TODO generics?
  render: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
  renderEmpty?: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
}

export const PathFormArray: React.FC<PathFormArrayProps> = ({ path, render, renderEmpty }) => {
  const { state } = usePathForm();
  const [rows, meta] = usePathFormValue(path);

  return rows?.length ? (
    rows.map((row: any, index: number) => {
      const isLast = index + 1 === rows.length;
      const isFirst = index === 0;
      const totalRows = rows.length;
      const arrayPath = path;
      const itemPath = [...arrayPath, index];
      const storeItem = get(state.current.store, toStorePath(itemPath));
      const { meta } = storeItem || {}; // TODO default

      return (
        <PathFormArrayItem
          key={meta?.key || index}
          {...{
            arrayPath,
            itemPath,
            index,
            isLast,
            isFirst,
            totalRows,
            meta,
            render,
          }}
        />
      );
    })
  ) : renderEmpty ? (
    <PathFormArrayEmpty key={meta?.key} {...{ arrayPath: path, meta, renderEmpty }} />
  ) : null;
};

export type PathFormArrayItemProps = {
  arrayPath: PathFormPath;
  itemPath: PathFormPath;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  totalRows: number;
  meta: PathFormStoreMeta; // TODO
  render: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
};

const PathFormArrayItem: React.FC<PathFormArrayItemProps> = ({ render, meta, ...props }) => {
  return render(props, meta);
};

type PathFormArrayEmptyProps = {
  arrayPath: PathFormPath;
  meta: PathFormStoreMeta;
  renderEmpty: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
};

const PathFormArrayEmpty: React.FC<PathFormArrayEmptyProps> = ({ renderEmpty, meta, ...props }) => {
  return renderEmpty(props, meta);
};
