import { useFormField } from "jotai-advanced-forms";
import { searchField } from "../state.js";
import type { FormEvent } from "react";

export function SearchBar() {
  const searchProps = useFormField({
    atom: searchField,
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchProps.value}`);
  };

  const handleClear = () => {
    searchProps.onChange("");
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Search Bar (with Individual Field Reset)</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={searchProps.value}
          onChange={(e) => {
            searchProps.onChange(e.target.value);
          }}
          onBlur={searchProps.onBlur}
          ref={searchProps.ref}
          placeholder="Search..."
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: 1,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4fc3e7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </form>
    </div>
  );
}
