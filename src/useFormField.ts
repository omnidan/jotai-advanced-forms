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
  TRef extends HTMLElement = HTMLInputElement,
> = {
  atom: FormFieldAtom<TValue, TErrorMessageKeys, TRef>;
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

export interface UseFormFieldProps<
  TValue extends PrimitiveValue,
  TRef extends HTMLElement,
> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  ref: RefObject<TRef>;
  hasError: boolean;
  errorCode?: string;
  errorText?: string;
}

export function useFormField<
  TValue extends PrimitiveValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
>(
  options: UseFormFieldOptions<TValue, TErrorMessageKeys, TRef>,
): UseFormFieldProps<TValue, TRef> {
  const [field, setField] = useAtom(options.atom);
  const [wasBlurred, setWasBlurred] = useState(false);
  const inputRef = useRef<TRef>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    if (options.initialValue && !field.value) {
      // TODO: handle case where ref is actually null (hasn't been set)
      setField(options.initialValue, inputRef as RefObject<TRef>);
    } else {
      setField(NO_VALUE, inputRef as RefObject<TRef>);
    }
  }, [field.value, initialized, options.initialValue, setField]);

  const handleChange = useCallback(
    (value: TValue) => {
      setField(value, inputRef as RefObject<TRef>);
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
    ref: inputRef as RefObject<TRef>,
    hasError: showError,
    errorCode: field.error,
    errorText:
      showError && field.error ? options.errors?.[field.error] : undefined,
  };
}
