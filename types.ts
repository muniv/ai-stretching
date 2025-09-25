// FIX: Import React to provide type definitions for React.FC and React.SVGProps.
import type React from 'react';

export enum AppStatus {
  LOADING,
  READY,
  STRETCHING,
  FINISHED,
  ERROR,
}

export interface Stretch {
  name: string;
  koreanName: string;
  reps: number; // repetitions
  instructions: string;
  imageComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface Prediction {
  className: string;
  probability: number;
}