import React from 'react';
import type { Stretch } from './types.js';

const NeckStretchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c-3 0-5.25-1.5-5.25-3.75s2.25-3.75 5.25-3.75c3 0 5.25 1.5 5.25 3.75S15 12.75 12 12.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25c-2.06-3.034-5.25-5.25-8.25-5.25S5.06 11.216 3 14.25" />
  </svg>
);

const ShoulderStretchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5h15" />
  </svg>
);

const WristStretchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15.75a2.25 2.25 0 0 1 2.25-2.25H12m-2.25 4.5a2.25 2.25 0 0 0 2.25-2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 13.5L7.5 15.75l2.25 2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 15.75a2.25 2.25 0 0 0-2.25-2.25H12m2.25 4.5a2.25 2.25 0 0 1-2.25-2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 13.5L16.5 15.75l-2.25 2.25" />
  </svg>
);


export const MODEL_URL = "https://teachablemachine.withgoogle.com/models/RIjix7VyF/";

export const STRETCHES: Stretch[] = [
  {
    name: "목",
    koreanName: "목 스트레칭",
    reps: 5,
    instructions: "목 스트레칭 자세를 취한 후, 잠시 자세를 풀었다가 다시 반복하는 동작으로 뭉친 목을 풀어주세요.",
    imageComponent: NeckStretchIcon,
  },
  {
    name: "어깨",
    koreanName: "어깨 스트레칭",
    reps: 5,
    instructions: "팔을 당겨 스트레칭 자세를 취한 후, 잠시 자세를 풀었다가 다시 반복하여 어깨를 이완시켜주세요.",
    imageComponent: ShoulderStretchIcon,
  },
  {
    name: "손목",
    koreanName: "손목 스트레칭",
    reps: 5,
    instructions: "손목을 부드럽게 돌리거나 꺾어주는 동작을 반복하며 손목의 피로를 풀어주세요.",
    imageComponent: WristStretchIcon,
  },
];

export const PREDICTION_THRESHOLD = 0.85;