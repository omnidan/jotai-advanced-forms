// @vitest-environment happy-dom
import { describe, test, expect, vi } from "vitest";
import { atom, useAtom, createStore, type Atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { act, renderHook } from "@testing-library/react";

describe("atomFamily", () => {
  test("should create a new atom instance for a new param", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [value] = result.current;
    expect(value).toBe(0);
  });

  test("changing an atom from the family should change its value", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomFirst));
    const [value] = newResult.current;
    expect(value).toBe(1);
  });

  test("changing one atom from the family should not change others", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: secondResult } = renderHook(() => useAtom(countAtomSecond));
    const [_2, setSecondValue] = secondResult.current;
    act(() => {
      setSecondValue(2);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [value] = newResult.current;
    expect(value).toBe(2);
  });

  test("getting atom from the family with the same param should result in the same atom", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [newValue] = newResult.current;
    expect(newValue).toBe(1);
  });

  test("calling remove should remove an atom from the family", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    countAtomFamily.remove("first");

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [newValue] = newResult.current;
    expect(newValue).toBe(0);
  });

  test("should not remove atom when shouldRemove function returns false", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    function shouldRemove(createdAt: number, param: string) {
      expect(createdAt).toBeGreaterThan(0);
      expect(createdAt).toBeLessThanOrEqual(Date.now());
      expect(param).toBe("first");
      return false;
    }
    countAtomFamily.setShouldRemove(shouldRemove);

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [newValue] = newResult.current;
    expect(newValue).toBe(1);
  });

  test("should remove atom when shouldRemove function returns true", () => {
    const countAtomFamily = atomFamily((_param: string) => atom(0));
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    function shouldRemove(createdAt: number, param: string) {
      expect(createdAt).toBeGreaterThan(0);
      expect(createdAt).toBeLessThanOrEqual(Date.now());
      expect(param).toBe("first");
      return true;
    }
    countAtomFamily.setShouldRemove(shouldRemove);

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [newValue] = newResult.current;
    expect(newValue).toBe(0);
  });
});

describe("atomFamily (with areEqual)", () => {
  test("changing an atom should change another atom with an equal param", () => {
    function areEqual(_a: string, _b: string) {
      return true;
    }
    const countAtomFamily = atomFamily((_param: string) => atom(0), areEqual);
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [value] = newResult.current;
    expect(value).toBe(1);
  });

  test("changing an atom should NOT change another atom if the param is not equal", () => {
    function areEqual(_a: string, _b: string) {
      return false;
    }
    const countAtomFamily = atomFamily((_param: string) => atom(0), areEqual);
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [value] = newResult.current;
    expect(value).toBe(0);
  });

  test("calling remove should remove all atoms with equal params", () => {
    function transformParam(param: string) {
      // transform "second" to "first" so that they are equal
      if (param === "second") return "first";
      return param;
    }
    function areEqual(a: string, b: string) {
      return transformParam(a) === transformParam(b);
    }
    const countAtomFamily = atomFamily((_param: string) => atom(0), areEqual);
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");
    const countAtomThird = countAtomFamily("third");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: secondResult } = renderHook(() => useAtom(countAtomSecond));
    const [_2, setSecondValue] = secondResult.current;
    act(() => {
      setSecondValue(2);
    });

    const { result: thirdResult } = renderHook(() => useAtom(countAtomThird));
    const [_3, setThirdValue] = thirdResult.current;
    act(() => {
      setThirdValue(3);
    });

    countAtomFamily.remove("first");

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [newValue] = newResult.current;
    expect(newValue).toBe(0);

    const countAtomSecondAgain = countAtomFamily("second");
    const { result: newSecondResult } = renderHook(() =>
      useAtom(countAtomSecondAgain),
    );
    const [newSecondValue] = newSecondResult.current;
    expect(newSecondValue).toBe(0);

    const countAtomThirdAgain = countAtomFamily("third");
    const { result: newThirdResult } = renderHook(() =>
      useAtom(countAtomThirdAgain),
    );
    const [newThirdValue] = newThirdResult.current;
    expect(newThirdValue).toBe(3);
  });

  test("should notify listeners", () => {
    const aFamily = atomFamily((param: number) => atom(param));
    const listener = vi.fn(() => {
      /* do nothing */
    });
    interface JotaiEvent {
      type: "CREATE" | "REMOVE";
      param: number;
      atom: Atom<number>;
    }
    const unsubscribe = aFamily.unstable_listen(listener);
    const atom1 = aFamily(1);
    expect(listener).toHaveBeenCalledTimes(1);
    // FIXME: this is not a void expression, it actually returns the jotai event
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const eventCreate = listener.mock.calls[0]?.at(0) as unknown as JotaiEvent;
    expect(eventCreate.type).toEqual("CREATE");
    expect(eventCreate.param).toEqual(1);
    expect(eventCreate.atom).toEqual(atom1);
    listener.mockClear();
    aFamily.remove(1);
    expect(listener).toHaveBeenCalledTimes(1);
    // FIXME: this is not a void expression, it actually returns the jotai event
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const eventRemove = listener.mock.calls[0]?.at(0) as unknown as JotaiEvent;
    expect(eventRemove.type).toEqual("REMOVE");
    expect(eventRemove.param).toEqual(1);
    expect(eventRemove.atom).toEqual(atom1);
    unsubscribe();
    listener.mockClear();
    aFamily(2);
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test("should return all params", () => {
    const store = createStore();
    const aFamily = atomFamily((param: number) => atom(param));

    expect(store.get(aFamily(1))).toEqual(1);
    expect(store.get(aFamily(2))).toEqual(2);
    expect(store.get(aFamily(3))).toEqual(3);
    expect(Array.from(aFamily.getParams())).toEqual([1, 2, 3]);
  });
});
