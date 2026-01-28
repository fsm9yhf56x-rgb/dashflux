'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number;
}

export default function Tooltip({ content, children, delay = 0 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position fixed = relatif au viewport, pas besoin de window.scrollY
      setPosition({
        top: rect.top - 10, // 10px au-dessus de l'élément
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  const tooltipContent = isVisible && mounted ? createPortal(
    <div 
      className="fixed px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-2xl pointer-events-none whitespace-normal"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 999999,
        maxWidth: '16rem',
      }}
    >
      {content}
      <div 
        className="absolute top-full left-1/2 -translate-x-1/2 -mt-1"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgb(17, 24, 39)',
        }}
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      <span 
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {tooltipContent}
    </>
  );
}