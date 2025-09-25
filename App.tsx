import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppStatus, type Prediction, type Stretch } from './types.ts';
import { MODEL_URL, STRETCHES, PREDICTION_THRESHOLD } from './constants.tsx';
import { ActionButton } from './components/ActionButton.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';

// Declare Teachable Machine's global object
declare const tmImage: any;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOADING);
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("AI 모델을 불러오는 중...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);

  const [repCount, setRepCount] = useState(0);
  const [canCountNextRep, setCanCountNextRep] = useState(true);

  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const requestAnimationRef = useRef<number>(0);

  const currentStretch = STRETCHES[currentStretchIndex];

  const handleStretchComplete = useCallback(() => {
    setRepCount(0);
    setCanCountNextRep(true);
    if (currentStretchIndex < STRETCHES.length - 1) {
      setCurrentStretchIndex(prev => prev + 1);
      setFeedback("잘하셨어요! 다음 스트레칭을 준비하세요.");
    } else {
      setStatus(AppStatus.FINISHED);
      setFeedback("모든 스트레칭을 완료했습니다! 개운한 하루 보내세요!");
    }
  }, [currentStretchIndex]);


  const handlePrediction = useCallback((predictions: Prediction[]) => {
    // If the app status isn't 'STRETCHING', or if for some reason we don't have a valid
    // current stretch (e.g., index is out of bounds), we should not proceed.
    if (status !== AppStatus.STRETCHING || !currentStretch) {
      return;
    }

    // This is the core of the fix. If the user has already completed the required number of reps,
    // we exit early. This prevents the logic from running again and scheduling a second (or third)
    // call to `handleStretchComplete`, which was causing `currentStretchIndex` to increment
    // multiple times and go out of bounds.
    if (repCount >= currentStretch.reps) {
      return;
    }
    
    const topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);
    setCurrentPrediction(topPrediction);

    const isTargetPose = topPrediction.className === currentStretch.name && topPrediction.probability > PREDICTION_THRESHOLD;
    
    if (isTargetPose && canCountNextRep) {
        const newRepCount = repCount + 1;
        setRepCount(newRepCount);
        setCanCountNextRep(false);
        setFeedback(`좋아요! 잠시 자세를 풀었다가 반복해주세요.`);
        
        // We use strict equality here to ensure that we only schedule the completion
        // handler exactly once, at the moment the final rep is registered.
        if (newRepCount === currentStretch.reps) {
            setTimeout(() => handleStretchComplete(), 1000);
        }
    } else if (!isTargetPose && !canCountNextRep) {
        setCanCountNextRep(true);
        setFeedback(`다시 '${currentStretch.koreanName}' 자세를 취해주세요.`);
    }

  }, [status, currentStretch, repCount, canCountNextRep, handleStretchComplete]);

  const handlePredictionRef = useRef(handlePrediction);
  useEffect(() => {
    handlePredictionRef.current = handlePrediction;
  }, [handlePrediction]);

  const loop = useCallback(async () => {
    if (webcamRef.current) {
        webcamRef.current.update();
        if (modelRef.current) {
            const prediction: Prediction[] = await modelRef.current.predict(webcamRef.current.canvas);
            handlePredictionRef.current(prediction);
        }
    }
    requestAnimationRef.current = requestAnimationFrame(loop);
  }, []);
  
  const init = useCallback(async () => {
    if (modelRef.current) {
        return;
    }
    try {
      setFeedback("AI 모델과 카메라를 준비하고 있습니다...");
      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";

      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;

      const flip = true;
      const webcam = new tmImage.Webcam(300, 300, flip);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;
      
      requestAnimationRef.current = requestAnimationFrame(loop);
      setStatus(AppStatus.READY);
      setFeedback("준비가 완료되었습니다! 스트레칭을 시작해볼까요?");
    } catch (error) {
      console.error("Initialization failed:", error);
      let message = "앱을 초기화하는 데 실패했습니다. 인터넷 연결 및 카메라 연결을 확인해주세요.";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = "카메라 접근 권한이 필요합니다. 페이지를 새로고침하고 권한을 허용해주세요.";
        } else if (error.name === 'NotFoundError') {
          message = "카메라를 찾을 수 없습니다. 카메라가 연결되어 있고 다른 앱에서 사용하고 있지 않은지 확인해주세요.";
        }
      }
      setErrorMessage(message);
      setStatus(AppStatus.ERROR);
    }
  }, [loop]);
  
  useEffect(() => {
    const startApp = () => {
      if (typeof tmImage === 'undefined') {
        console.error("Teachable Machine Image library (tmImage) not loaded.");
        setErrorMessage("필수 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하고 페이지를 새로고침 해주세요.");
        setStatus(AppStatus.ERROR);
        return;
      }
      init();
    };

    if (document.readyState === 'complete') {
      startApp();
    } else {
      window.addEventListener('load', startApp);
    }

    return () => {
      window.removeEventListener('load', startApp);
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = 0;
      
      if (webcamRef.current) {
        if (typeof webcamRef.current.stop === 'function') {
           webcamRef.current.stop();
        }
        webcamRef.current = null;
      }
      modelRef.current = null;
    };
  }, [init]);

  useEffect(() => {
    if ((status === AppStatus.READY || status === AppStatus.STRETCHING) && webcamRef.current?.canvas && webcamContainerRef.current) {
      const container = webcamContainerRef.current;
      const canvas = webcamRef.current.canvas;
      if (container.firstChild !== canvas) {
        container.innerHTML = '';
        container.appendChild(canvas);
      }
    }
  }, [status]);


  useEffect(() => {
    if (status === AppStatus.STRETCHING && currentStretch) {
      setRepCount(0);
      setCanCountNextRep(true);
      setProgress(0);
      setFeedback(`'${currentStretch.koreanName}' 자세를 ${currentStretch.reps}회 반복합니다.`);
    }
  }, [currentStretchIndex, status, currentStretch]);

  useEffect(() => {
    if (status === AppStatus.STRETCHING && currentStretch) {
        const newProgress = currentStretch.reps > 0 ? (repCount / currentStretch.reps) * 100 : 0;
        setProgress(newProgress);
    }
  }, [repCount, currentStretch, status]);


  const handleStart = () => {
    setCurrentStretchIndex(0);
    setStatus(AppStatus.STRETCHING);
  };

  const renderContent = () => {
    switch (status) {
      case AppStatus.LOADING:
        return (
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-slate-600">{feedback}</p>
          </div>
        );
      
      case AppStatus.ERROR:
        return (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">오류 발생</h2>
            <p>{errorMessage}</p>
          </div>
        );

      case AppStatus.READY:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">AI 스트레칭 코치</h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">{feedback}</p>
            <div className="my-8 w-[300px] h-[300px] mx-auto bg-slate-200 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <div ref={webcamContainerRef} className="w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <ActionButton onClick={handleStart}>시작하기</ActionButton>
          </div>
        );

      case AppStatus.FINISHED:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600">수고하셨습니다!</h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">{feedback}</p>
            <div className="my-8 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ActionButton onClick={handleStart}>다시하기</ActionButton>
          </div>
        );

      case AppStatus.STRETCHING:
        if (!currentStretch) {
          // This is a defensive check. If the logic is correct, we should not hit this.
          // It prevents a crash if the stretch index somehow goes out of bounds.
          setStatus(AppStatus.FINISHED);
          return null;
        }
        const StretchIcon = currentStretch.imageComponent;
        return (
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            <div className="w-full lg:w-1/2 flex flex-col items-center">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-slate-200 rounded-2xl relative overflow-hidden shadow-lg">
                    <div ref={webcamContainerRef} className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round"d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-3xl font-bold px-4 py-2 rounded-lg">
                      {repCount} / {currentStretch.reps}
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <p className="text-indigo-600 font-semibold">스트레칭 {currentStretchIndex + 1} / {STRETCHES.length}</p>
                    <h2 className="text-4xl font-bold text-slate-800 mt-2">{currentStretch.koreanName}</h2>
                    <StretchIcon className="w-24 h-24 text-indigo-500 mx-auto lg:mx-0 my-4" />
                    <p className="text-slate-600 text-lg my-4">{currentStretch.instructions}</p>
                    <ProgressBar progress={progress} />
                    <p className="mt-4 h-12 lg:h-6 text-slate-500 font-medium">{feedback}</p>
                    {currentPrediction && (
                      <div className="mt-2 text-xs text-slate-400 h-4">
                        <p>인식된 자세: {currentPrediction.className} (정확도: {(currentPrediction.probability * 100).toFixed(1)}%)</p>
                      </div>
                    )}
                </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-5xl mx-auto">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;