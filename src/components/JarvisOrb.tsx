import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';

interface JarvisOrbProps {
  state: AppState;
  isListening: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({
  state,
  isListening,
  isSpeaking,
  onClick,
  size = 'lg',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64 md:w-80 md:h-80',
  };

  const canvasDim = size === 'sm' ? 120 : size === 'md' ? 220 : 320;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = (canvasDim / 2) * 0.7;

      angle += isListening ? 0.04 : isSpeaking ? 0.03 : state === 'PROCESSING' ? 0.06 : 0.015;

      // Color scheme based on state
      let primaryColor = 'rgba(0, 240, 255, '; // Cyan
      let glowColor = 'rgba(0, 180, 255, ';
      if (state === 'ERROR') {
        primaryColor = 'rgba(255, 60, 60, ';
        glowColor = 'rgba(255, 30, 30, ';
      } else if (isListening) {
        primaryColor = 'rgba(0, 255, 170, '; // Emerald Cyan
        glowColor = 'rgba(0, 220, 140, ';
      } else if (state === 'SCREEN_CAPTURE_ACTIVE') {
        primaryColor = 'rgba(168, 85, 247, '; // Purple
        glowColor = 'rgba(147, 51, 234, ';
      } else if (state === 'PROCESSING') {
        primaryColor = 'rgba(56, 189, 248, ';
        glowColor = 'rgba(14, 165, 233, ';
      }

      // Outer segmented ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = primaryColor + '0.4)';
      ctx.lineWidth = 1.5;
      const segments = 24;
      for (let i = 0; i < segments; i++) {
        if (i % 3 === 0) continue;
        const startA = (i / segments) * Math.PI * 2;
        const endA = ((i + 0.7) / segments) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 18, startA, endA);
        ctx.stroke();
      }
      ctx.restore();

      // Middle counter-rotating ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = primaryColor + '0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Audio waveform bars around perimeter
      ctx.save();
      ctx.translate(cx, cy);
      const barCount = 36;
      for (let i = 0; i < barCount; i++) {
        const theta = (i / barCount) * Math.PI * 2;
        let barHeight = 4;
        if (isSpeaking) {
          barHeight = 6 + Math.sin(angle * 4 + i) * 14 + Math.cos(angle * 2 + i * 2) * 8;
        } else if (isListening) {
          barHeight = 5 + Math.sin(angle * 5 + i * 3) * 10;
        } else if (state === 'PROCESSING') {
          barHeight = 4 + Math.sin(angle * 8 + i * 2) * 8;
        }

        const x1 = Math.cos(theta) * (baseRadius + 24);
        const y1 = Math.sin(theta) * (baseRadius + 24);
        const x2 = Math.cos(theta) * (baseRadius + 24 + Math.max(2, barHeight));
        const y2 = Math.sin(theta) * (baseRadius + 24 + Math.max(2, barHeight));

        ctx.strokeStyle = primaryColor + (isSpeaking || isListening ? '0.85)' : '0.4)');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Central core orb with radial glowing gradient
      const pulse = Math.sin(angle * 3) * 6;
      const coreR = Math.max(10, baseRadius * 0.55 + (isSpeaking || isListening ? pulse : pulse * 0.4));

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, primaryColor + '0.9)');
      grad.addColorStop(0.65, glowColor + '0.45)');
      grad.addColorStop(1, primaryColor + '0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Core arc-reactor geometric inner pattern
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (coreR * 0.6), Math.sin(a) * (coreR * 0.6));
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, coreR * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, isListening, isSpeaking, canvasDim]);

  const getStateLabel = () => {
    switch (state) {
      case 'LISTENING':
        return 'শুনছি... (LISTENING)';
      case 'PROCESSING':
        return 'প্রক্রিয়াকরণ হচ্ছে... (PROCESSING)';
      case 'SPEAKING':
        return 'উত্তর দিচ্ছি... (SPEAKING)';
      case 'SCREEN_CAPTURE_ACTIVE':
        return 'স্ক্রিন ক্যাপচার সক্রিয় (SCREEN VISION)';
      case 'IMAGE_ANALYZING':
        return 'চিত্র বিশ্লেষণ হচ্ছে...';
      case 'ERROR':
        return 'ত্রুটি (ERROR)';
      default:
        return 'প্রস্তুত (STANDBY)';
    }
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`FAHIM AI Core Orb: ${getStateLabel()}`}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none group transition-transform active:scale-95`}
    >
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Ambient background glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500 ${
            state === 'ERROR'
              ? 'bg-rose-500'
              : isListening
              ? 'bg-emerald-400'
              : state === 'SCREEN_CAPTURE_ACTIVE'
              ? 'bg-purple-500'
              : 'bg-cyan-500 group-hover:opacity-70'
          }`}
        />

        {/* Canvas animation */}
        <canvas
          ref={canvasRef}
          width={canvasDim}
          height={canvasDim}
          className="relative z-10 w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* State label below orb */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full animate-ping ${
            state === 'ERROR'
              ? 'bg-rose-400'
              : isListening
              ? 'bg-emerald-400'
              : isSpeaking
              ? 'bg-sky-400'
              : 'bg-cyan-400'
          }`}
        />
        <span className="text-xs uppercase tracking-widest font-hud text-cyan-300 drop-shadow">
          {getStateLabel()}
        </span>
      </div>
    </div>
  );
};
