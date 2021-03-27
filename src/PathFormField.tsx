import React from 'react';
import { PathFormPath, usePathForm, usePathFormDotPath, usePathFormValue } from '.';

interface PathFormFieldProps {
  path: PathFormPath;
  defaultValue: any; // TODO generics?
  render: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
  renderEmpty?: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
}

export const PathFormField: React.FC<PathFormFieldProps> = ({ path, render, defaultValue }) => {
  const name = usePathFormDotPath(path);
  const [value, meta] = usePathFormValue(path, defaultValue); // TODO defaultValue needed?
  const { setValue, setTouched, clearError } = usePathForm();

  const onChange = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const value = event?.target?.value ?? event;
      setValue(path, value); // TODO { shouldValidate: shouldValidate, shouldDirty: true }

      // TODO dirty ? or do that in setValue ?
    },
    [path, setValue]
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

      // TODO why is meta not updating correctly on some of these?
      if (meta?.touched === false) {
        setTouched(path, true);
      }
    },
    [path, clearError, setTouched, meta]
  );

  return render(
    {
      name,
      value,
      onChange,
      onBlur,
      // key: meta?.uuid, // not sure about using key on everything yet... probably should not be included on inputProps
    },
    meta
  );
};
