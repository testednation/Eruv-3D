/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppMode, EruvInspectionTask } from './types/eruv';
import { INITIAL_INSPECTION_TASKS } from './data/eruvData';
import { TownScene } from './components/3d/TownScene';
import { EruvGameCanvas } from './components/3d/EruvGameCanvas';
import { CollapsibleDock } from './components/ui/CollapsibleDock';
import { InspectorHUD } from './components/ui/InspectorHUD';
import { DomainCarryingSim } from './components/ui/DomainCarryingSim';
import { SandboxControls } from './components/ui/SandboxControls';
import { InfographicsSection } from './components/ui/InfographicsSection';
import { QuizModal } from './components/ui/QuizModal';
import { GlossaryModal } from './components/ui/GlossaryModal';
import { OfflineDeployModal } from './components/ui/OfflineDeployModal';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('game');
  const [tasks, setTasks] = useState<EruvInspectionTask[]>(INITIAL_INSPECTION_TASKS);
  const [selectedTask, setSelectedTask] = useState<EruvInspectionTask | null>(null);
  const [showVirtualWalls, setShowVirtualWalls] = useState<boolean>(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [minutesToShabbat, setMinutesToShabbat] = useState<number>(48);

  const isOnline = useOnlineStatus(isSimulatedOffline);

  const sceneRef = useRef<TownScene | null>(null);

  // Derived: map of fixed tasks
  const fixedTasksMap = tasks.reduce((acc, t) => {
    acc[t.id] = t.fixed;
    return acc;
  }, {} as { [key: string]: boolean });

  const fixedCount = tasks.filter(t => t.fixed).length;
  const isKosher = fixedCount === tasks.length;

  // Countdown timer for Friday afternoon atmosphere
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesToShabbat(prev => (prev > 5 ? prev - 1 : 48));
    }, 45000); // ticks every 45s
    return () => clearInterval(timer);
  }, []);

  // Trigger celebration on reaching Kosher status
  useEffect(() => {
    if (isKosher) {
      soundManager.playCelebration();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#f59e0b', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isKosher]);

  // Handle task repair
  const handleFixTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, fixed: true } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, fixed: true } : null));
    }
  };

  // Jump camera to task
  const handleJumpToTask = (task: EruvInspectionTask) => {
    setSelectedTask(task);
    if (sceneRef.current) {
      sceneRef.current.focusOnPosition(task.cameraPosition, task.cameraTarget);
    }
  };

  // Click on a 3D pole
  const handlePoleClick = (poleIndex: number) => {
    soundManager.playClick();
    const matchingTask = tasks.find(t => t.poleIndex === poleIndex);
    if (matchingTask) {
      handleJumpToTask(matchingTask);
    }
  };

  // Click on synagogue
  const handleSynagogueClick = () => {
    soundManager.playClick();
    const matzahTask = tasks.find(t => t.id === 'eruv-chatzerot');
    if (matzahTask) {
      handleJumpToTask(matzahTask);
    }
  };

  // Camera preset shortcuts
  const handleCameraPreset = (preset: 'overview' | 'synagogue' | 'tasks' | 'perimeter') => {
    if (!sceneRef.current) return;
    if (preset === 'overview') {
      sceneRef.current.resetOverviewCamera();
      setSelectedTask(null);
    } else if (preset === 'synagogue') {
      sceneRef.current.focusOnPosition([0, 10, 8], [0, 3, -6]);
      const matzahTask = tasks.find(t => t.id === 'eruv-chatzerot');
      if (matzahTask) setSelectedTask(matzahTask);
    } else if (preset === 'tasks') {
      const nextUnfixed = tasks.find(t => !t.fixed);
      if (nextUnfixed) {
        handleJumpToTask(nextUnfixed);
      } else {
        sceneRef.current.resetOverviewCamera();
      }
    } else if (preset === 'perimeter') {
      sceneRef.current.focusOnPosition([26, 12, 10], [10, 4, 10]);
    }
  };

  const handleResetGame = () => {
    soundManager.playClick();
    setTasks(INITIAL_INSPECTION_TASKS.map(t => ({ ...t, fixed: false })));
    setSelectedTask(null);
    if (sceneRef.current) {
      sceneRef.current.resetOverviewCamera();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D Scene Viewport: Kept alive across modes to prevent WebGL tear-down */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${
        currentMode === 'game' ? 'opacity-100 pointer-events-auto' : 'opacity-25 pointer-events-none'
      }`}>
        <EruvGameCanvas
          fixedTasks={fixedTasksMap}
          isKosher={isKosher}
          showVirtualWalls={showVirtualWalls}
          onPoleClick={handlePoleClick}
          onSynagogueClick={handleSynagogueClick}
          sceneRef={sceneRef}
        />
      </div>

      {/* Mode 1: 3D Game / Inspector Overlay */}
      {currentMode === 'game' && (
        <InspectorHUD
          tasks={tasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
          onFixTask={handleFixTask}
          isKosher={isKosher}
          minutesToShabbat={minutesToShabbat}
          onJumpToTask={handleJumpToTask}
          onResetGame={handleResetGame}
        />
      )}

      {/* Mode 2: Halachic Architecture Sandbox */}
      {currentMode === 'sandbox' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <SandboxControls />
        </div>
      )}

      {/* Mode 3: 4 Domains Carrying Simulator */}
      {currentMode === 'domains' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <DomainCarryingSim />
        </div>
      )}

      {/* Mode 4: Beginner's Illustrated Visual Infographics */}
      {currentMode === 'infographics' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <InfographicsSection />
        </div>
      )}

      {/* Mode 5: Halacha Master Quiz */}
      {currentMode === 'quiz' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <QuizModal />
        </div>
      )}

      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        onOpenDeployModal={() => setIsOfflineModalOpen(true)}
      />

      {/* Universal Collapsible Bottom Control Dock (Consolidated controls, zero side occlusion) */}
      <CollapsibleDock
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isKosher={isKosher}
        fixedTasksCount={fixedCount}
        totalTasksCount={tasks.length}
        showVirtualWalls={showVirtualWalls}
        onToggleVirtualWalls={() => setShowVirtualWalls(!showVirtualWalls)}
        onCameraPreset={handleCameraPreset}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Hebrew / English Eruv Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Deploy App Offline & PWA Installation Modal */}
      <OfflineDeployModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={setIsSimulatedOffline}
        isOnline={isOnline}
      />
    </div>
  );
}
