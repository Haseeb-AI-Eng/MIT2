import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TypingEffectProps {
  lines: string[];
  delayBetweenLines?: number;
  typingSpeed?: number;
  autoplayInterval?: number;
  className?: string;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({
  lines,
  delayBetweenLines = 1500,
  typingSpeed = 50,
  autoplayInterval = 5000,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) {
      // When finished, wait for autoplayInterval then restart
      const restartTimer = setTimeout(() => {
        setDisplayedText('');
        setCurrentLineIndex(0);
        setIsTyping(true);
      }, autoplayInterval);
      return () => clearTimeout(restartTimer);
    }

    const currentLine = lines[currentLineIndex];
    
    if (displayedText.length < currentLine.length) {
      // Typing the current line
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + currentLine[prev.length]);
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else if (currentLineIndex < lines.length - 1) {
      // Move to next line after delay
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setDisplayedText('');
      }, delayBetweenLines);
      return () => clearTimeout(timer);
    } else {
      // Finished all lines
      setIsTyping(false);
    }
  }, [displayedText, currentLineIndex, isTyping, lines, delayBetweenLines, typingSpeed, autoplayInterval]);

  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
      style={{ fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif", fontWeight: 500 }}
    >
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </motion.h1>
  );
};
