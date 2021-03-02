import React, { HTMLAttributes } from 'react';
import { usePathForm } from './usePathForm';

interface PathFormProps extends HTMLAttributes<HTMLFormElement> {
  onValidate?: (values: any, addError?: any) => any;
  onSubmit?: (values: any) => any;
}

export const PathForm: React.FC<PathFormProps> = ({ onSubmit, onValidate, ...other }) => {
  const { getValues, addError } = usePathForm();

  return (
    // TODO eventually, react native support
    <form
      noValidate
      autoComplete="off"
      onSubmit={(event) => {
        // never allow default behaviour on native form element
        event.preventDefault();

        // get the current store values
        const values = getValues();

        // async validator handler
        const validate = async (values: any) => {
          try {
            // TODO set validating, submitting, etc.
            await onValidate?.(values, addError);
            await onSubmit?.(values);
          } catch (err) {
            // do nothing
          }
        };

        // trigger async validate
        validate(values);
      }}
      {...other}
    />
  );
};
