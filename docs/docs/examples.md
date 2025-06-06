---
id: examples
sidebar_position: 4
title: Examples
---

# Examples

## Full Name Form Example

```tsx
// state.ts
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();
export { useForm };

export const firstNameAtom = formFieldAtom<string, "required">({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
  },
});

export const lastNameAtom = formFieldAtom<string, undefined>({
  initialState: "",
});
```

```tsx
// StringInput.tsx
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

```tsx
// NameInputForm.tsx
import { useFormField } from "jotai-advanced-forms";
import { firstNameAtom, lastNameAtom, useForm } from "./state.js";
import { StringInput } from "./StringInput.js";

export function NameInputForm() {
  const firstNameField = useFormField({
    atom: firstNameAtom,
    errors: {
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

See the [API Reference](./api) for more details.
