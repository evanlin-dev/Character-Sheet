import { useState, useEffect } from "react";

export function AnimatedDie({ sides, finalValue, isKept = true }) {
  const [val, setVal] = useState(sides);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timer;
    let count = 0;
    const maxFlashes = 15;
    const flash = () => {
      count++;
      if (count < maxFlashes) {
        setVal(Math.floor(Math.random() * sides) + 1);
        timer = setTimeout(flash, 40 + (count * 4)); 
      } else {
        setVal(finalValue);
        setIsDone(true);
      }
    };
    flash();
    return () => clearTimeout(timer);
  }, [sides, finalValue]);

  const getPolygon = () => {
      switch(sides) {
          case 4: return <polygon points="50,15 90,85 10,85" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>;
          case 6: return <rect x="15" y="15" width="70" height="70" rx="8" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>;
          case 8: return <polygon points="50,10 90,50 50,90 10,50" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>;
          case 10: return <polygon points="50,10 90,40 70,90 30,90 10,40" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>;
          case 12: return <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>;
          case 20: 
          default:
            return (
              <>
                <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" stroke="var(--gold)" strokeWidth="4" fill="var(--parchment)"/>
                <polyline points="50,5 50,95" stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
                <polyline points="5,28 95,72" stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
                <polyline points="5,72 95,28" stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
              </>
            );
      }
  };

  return (
    <div className={`relative w-20 h-20 flex items-center justify-center transition-all duration-200 ${isDone ? (isKept ? 'scale-110 drop-shadow-md' : 'scale-75 opacity-50') : 'scale-100'}`}>
       <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-sm">
          {getPolygon()}
       </svg>
       <span className={`relative z-10 font-cinzel font-bold text-2xl ${isDone && (val === sides || val === 1) ? (val === sides ? 'text-green-700' : 'text-danger-700') : 'text-slate-800'} select-none`} style={{ marginTop: sides === 4 ? '12px' : '0' }}>
          {val}
       </span>
    </div>
  );
}

export function AnimatedDiceOverlay({ activeRolls, onComplete }) {
    useEffect(() => {
        if (!activeRolls) return;
        const timer = setTimeout(() => {
            onComplete();
        }, 1600);
        return () => clearTimeout(timer);
    }, [activeRolls, onComplete]);

    if (!activeRolls) return null;

    let keptIndices = [];
    const { rolls, advDis, actualCount } = activeRolls;
    if (advDis === 'adv') {
        const indexedRolls = rolls.map((val, idx) => ({ val, idx }));
        indexedRolls.sort((a, b) => b.val - a.val);
        keptIndices = indexedRolls.slice(0, actualCount).map(r => r.idx);
    } else if (advDis === 'dis') {
        const indexedRolls = rolls.map((val, idx) => ({ val, idx }));
        indexedRolls.sort((a, b) => a.val - b.val);
        keptIndices = indexedRolls.slice(0, actualCount).map(r => r.idx);
    } else {
        keptIndices = rolls.map((_, idx) => idx);
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-wrap gap-4 justify-center items-center p-6 bg-white/90 rounded-xl shadow-2xl max-w-[90%] overflow-hidden border-2 border-yellow-600/50">
                {rolls.map((finalVal, i) => (
                    <AnimatedDie key={i} sides={activeRolls.sides} finalValue={finalVal} isKept={keptIndices.includes(i)} />
                ))}
            </div>
        </div>
    );
}