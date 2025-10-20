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

## Resetting Form Fields

### Resetting the Entire Form

```tsx
// state.ts
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();
export { useForm };

export const emailField = formFieldAtom<string>({
  initialState: "",
});

export const passwordField = formFieldAtom<string>({
  initialState: "",
});
```

```tsx
// LoginForm.tsx
import { useAtom } from "jotai";
import { emailField, passwordField, useForm } from "./state.js";

export function LoginForm() {
  const [email, setEmail] = useAtom(emailField);
  const [password, setPassword] = useAtom(passwordField);

  const { submitForm, resetForm, isSubmitting } = useForm({
    onValid: async () => {
      await login(email.value, password.value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
    >
      <input
        type="email"
        value={email.value}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password.value}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={isSubmitting}>
        Login
      </button>
      <button type="button" onClick={resetForm}>
        Clear Form
      </button>
    </form>
  );
}
```

### Resetting Individual Fields

```tsx
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom } = createForm();

const searchField = formFieldAtom<string>({
  initialState: "",
});

export function SearchBar() {
  const [search, setSearch] = useAtom(searchField);
  const resetSearch = useResetAtom(searchField);

  return (
    <div>
      <input
        value={search.value}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={resetSearch}>Clear</button>
    </div>
  );
}
```

---

See the [API Reference](./api) for more details.
