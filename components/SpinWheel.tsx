
import React, { useState, useRef, useEffect } from 'react';
import { SPIN_OUTCOMES } from '../types';

interface Props {
  onResult: (index: number) => void;
  lastSpinTime?: number;
}

const SpinWheel: React.FC<Props> = ({ onResult, lastSpinTime }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastSpinTime) {
      const cooldown = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();
      if (now - lastSpinTime < cooldown) {
        setCanSpin(false);
      }
    }
  }, [lastSpinTime]);

  const spin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    
    // Logic simulated on client for visual, but usually server sends the 'index'
    // Here we pick a random index
    const resultIndex = Math.floor(Math.random() * SPIN_OUTCOMES.length);
    const segmentAngle = 360 / SPIN_OUTCOMES.length;
    
    // Spin 5-10 times full rotation + the offset for the result index
    const extraRotations = (5 + Math.floor(Math.random() * 5)) * 360;
    const finalRotation = extraRotations + (360 - (resultIndex * segmentAngle));
    
    setRotation(prev => prev + finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onResult(resultIndex);
      setCanSpin(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-6">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-md"></div>
        
        {/* Wheel Container */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-8 border-white shadow-xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {SPIN_OUTCOMES.map((outcome, i) => {
            const angle = 360 / SPIN_OUTCOMES.length;
            const rotation = i * angle;
            return (
              <div 
                key={i}
                className="absolute w-full h-full"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.tan((angle / 2) * (Math.PI / 180))}% 0)`
                }}
              >
                <div 
                  className={`w-full h-full flex items-start justify-center pt-8 text-[8px] font-bold text-center px-2 ${
                    i % 2 === 0 ? 'bg-indigo-600' : 'bg-indigo-500'
                  }`}
                >
                  <span className="transform rotate-[22.5deg] block whitespace-nowrap overflow-hidden text-ellipsis max-w-[50px]">{outcome}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={spin}
        disabled={!canSpin || isSpinning}
        className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wider transition shadow-lg ${
          !canSpin || isSpinning 
            ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed opacity-50' 
            : 'bg-white text-indigo-900 hover:bg-yellow-400'
        }`}
      >
        {isSpinning ? 'Spinning...' : canSpin ? 'Spin Wheel' : 'Wait 24h'}
      </button>
    </div>
  );
};

export default SpinWheel;
