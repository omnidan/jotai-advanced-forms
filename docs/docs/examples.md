---
id: examples
title: Examples
sidebar_position: 4
---

# Examples

## Basic Form

```tsx
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();

const emailField = formFieldAtom({
  initialState: "",
  validate: (value) => (!value.includes("@") ? "Invalid email" : undefined),
  debugLabel: "email",
});

function EmailForm() {
  const [email, setEmail] = useAtom(emailField);
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
        value={email.value}
        onChange={(e) => setEmail(e.target.value)}
        ref={email.ref}
      />
      {email.showError && <span>{email.error}</span>}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

---

## Dynamic Fields (Multi-Field)

```tsx
import { createForm } from "jotai-advanced-forms";

const { multiFormField, useForm } = createForm();

const multi = multiFormField({
  initialState: "",
  validate: () => (value) => (value.length < 2 ? "Too short" : undefined),
  debugLabel: "multi",
});

function MultiFieldForm() {
  const [ids, setIds] = useAtom(multi.usedIdsAtom);
  const [counter, setCounter] = useAtom(multi.idCounterAtom);
  const { submitForm } = useForm({
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
      {ids.map((id) => {
        const atom = multi.atomFamily(id.toString());
        const [field, setField] = useAtom(atom);
        return (
          <div key={id}>
            <input
              value={field.value}
              onChange={(e) => setField(e.target.value)}
              ref={field.ref}
            />
            {field.showError && <span>{field.error}</span>}
            <button
              type="button"
              onClick={() => setIds(ids.filter((i) => i !== id))}
            >
              Remove
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          setIds([...ids, counter]);
          setCounter(counter + 1);
        }}
      >
        Add
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

See the [API Reference](./api) for more details.
