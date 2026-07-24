import { createContext, useContext } from 'react';
import type { Direction } from './Direction.types';

// Defaults to 'ltr' so components can read the direction without a provider.
export const DirectionContext = createContext<Direction>('ltr');

/**
 * Reads the nearest `DirectionProvider`'s direction ('ltr' | 'rtl'), for
 * components that position or mirror in JS (e.g. floating surfaces). CSS that
 * uses logical properties flips on its own from the `dir` attribute.
 */
export const useDirection = (): Direction => useContext(DirectionContext);
