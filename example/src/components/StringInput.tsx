import type { UseFormFieldProps } from "jotai-advanced-forms";

export function StringInput({
  value,
  onChange,
  onBlur,
  ref,
  hasError,
  errorCode,
  errorText,
}: UseFormFieldProps<string, HTMLInputElement>) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onBlur={onBlur}
        ref={ref}
        style={{
          padding: "0.5rem",
          border: hasError ? "2px solid red" : "1px solid #ccc",
          borderRadius: "4px",
          width: "100%",
        }}
      />
      {hasError && (
        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {errorText} (code: {errorCode})
        </p>
      )}
    </div>
  );
}
