import React from 'react';
import { PathFormPath, PathFormStoreMeta, usePathForm, usePathFormDotPath, usePathFormValue } from '.';

export interface PathFormInputProps {
  name: string;
  value: any;
  onChange: (event?: any, value?: any) => any;
  onBlur: (event?: any) => any;
}

export interface PathFormFieldRenderProps {
  inputProps: PathFormInputProps;
  meta: PathFormStoreMeta;
  renders: number;
}

interface PathFormFieldProps {
  path: PathFormPath;
  defaultValue: any; // TODO generics?
  render: (props: PathFormFieldRenderProps) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
  renderEmpty?: (props: PathFormFieldRenderProps) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
}

export const PathFormField: React.FC<PathFormFieldProps> = ({ path, render, defaultValue }) => {
  const name = usePathFormDotPath(path);
  const [value, meta, renders] = usePathFormValue(path, defaultValue); // TODO defaultValue needed?
  const { setValue, setTouched, setDirty, clearError } = usePathForm();

  const onChange = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const value = event?.target?.value ?? event;
      setValue(path, value);
      setDirty(path, true);
    },
    [path, setValue, setDirty]
  );

  // TODO onBlur, ref
  const onBlur = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const blurValue = event?.target?.value ?? event;

      // if the field has an error, and our blur value is different than the error value, clear the error
      if (Boolean(meta?.error) && blurValue !== meta?.error?.value) {
        clearError(path);
      }

      if (meta.touched !== true) {
        setTouched(path, true);
      }
    },
    [path, clearError, setTouched, meta]
  );

  return render({
    inputProps: {
      name,
      value,
      onChange,
      onBlur,
    },
    meta,
    renders,
  });
};
