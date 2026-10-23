/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppMode, EruvInspectionTask, GameDifficulty } from './types/eruv';
import { INITIAL_INSPECTION_TASKS, DIFFICULTY_CONFIGS, getTasksForDifficulty } from './data/eruvData';
import { TownScene } from './components/3d/TownScene';
import { EruvGameCanvas } from './components/3d/EruvGameCanvas';
import { CollapsibleDock } from './components/ui/CollapsibleDock';
import { InspectorHUD } from './components/ui/InspectorHUD';
import { DifficultyModal } from './components/ui/DifficultyModal';
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
import { MobileAppHeader } from './components/ui/MobileAppHeader';
import { AchievementsOverlay } from './components/ui/AchievementsOverlay';
import { AchievementToast } from './components/ui/AchievementToast';
import { DidYouKnowToast } from './components/ui/DidYouKnowToast';
import { useAchievements } from './hooks/useAchievements';
import { useTriviaToast } from './hooks/useTriviaToast';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { soundManager } from './utils/audio';
import { hapticsManager } from './utils/haptics';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('game');
  const [difficulty, setDifficulty] = useState<GameDifficulty>(() => {
    try {
      const stored = localStorage.getItem('eruv_game_difficulty') as GameDifficulty;
      if (stored && ['easy', 'standard', 'expert'].includes(stored)) {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'standard';
  });
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<EruvInspectionTask[]>(() => getTasksForDifficulty(difficulty));
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
  const [minutesToShabbat, setMinutesToShabbat] = useState<number>(() => DIFFICULTY_CONFIGS[difficulty].initialMinutes);

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

  const [hapticsActive, setHapticsActive] = useState<boolean>(() => hapticsManager.enabled);
  const handleToggleHaptics = () => {
    const nextState = !hapticsActive;
    hapticsManager.enabled = nextState;
    setHapticsActive(nextState);
    if (nextState) {
      hapticsManager.tap();
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

  // Halachic Trivia 'Did You Know?' Mini-Toast system in Game Mode
  const {
    currentFact: triviaFact,
    isVisible: isTriviaVisible,
    dismissFact: dismissTriviaFact,
    nextFact: nextTriviaFact,
  } = useTriviaToast({
    isGameMode: currentMode === 'game',
    isInspecting: selectedTask !== null,
    onFactSeen: (totalSeen) => {
      updateProgress('trivia-hunter', totalSeen);
    },
  });

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
      setMinutesToShabbat(prev => (prev > 5 ? prev - 1 : DIFFICULTY_CONFIGS[difficulty].initialMinutes));
    }, 45000); // ticks every 45s
    return () => clearInterval(timer);
  }, [difficulty]);

  // Trigger celebration on reaching Kosher status
  useEffect(() => {
    if (isKosher && tasks.length > 0) {
      hapticsManager.celebration();
      unlockAchievement('eruv-certified');
      if (difficulty === 'expert') {
        unlockAchievement('expert-posek');
      }
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
  }, [isKosher, tasks.length, difficulty, unlockAchievement]);

  // Handle task repair
  const handleFixTask = (taskId: string) => {
    hapticsManager.success();
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
    if (difficulty === 'expert') {
      updateProgress('expert-posek', newFixedCount);
    }
  };

  // Jump camera to task
  const handleJumpToTask = (task: EruvInspectionTask) => {
    hapticsManager.tap();
    setSelectedTask(task);
    if (sceneRef.current) {
      sceneRef.current.focusOnPosition(task.cameraPosition, task.cameraTarget);
    }
  };

  // Click on a 3D pole
  const handlePoleClick = (poleIndex: number) => {
    soundManager.playClick();
    hapticsManager.tap();
    const matchingTask = tasks.find(t => t.poleIndex === poleIndex);
    if (matchingTask) {
      handleJumpToTask(matchingTask);
    }
  };

  // Click on synagogue
  const handleSynagogueClick = () => {
    soundManager.playClick();
    hapticsManager.medium();
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

  const handleSelectDifficulty = (newDiff: GameDifficulty) => {
    setDifficulty(newDiff);
    try {
      localStorage.setItem('eruv_game_difficulty', newDiff);
    } catch {
      // Fallback
    }
    setTasks(getTasksForDifficulty(newDiff));
    setSelectedTask(null);
    setMinutesToShabbat(DIFFICULTY_CONFIGS[newDiff].initialMinutes);
    if (sceneRef.current) {
      sceneRef.current.resetOverviewCamera();
    }
  };

  const handleResetGame = () => {
    soundManager.playClick();
    setTasks(getTasksForDifficulty(difficulty).map(t => ({ ...t, fixed: false })));
    setSelectedTask(null);
    setMinutesToShabbat(DIFFICULTY_CONFIGS[difficulty].initialMinutes);
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
          onTriggerTrivia={nextTriviaFact}
          difficulty={difficulty}
          onOpenDifficulty={() => setIsDifficultyModalOpen(true)}
          unlockedBadgesCount={unlockedCount}
        />
      )}

      {/* Non-Game Views Container with Sticky Mobile App Header */}
      {currentMode !== 'game' && (
        <div className="relative z-20 w-full h-full flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-sm">
          <MobileAppHeader
            currentMode={currentMode}
            onBackToGame={() => setCurrentMode('game')}
            onOpenMobileMenu={() => setIsMobileNavOpen(true)}
            soundActive={soundActive}
            onToggleSound={handleToggleSound}
            isKosher={isKosher}
          />
          <div className="flex-1 overflow-y-auto overscroll-contain pb-28 pt-2 sm:pt-4 px-2 sm:px-4">
            {currentMode === 'sandbox' && (
              <SandboxControls
                onKosherDoorwayBuilt={() => unlockAchievement('sandbox-architect')}
              />
            )}
            {currentMode === 'domains' && <DomainCarryingSim />}
            {currentMode === 'infographics' && <InfographicsSection />}
            {currentMode === 'quiz' && <QuizModal />}
            {currentMode === 'daily-halacha' && <DailyHalachaSection />}
          </div>
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
        hapticsActive={hapticsActive}
        onToggleHaptics={handleToggleHaptics}
        difficulty={difficulty}
        onSelectDifficulty={handleSelectDifficulty}
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
        onTriggerTrivia={nextTriviaFact}
        unlockedBadgesCount={unlockedCount}
        isOnline={isOnline}
      />

      {/* Game Difficulty Level Modal */}
      <DifficultyModal
        isOpen={isDifficultyModalOpen}
        onClose={() => setIsDifficultyModalOpen(false)}
        currentDifficulty={difficulty}
        onSelectDifficulty={handleSelectDifficulty}
        fixedTasksCount={fixedCount}
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

      {/* 'Did You Know?' Halachic Trivia Mini-Toast in Game Mode */}
      <DidYouKnowToast
        fact={triviaFact}
        isVisible={isTriviaVisible && currentMode === 'game' && !selectedTask}
        onDismiss={dismissTriviaFact}
        onNextFact={nextTriviaFact}
        onOpenStudyHub={() => handleOpenStudyHub('facts')}
      />
    </div>
  );
}
