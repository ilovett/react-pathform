import React, { FormEvent, HTMLAttributes } from 'react';
import { usePathForm } from './usePathForm';

export interface PathFormProps extends HTMLAttributes<HTMLFormElement> {
  /**
   * A callback to validate store values.  If provided,
   * this will be used to validate store values instead
   * of the native `react-pathform` validation.
   *
   * It can be an async callback to validate with your server.
   */
  onValidate?: (values: any, addError?: any) => any;

  /**
   * An asynchronous callback which fires after the
   * form has been validated.
   *
   * The values of the form are passed as an argument.
   */
  onSubmit?: (values: any) => any;

  /**
   * A synchronous callback which fires immediately
   * when the `onSubmit` event is fired.
   *
   * This can be used to stop event propagation.
   *
   * @example
   * onSubmitEvent={(event) => event.stopPropagation()}
   */
  onSubmitEvent?: (event?: FormEvent<HTMLFormElement>) => any;
}

export const PathForm: React.FC<PathFormProps> = ({ onSubmit, onSubmitEvent, onValidate, ...other }) => {
  const { getValues, addError, validateStore, clearErrors } = usePathForm();

  return (
    // TODO eventually, react native support
    <form
      noValidate
      autoComplete="off"
      onSubmit={(event) => {
        // provide sync hook to handle submit event
        onSubmitEvent?.(event);

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
