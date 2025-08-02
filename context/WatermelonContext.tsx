import createContextHook from "@nkzw/create-context-hook";
import { useState } from "react";

export interface Watermelon {
  x: number;
  y: number;
  reasons: string[];
}

export const [WatermelonProvider, useWatermelon] = createContextHook(() => {
  const [selectedWatermelon, setSelectedWatermelon] = useState<Watermelon | null>(null);

  const selectWatermelon = (watermelon: Watermelon) => {
    setSelectedWatermelon(watermelon);
  };

  const resetSelection = () => {
    setSelectedWatermelon(null);
  };

  return {
    selectedWatermelon,
    selectWatermelon,
    resetSelection,
  };
});