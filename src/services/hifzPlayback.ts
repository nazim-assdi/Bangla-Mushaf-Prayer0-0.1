export interface RepeatRangeStep {
  nextAyahNumber: number | null;
  completedCycles: number;
  finished: boolean;
}

/**
 * Decide how Hifz range playback advances after the current ayah completes.
 * maxCycles counts full start-to-end passes, including the first pass.
 */
export function getRepeatRangeNextStep(
  currentAyahNumber: number,
  startAyahNumber: number,
  endAyahNumber: number,
  completedCycles: number,
  maxCycles: number,
): RepeatRangeStep {
  const validIntegers = [
    currentAyahNumber,
    startAyahNumber,
    endAyahNumber,
    completedCycles,
    maxCycles,
  ].every(Number.isSafeInteger);

  if (
    !validIntegers ||
    startAyahNumber < 1 ||
    endAyahNumber < startAyahNumber ||
    currentAyahNumber < startAyahNumber ||
    currentAyahNumber > endAyahNumber ||
    completedCycles < 0 ||
    maxCycles < 1 ||
    completedCycles >= maxCycles
  ) {
    return {
      nextAyahNumber: null,
      completedCycles: Math.max(0, Number.isSafeInteger(completedCycles) ? completedCycles : 0),
      finished: true,
    };
  }

  if (currentAyahNumber < endAyahNumber) {
    return {
      nextAyahNumber: currentAyahNumber + 1,
      completedCycles,
      finished: false,
    };
  }

  const nextCompletedCycles = completedCycles + 1;
  if (nextCompletedCycles < maxCycles) {
    return {
      nextAyahNumber: startAyahNumber,
      completedCycles: nextCompletedCycles,
      finished: false,
    };
  }

  return {
    nextAyahNumber: null,
    completedCycles: nextCompletedCycles,
    finished: true,
  };
}
