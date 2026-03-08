import { useEffect, useState } from 'react';
import { getRSIColor } from '../services/api';

export default function RSIGauge({ score, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getRSIColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const label = score >= 80 ? 'SAFE' : score >= 60 ? 'MODERATE' : score >= 36 ? 'RISKY' : 'UNSAFE';

  return (
    <div className="rsi-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="rsi-gauge-bg" cx={size/2} cy={size/2} r={radius} />
        <circle className="rsi-gauge-circle"
          cx={size/2} cy={size/2} r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="rsi-gauge-score" style={{ color }}>{score}</span>
      <span className="rsi-gauge-label" style={{ color }}>{label}</span>
    </div>
  );
}
