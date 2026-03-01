/* eslint-disable react-hooks/purity */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

const MBTI_GROUPS = [
  {
    name: 'Analysts',
    color: '#E0D7FF', // Purple-ish
    textColor: '#5D2FB7',
    characters: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  },
  {
    name: 'Diplomats',
    color: '#D7FFD7', // Green-ish
    textColor: '#2D812D',
    characters: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  },
  {
    name: 'Sentinels',
    color: '#D7F3FF', // Blue-ish
    textColor: '#2B6DA1',
    characters: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  },
  {
    name: 'Explorers',
    color: '#FFF7D7', // Yellow-ish
    textColor: '#A17D1F',
    characters: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
  },
];

export default function LoadingScreen({
  message = 'Loading...',
}: LoadingScreenProps) {
  const [activeStep, setActiveStep] = useState(0);

  // Pick one random character from each group
  const selectedCharacters = useMemo(() => {
    return MBTI_GROUPS.map((group) => {
      const randomIndex = Math.floor(Math.random() * group.characters.length);
      return {
        id: group.characters[randomIndex],
        groupColor: group.color,
        textColor: group.textColor,
      };
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % selectedCharacters.length);
    }, 1500); // Wait for jump animation to mostly complete

    return () => clearInterval(timer);
  }, [selectedCharacters.length]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      initial={{ backgroundColor: selectedCharacters[0].groupColor }}
      animate={{ backgroundColor: selectedCharacters[activeStep].groupColor }}
      transition={{ duration: 0.8 }}
    >
      {/* Retro-pop dot pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Characters Row */}
        <div className="mb-12 flex items-end justify-center gap-4 sm:gap-8">
          {selectedCharacters.map((char, index) => {
            const isActive = index === activeStep;

            return (
              <div
                key={char.id}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          y: [0, -60, 0],
                          scale: [1, 1.1, 1],
                        }
                      : { y: 0, scale: 0.9 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  className="relative h-24 w-24 sm:h-32 sm:w-32"
                >
                  <Image
                    src={`/realyou/images/mbti/${char.id}.png`}
                    alt={char.id}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>

                {/* Visual indicator / shadow under active char */}
                <motion.div
                  className="mt-2 h-2 rounded-full bg-black/10"
                  animate={
                    isActive
                      ? {
                          width: ['40%', '20%', '40%'],
                          opacity: [0.2, 0.1, 0.2],
                        }
                      : { width: '40%', opacity: 0.2 }
                  }
                  transition={{ duration: 0.6 }}
                />
              </div>
            );
          })}
        </div>

        {/* Loading Text */}
        <div className="relative">
          <motion.p
            key={activeStep}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            // 文字間隔（tracking）を wider から wide や normal に少し狭めると、文字同士がくっついてより「丸っこく」見えます
            className="text-4xl font-black tracking-wide sm:text-5xl"
            style={{
              fontFamily:
                '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif',
              color: '#222222',

              // 縁取りを文字の「外側」に広げます（中の文字が潰れません）
              paintOrder: 'stroke fill',
              // 白い縁取りを思い切って太くします（丸みがグッと増します）
              WebkitTextStroke: '8px white',
              // 縁取りが太くなった分、影も少し大きく・濃くしてポップな立体感を出します
              textShadow: '5px 5px 0px rgba(0,0,0,0.25)',
            }}
          >
            {message}
          </motion.p>

          {/* Pulsing dots indicator */}
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-3 w-3 rounded-full bg-current"
                style={{ color: selectedCharacters[activeStep].textColor }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Group Name display (Subtle) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <motion.p
          key={activeStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="text-sm font-bold uppercase tracking-[0.3em] text-black"
        >
          {MBTI_GROUPS[activeStep].name}
        </motion.p>
      </div>
    </motion.div>
  );
}
