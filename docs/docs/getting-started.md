---
id: getting-started
title: Getting Started
sidebar_position: 2
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

## Basic Usage

Here's a minimal example of how to create a form with validation:

```tsx
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();

const nameField = formFieldAtom({
  initialState: "",
  validate: (value) => (value.length < 2 ? "Name too short" : undefined),
  debugLabel: "name",
});

function MyForm() {
  const [name, setName] = useAtom(nameField);
  const { submitForm, isSubmitting } = useForm({
    onValid: () => alert("Form is valid!"),
    onError: () => alert("Please fix errors!"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
    >
      <input
        value={name.value}
        onChange={(e) => setName(e.target.value)}
        ref={name.ref}
      />
      {name.showError && <span>{name.error}</span>}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

---

- [API Reference](./api)
- [Examples](./examples)
