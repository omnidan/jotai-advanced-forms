import { useAtom } from "jotai";
import type {
  FormFieldAtomFamily,
  GenericErrorMessageKeys,
  MultiFormField,
} from "./form.js";

export interface UseMultiFormFieldProps<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
> {
  atomFamily: FormFieldAtomFamily<string, TValue, TErrorMessageKeys>;
  fieldIds: string[];
  addField: () => void;
  removeField: (id: string) => void;
}

export type UseMultiFormFieldOptions<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
> = MultiFormField<TValue, TErrorMessageKeys>;

/**
 * use a "multi form field", which is a way to dynamically add/remove
 * multiple instances of a specific form field. for example, to add multiple
 * first names.
 */
export function useMultiFormField<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
>({
  atomFamily,
  idCounterAtom,
  usedIdsAtom,
}: UseMultiFormFieldOptions<TValue, TErrorMessageKeys>): UseMultiFormFieldProps<
  TValue,
  TErrorMessageKeys
> {
  const [idCounter, setIdCounter] = useAtom(idCounterAtom);
  const [usedIds, setUsedIds] = useAtom(usedIdsAtom);

  const addField = () => {
    setUsedIds([...usedIds, idCounter]);
    setIdCounter(idCounter + 1);
  };

  const removeField = (removedId: string) => {
    setUsedIds(usedIds.filter((id) => id !== Number(removedId)));
    atomFamily.remove(removedId.toString());
  };

  return {
    atomFamily,
    fieldIds: usedIds.map((id) => id.toString()),
    addField,
    removeField,
  };
}
