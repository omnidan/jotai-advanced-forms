---
id: getting-started
sidebar_position: 2
title: Getting Started
---

## Installation

Install `jotai-advanced-forms` and its peer dependencies:

```bash
pnpm add jotai jotai-advanced-forms
```

or

```bash
yarn add jotai jotai-advanced-forms
```

or

```bash
npm install jotai jotai-advanced-forms
```

## Basic Setup of a Form

Create a `state.ts` file next to your form component:

```ts
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();
export { useForm };

// required field
export const firstNameAtom = formFieldAtom<string, "required">({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
  },
});

// optional field
export const lastNameAtom = formFieldAtom<string, undefined>({
  initialState: "",
});
```

## Custom Input Component

Create a reusable input component to handle form field props:

```tsx
import type { UseFormFieldProps } from "jotai-advanced-forms";

export function StringInput({
  value,
  onChange,
  onBlur,
  ref,
  hasError,
  errorCode,
  errorText,
}: UseFormFieldProps<string>) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        ref={ref}
      />
      {hasError && (
        <p>
          {errorText} ({errorCode})
        </p>
      )}
    </div>
  );
}
```

## Using the Form in a Component

```tsx
import { useFormField } from "jotai-advanced-forms";
import { firstNameAtom, lastNameAtom, useForm } from "./state.js";
import { StringInput } from "./StringInput.js";

export function NameInputForm() {
  const firstNameField = useFormField({
    atom: firstNameAtom,
    errors: {
      // if you do not specify this, it will cause a type error, forcing you to handle error messages!
      required: "First name is required!",
    },
  });

  const lastNameField = useFormField({
    atom: lastNameAtom,
  });

  const { submitForm, isSubmitting } = useForm({
    onValid: () => alert("success!"),
  });

  function handleSubmit(e) {
    e.preventDefault();
    submitForm();
  }

  return (
    <form onSubmit={handleSubmit}>
      <StringInput {...firstNameField} />
      <StringInput {...lastNameField} />
      <input type="submit" value="Submit" disabled={isSubmitting} />
    </form>
  );
}
```

---

- [API Reference](./api)
- [Examples](./examples)
