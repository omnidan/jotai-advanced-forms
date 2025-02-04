import { useAtom } from "jotai";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  type PrimitiveValue,
  type FormFieldAtom,
  type GenericErrorMessageKeys,
  NO_VALUE,
} from "./form.js";
import type {
  DefaultErrorMessageKeys,
  ErrorMessagesObject,
} from "./formErrorMessages.js";

export type UseFormFieldOptions<
  TValue extends PrimitiveValue,
  TErrorMessageKeys extends GenericErrorMessageKeys,
> = {
  atom: FormFieldAtom<TValue, TErrorMessageKeys>;
  /**
   * Add an additional onChange handler to the field.
   * @param value the current value of the field
   * @returns
   */
  onChange?: (value: TValue) => void;
  /**
   * If true, triggers validation for the field after it has been blurred.
   */
  validateOnBlur?: boolean;
  /**
   * If true, forces validation of the field.
   */
  forceValidation?: boolean;
  /**
   * Value get set on mount
   */
  initialValue?: TValue;
} & ErrorMessagesObject<
  Exclude<TErrorMessageKeys, DefaultErrorMessageKeys>,
  DefaultErrorMessageKeys
>;

export interface UseFormFieldProps<TValue extends PrimitiveValue> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  ref: RefObject<HTMLInputElement | null>;
  hasError: boolean;
  errorCode?: string;
  errorText?: string;
}

export function useFormField<
  TValue extends PrimitiveValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
>(
  options: UseFormFieldOptions<TValue, TErrorMessageKeys>,
): UseFormFieldProps<TValue> {
  const [field, setField] = useAtom(options.atom);
  const [wasBlurred, setWasBlurred] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    if (options.initialValue && !field.value) {
      setField(options.initialValue, inputRef);
    } else {
      setField(NO_VALUE, inputRef);
    }
  }, [field.value, initialized, options.initialValue, setField]);

  const handleChange = useCallback(
    (value: TValue) => {
      setField(value, inputRef);
      options.onChange?.(value);
    },
    [setField, options],
  );

  const handleBlur = useCallback(() => {
    setWasBlurred(true);
  }, [setWasBlurred]);

  let showError = false;
  if (field.showError) {
    // if showError is true, *always* show the error
    showError = true;
  }
  if (!showError && options.validateOnBlur) {
    // if validateOnBlur is true, show error if the field was blurred and there is an error
    showError = Boolean(wasBlurred && field.error);
  }
  if (!showError && options.forceValidation) {
    // if forceValidation is true, show error if there is an error
    showError = Boolean(field.error);
  }

  return {
    value: field.value,
    onChange: handleChange,
    onBlur: handleBlur,
    ref: inputRef,
    hasError: showError,
    errorCode: field.error,
    errorText:
      showError && field.error ? options.errors?.[field.error] : undefined,
  };
}
