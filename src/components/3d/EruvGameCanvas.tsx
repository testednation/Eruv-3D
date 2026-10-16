import React, { useEffect, useRef } from 'react';
import { TownScene } from './TownScene';

interface EruvGameCanvasProps {
  fixedTasks: { [key: string]: boolean };
  isKosher: boolean;
  showVirtualWalls: boolean;
  onPoleClick: (poleIndex: number) => void;
  onSynagogueClick: () => void;
  sceneRef: React.MutableRefObject<TownScene | null>;
}

export const EruvGameCanvas: React.FC<EruvGameCanvasProps> = ({
  fixedTasks,
  isKosher,
  showVirtualWalls,
  onPoleClick,
  onSynagogueClick,
  sceneRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onPoleClick, onSynagogueClick });

  // Update callbacks ref so event listeners always access latest functions without scene recreation
  useEffect(() => {
    callbacksRef.current = { onPoleClick, onSynagogueClick };
  }, [onPoleClick, onSynagogueClick]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene once
    const sceneInstance = new TownScene(mountRef.current, {
      onPoleClick: (idx) => callbacksRef.current.onPoleClick?.(idx),
      onSynagogueClick: () => callbacksRef.current.onSynagogueClick?.(),
    });
    sceneRef.current = sceneInstance;

    return () => {
      sceneInstance.dispose();
      sceneRef.current = null;
    };
  }, [sceneRef]);

  // Sync state changes with Three.js scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setEruvKosherStatus(isKosher, fixedTasks);
    }
  }, [isKosher, fixedTasks, sceneRef]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.toggleVirtualWalls(showVirtualWalls);
    }
  }, [showVirtualWalls, sceneRef]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
