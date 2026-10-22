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
import { DailyHalachaSection } from './components/ui/DailyHalachaSection';
import { TutorialModal } from './components/ui/TutorialModal';
import { KosherRulesModal } from './components/ui/KosherRulesModal';
import { StudyHubModal } from './components/ui/StudyHubModal';
import { MobileNavDrawer } from './components/ui/MobileNavDrawer';
import { AchievementsOverlay } from './components/ui/AchievementsOverlay';
import { AchievementToast } from './components/ui/AchievementToast';
import { useAchievements } from './hooks/useAchievements';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('game');
  const [tasks, setTasks] = useState<EruvInspectionTask[]>(INITIAL_INSPECTION_TASKS);
  const [selectedTask, setSelectedTask] = useState<EruvInspectionTask | null>(null);
  const [showVirtualWalls, setShowVirtualWalls] = useState<boolean>(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryInitialQuery, setGlossaryInitialQuery] = useState<string>('');
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [tutorialInitialStep, setTutorialInitialStep] = useState<number>(0);
  const [isKosherRulesOpen, setIsKosherRulesOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isStudyHubOpen, setIsStudyHubOpen] = useState<boolean>(false);
  const [studyHubTab, setStudyHubTab] = useState<'daily' | 'sources' | 'facts' | 'rules'>('daily');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [minutesToShabbat, setMinutesToShabbat] = useState<number>(48);

  const handleOpenGlossary = (term?: string) => {
    setGlossaryInitialQuery(term || '');
    setIsGlossaryOpen(true);
  };

  const handleOpenStudyHub = (tab: 'daily' | 'sources' | 'facts' | 'rules' = 'daily') => {
    soundManager.playClick();
    setStudyHubTab(tab);
    setIsStudyHubOpen(true);
    unlockAchievement('daily-learner');
  };

  const handleToggleSound = () => {
    soundManager.enabled = !soundActive;
    setSoundActive(!soundActive);
    if (!soundActive) {
      soundManager.playClick();
    }
  };

  const isOnline = useOnlineStatus(isSimulatedOffline);
  const sceneRef = useRef<TownScene | null>(null);

  // Achievements system
  const {
    achievements,
    recentlyUnlocked,
    dismissToast,
    unlockAchievement,
    updateProgress,
    resetAllAchievements,
    unlockedCount,
    totalCount,
    totalPoints,
    maxPoints,
  } = useAchievements();

  // First time visitor prompt: auto-show beginner tutorial
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('eruv_tutorial_seen');
      if (!hasSeen) {
        setIsTutorialOpen(true);
        localStorage.setItem('eruv_tutorial_seen', 'true');
      }
    } catch {
      // Fallback
    }
  }, []);

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
      unlockAchievement('eruv-certified');
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
  }, [isKosher, unlockAchievement]);

  // Handle task repair
  const handleFixTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, fixed: true } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, fixed: true } : null));
    }

    // Achievements progress tracking
    unlockAchievement('first-fix');
    const newFixedCount = tasks.filter(t => t.fixed || t.id === taskId).length;
    updateProgress('eruv-certified', newFixedCount);
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

  const handleToggleVirtualWalls = () => {
    soundManager.playClick();
    const nextState = !showVirtualWalls;
    setShowVirtualWalls(nextState);
    if (nextState) {
      unlockAchievement('virtual-walls');
    }
  };

  const handleOpenOfflineModal = () => {
    soundManager.playClick();
    setIsOfflineModalOpen(true);
    unlockAchievement('offline-ready');
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    if (mode === 'infographics') {
      updateProgress('infographics-scholar', 1);
    } else if (mode === 'domains') {
      updateProgress('domains-master', 1);
    } else if (mode === 'daily-halacha') {
      unlockAchievement('daily-learner');
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
          onOpenTutorial={() => {
            setTutorialInitialStep(0);
            setIsTutorialOpen(true);
          }}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenKosherVisualizer={() => setIsKosherRulesOpen(true)}
          onOpenGlossary={handleOpenGlossary}
          onOpenStudyHub={() => handleOpenStudyHub('daily')}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onCameraPreset={handleCameraPreset}
          unlockedBadgesCount={unlockedCount}
        />
      )}

      {/* Mode 2: Halachic Architecture Sandbox */}
      {currentMode === 'sandbox' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <SandboxControls
            onKosherDoorwayBuilt={() => unlockAchievement('sandbox-architect')}
          />
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

      {/* Mode 6: Daily Halacha Section */}
      {currentMode === 'daily-halacha' && (
        <div className="relative z-20 w-full h-full pt-4 pb-24 overflow-y-auto">
          <DailyHalachaSection />
        </div>
      )}

      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        onOpenDeployModal={handleOpenOfflineModal}
      />

      {/* Universal Collapsible Bottom Control Dock (Consolidated controls, mobile & desktop optimized) */}
      <CollapsibleDock
        currentMode={currentMode}
        onSelectMode={handleModeChange}
        isKosher={isKosher}
        fixedTasksCount={fixedCount}
        totalTasksCount={tasks.length}
        showVirtualWalls={showVirtualWalls}
        onToggleVirtualWalls={handleToggleVirtualWalls}
        onCameraPreset={handleCameraPreset}
        onOpenGlossary={() => handleOpenGlossary('')}
        onOpenOfflineModal={handleOpenOfflineModal}
        onOpenTutorial={() => {
          setTutorialInitialStep(0);
          setIsTutorialOpen(true);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenStudyHub={() => handleOpenStudyHub('daily')}
        unlockedBadgesCount={unlockedCount}
        isOnline={isOnline}
      />

      {/* Halachic Study Center Modal (Daily Halacha, Did You Know Facts, Kosher Rules) */}
      <StudyHubModal
        isOpen={isStudyHubOpen}
        onClose={() => setIsStudyHubOpen(false)}
        initialTab={studyHubTab}
        onOpenGlossary={handleOpenGlossary}
      />

      {/* Mobile Slide-Over Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isKosher={isKosher}
        fixedCount={fixedCount}
        totalTasks={tasks.length}
        minutesToShabbat={minutesToShabbat}
        showVirtualWalls={showVirtualWalls}
        onToggleVirtualWalls={handleToggleVirtualWalls}
        soundActive={soundActive}
        onToggleSound={handleToggleSound}
        onCameraPreset={handleCameraPreset}
        onOpenTutorial={() => {
          setTutorialInitialStep(0);
          setIsTutorialOpen(true);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenGlossary={() => handleOpenGlossary('')}
        onOpenStudyHub={() => handleOpenStudyHub('daily')}
        onOpenKosherRules={() => setIsKosherRulesOpen(true)}
        onOpenOfflineModal={handleOpenOfflineModal}
        onResetGame={handleResetGame}
        unlockedBadgesCount={unlockedCount}
        isOnline={isOnline}
      />

      {/* Interactive Beginner Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        initialStep={tutorialInitialStep}
      />

      {/* Dedicated Real-Time Kosher vs. Pasul Rules Modal */}
      <KosherRulesModal
        isOpen={isKosherRulesOpen}
        onClose={() => setIsKosherRulesOpen(false)}
      />

      {/* Hebrew / English Eruv Glossary Modal with Real-Time Search */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => {
          setIsGlossaryOpen(false);
          setGlossaryInitialQuery('');
        }}
        initialQuery={glossaryInitialQuery}
      />

      {/* Deploy App Offline & PWA Installation Modal */}
      <OfflineDeployModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={setIsSimulatedOffline}
        isOnline={isOnline}
      />

      {/* Achievements Overlay & Badge Gallery */}
      <AchievementsOverlay
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
        maxPoints={maxPoints}
        onResetAchievements={resetAllAchievements}
      />

      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        achievement={recentlyUnlocked}
        onClose={dismissToast}
        onOpenOverlay={() => setIsAchievementsOpen(true)}
      />
    </div>
  );
}
