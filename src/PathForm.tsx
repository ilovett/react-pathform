import React, { HTMLAttributes } from 'react';
import { usePathForm } from './usePathForm';

export interface PathFormProps extends HTMLAttributes<HTMLFormElement> {
  onValidate?: (values: any, addError?: any) => any;
  onSubmit?: (values: any) => any;
}

export const PathForm: React.FC<PathFormProps> = ({ onSubmit, onValidate, ...other }) => {
  const { getValues, addError, validateStore, clearErrors } = usePathForm();

  return (
    // TODO eventually, react native support
    <form
      noValidate
      autoComplete="off"
      onSubmit={(event) => {
        // never allow default behaviour on native form element
        event.preventDefault();

        // async validator handler
        const v = async () => {
          try {
            // get the current store values
            const values = getValues();

            // clear all the errors
            clearErrors();

            // use given onValidate if provided
            if (onValidate) {
              await onValidate(values, addError);
            } else {
              validateStore();
            }

            await onSubmit?.(values);
          } catch (err) {
            // do nothing
          }
        };

        // trigger async validate
        v();
      }}
      {...other}
    />
  );
};
