import { useState, useEffect, useCallback, useRef } from "react";
import { ColorModel, AnyColor, HsvaColor } from "../types";
import { equalColorObjects } from "../utils/compare";
import { useEventCallback } from "./useEventCallback";

export function useColorManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onChange?: (props: { color: T; event: MouseEvent | TouchEvent | KeyboardEvent }) => void
): [
  HsvaColor,
  (color: Partial<HsvaColor>, event: MouseEvent | TouchEvent | KeyboardEvent) => void
] {
  // Save onChange callback in the ref for avoiding "useCallback hell"
  const onChangeCallback = useEventCallback<{
    color: T;
    event: MouseEvent | TouchEvent | KeyboardEvent;
  }>(onChange);

  // No matter which color model is used (HEX, RGB(A) or HSL(A)),
  // all internal calculations are based on HSVA model
  const [hsva, updateHsva] = useState<HsvaColor>(() => colorModel.toHsva(color));

  // By using this ref we're able to prevent extra updates
  // and the effects recursion during the color conversion
  const cache = useRef({ color, hsva });

  // Update local HSVA-value if `color` property value is changed,
  // but only if that's not the same color that we just sent to the parent
  useEffect(() => {
    if (!colorModel.equal(color, cache.current.color)) {
      const newHsva = colorModel.toHsva(color);
      cache.current = { hsva: newHsva, color };
      updateHsva(newHsva);
    }
  }, [color, colorModel]);

  // Merge the current HSVA color object with updated params.
  // For example, when a child component sends `h` or `s` only
  const handleChange = useCallback(
    (params: Partial<HsvaColor>, event: MouseEvent | KeyboardEvent | TouchEvent) => {
      let newColor;
      const newHsva = Object.assign({}, hsva, params);
      if (
        !equalColorObjects(newHsva, cache.current.hsva) &&
        !colorModel.equal((newColor = colorModel.fromHsva(newHsva)), cache.current.color)
      ) {
        cache.current = { hsva: newHsva, color: newColor };
        updateHsva((current) => Object.assign({}, current, params));
        onChangeCallback({ color: newColor, event });
      }
    },
    [colorModel, hsva, onChangeCallback]
  );

  return [hsva, handleChange];
}
