'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { scenes, SceneLine, Choice, endings, getEndingCategory } from '@/lib/scenes';
import BackgroundCanvas from '@/components/BackgroundCanvas';

const colorMap: Record<string, string> = {
  cyan: '#4fd8ff',
  red: '#ff4d3d',
  violet: '#b967ff',
  unstable: '#4fd8ff',
  gold: '#ffd76a',
};

function removeBlackBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(imageSrc);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          if (r < 8 && g < 8 && b < 8) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL());
      } catch (e) {
        resolve(imageSrc);
      }
    };
    img.onerror = () => {
      resolve(imageSrc);
    };
  });
}

export default function GamePage() {
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootRingOpacity, setBootRingOpacity] = useState(0);
  const [bootRingScale, setBootRingScale] = useState(1);

  const [sessionId, setSessionId] = useState<string>('');
  const [currentSceneId, setCurrentSceneId] = useState<number>(1);
  const [previousChoiceTrait, setPreviousChoiceTrait] = useState<string>('default');

  // Game state
  const [dossSurvived, setDossSurvived] = useState(true);
  const [traitCounts, setTraitCounts] = useState<Record<string, number>>({});
  const [oxygen, setOxygen] = useState(88);
  const [hullStatus, setHullStatus] = useState('STABLE');
  const [timeToPort, setTimeToPort] = useState('41:12');

  // Dialogue state
  const [currentLines, setCurrentLines] = useState<SceneLine[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // FX layout states
  const [isKesslerActive, setIsKesslerActive] = useState(false);
  const [isDossActive, setIsDossActive] = useState(false);
  const [isGlowActive, setIsGlowActive] = useState(false);
  const [screenFlicker, setScreenFlicker] = useState(false);
  const [screenGlitch, setScreenGlitch] = useState(false);
  const [stageShake, setStageShake] = useState(false);

  // API load states
  const [ariaComment, setAriaComment] = useState<string | null>(null);
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  // Ending states
  const [isEnding, setIsEnding] = useState(false);
  const [epilogueText, setEpilogueText] = useState('');
  const [endingCategory, setEndingCategory] = useState('');
  const [endingColor, setEndingColor] = useState('#4fd8ff');
  const [isLoadingEnding, setIsLoadingEnding] = useState(false);

  const [chosenId, setChosenId] = useState<number | null>(null);

  const [kesslerSrc, setKesslerSrc] = useState('/characters/kessler.png');
  const [dossSrc, setDossSrc] = useState('/characters/doss.png');

  useEffect(() => {
    removeBlackBackground('/characters/kessler.png').then(setKesslerSrc);
    removeBlackBackground('/characters/doss.png').then(setDossSrc);
  }, []);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeScene = scenes.find((s) => s.id === currentSceneId) || scenes[0];

  // Initialize unique session tag
  useEffect(() => {
    const initSession = async () => {
      const cached = localStorage.getItem('mayday_session_id');
      if (cached) {
        setSessionId(cached);
        return;
      }
      try {
        const res = await fetch('/api/session', { method: 'POST' });
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('mayday_session_id', data.sessionId);
        }
      } catch (err) {
        console.error('Session API failed:', err);
        setSessionId(`session:kessler-${Math.random().toString(36).substr(2, 9)}`);
      }
    };
    initSession();
  }, []);

  // Boot sequence
  useEffect(() => {
    const lines = [
      'SS THRESHER — MAINTENANCE TERMINAL',
      'BOOTING...',
      'ARIA-9 LINKED.',
      '...good morning, Kessler.',
    ];
    let lineIdx = 0;

    const playBootLines = async () => {
      for (const l of lines) {
        setBootLines((prev) => [...prev, l]);
        await new Promise((res) => setTimeout(res, 1200));
      }
      setBootRingOpacity(1);
      setBootRingScale(1.3);
      await new Promise((res) => setTimeout(res, 1400));
      setBooting(false);
    };

    playBootLines();
  }, []);

  // Screen layout FX controllers
  const triggerFlicker = () => {
    setScreenFlicker(true);
    setTimeout(() => setScreenFlicker(false), 160);
  };

  const triggerGlitch = () => {
    if (Math.random() < 1 / 12) {
      setScreenGlitch(true);
      setTimeout(() => setScreenGlitch(false), 420);
    }
  };

  const triggerShake = () => {
    setStageShake(true);
    setTimeout(() => setStageShake(false), 300);
  };

  // Custom formatted diallogs for narration / ship logs
  const formatDialogueText = (line: SceneLine) => {
    if (line.type === 'narration') {
      if (currentSceneId === 1 && currentLineIdx === 0) {
        return `>>> WARNING: DECK 4 BREACH DETECTED <<<\n>>> INITIATING DIAGNOSTIC OVERRIDES...\n\n[LOG] ${line.text}`;
      }
      return `[LOG] ${line.text}`;
    }
    return line.text;
  };

  // Typewriter Line Revealer
  const runTypewriter = useCallback((rawText: string, speed: number, onDone: () => void) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    let typed = '';

    typingTimerRef.current = setInterval(() => {
      if (Math.random() < 0.04 && index > 2) {
        index -= 2;
        typed = typed.substring(0, index);
        setDisplayedText(typed);
        triggerFlicker();
      }

      if (index < rawText.length) {
        typed += rawText[index];
        setDisplayedText(typed);
        index++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        onDone();
      }
    }, speed);
  }, []);

  // Load and play dialogue lines
  const playDialogue = useCallback(async () => {
    let lines = [...activeScene.lines];

    // Prepend ARIA comment if downlinked
    if (ariaComment) {
      lines.unshift({
        type: 'aria',
        text: ariaComment,
      });
      setAriaComment(null); // use once
    }

    setCurrentLines(lines);
    setCurrentLineIdx(0);
    setShowChoices(false);
    setChosenId(null);

    // Play first line
    const firstLine = lines[0];
    if (firstLine) {
      updatePortraits(firstLine);
      const textToType = formatDialogueText(firstLine);
      runTypewriter(textToType, activeScene.typewriterSpeed || 35, () => {
        setIsLineTypingDone(true);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneId, activeScene, ariaComment]);

  const [isLineTypingDone, setIsLineTypingDone] = useState(false);

  // Portrait layout controller based on current active dialogue line speaker
  const updatePortraits = (line: SceneLine) => {
    if (line.type === 'narration') {
      setIsKesslerActive(false);
      setIsDossActive(false);
      setIsGlowActive(false);
    } else if (line.type === 'comms' || line.who === 'doss') {
      setIsKesslerActive(false);
      setIsDossActive(dossSurvived);
      setIsGlowActive(dossSurvived);
    } else {
      setIsKesslerActive(true);
      setIsDossActive(false);
      setIsGlowActive(true);
    }
  };

  // Sync state and run dialogues when scene changes
  useEffect(() => {
    if (booting) return;
    triggerFlicker();
    triggerShake();
    triggerGlitch();

    setOxygen(activeScene.o2);
    setHullStatus(activeScene.hull);
    setTimeToPort(activeScene.time);

    playDialogue();
  }, [currentSceneId, booting, playDialogue]);

  // Click handler to advance dialogue line or choices
  const handleDialogueClick = () => {
    const activeLine = currentLines[currentLineIdx];
    if (!activeLine) return;

    const fullText = formatDialogueText(activeLine);

    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullText);
      setIsTyping(false);
      setIsLineTypingDone(true);
      return;
    }

    if (currentLineIdx < currentLines.length - 1) {
      const nextIdx = currentLineIdx + 1;
      setCurrentLineIdx(nextIdx);
      setIsLineTypingDone(false);
      const nextLine = currentLines[nextIdx];
      updatePortraits(nextLine);
      const nextTextToType = formatDialogueText(nextLine);
      runTypewriter(nextTextToType, activeScene.typewriterSpeed || 35, () => {
        setIsLineTypingDone(true);
      });
    } else {
      setShowChoices(true);
    }
  };

  // Trigger choice select
  const handleChoice = async (choice: Choice, idx: number) => {
    setChosenId(idx);
    triggerShake();

    // Tally traits
    setTraitCounts((prev) => ({
      ...prev,
      [choice.trait]: (prev[choice.trait] || 0) + 1,
    }));
    setPreviousChoiceTrait(choice.trait);

    // Save decision to Supermemory
    try {
      await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sceneId: currentSceneId,
          choiceLabel: choice.text,
          trait: choice.trait,
          memoryText: choice.memoryText,
        }),
      });
    } catch (err) {
      console.error('Supermemory logging error:', err);
    }

    // Load next state
    setTimeout(async () => {
      triggerFlicker();
      if (typeof choice.next === 'string') {
        // Trigger Ending synthesis
        setIsEnding(true);
        setIsLoadingEnding(true);
        try {
          const res = await fetch('/api/ending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              traitCounts: {
                ...traitCounts,
                [choice.trait]: (traitCounts[choice.trait] || 0) + 1,
              },
            }),
          });
          const data = await res.json();
          setEndingCategory(data.endingCategory);
          setEpilogueText(data.epilogue);
          const endObj = endings[choice.next] || endings.ending_alone;
          setEndingColor(endObj.color);
        } catch (err) {
          console.error('Ending fetch failed:', err);
          setEpilogueText('Failed to load ending log. Terminating...');
        } finally {
          setIsLoadingEnding(false);
        }
      } else {
        // Fetch ARIA's observation for the next scene
        setIsLoadingComment(true);
        try {
          const res = await fetch(
            `/api/aria-comment?sessionId=${encodeURIComponent(sessionId)}&sceneId=${choice.next}`
          );
          const data = await res.json();
          if (data.comment) {
            setAriaComment(data.comment);
          }
        } catch (err) {
          console.error('Comment API error:', err);
        } finally {
          setIsLoadingComment(false);
        }
        
        setCurrentSceneId(choice.next as number);
      }
    }, 600);
  };

  const handleRestart = () => {
    localStorage.removeItem('mayday_session_id');
    window.location.reload();
  };

  // Get current active speaker styling properties
  const activeLine = currentLines[currentLineIdx];

  const getDialogueTextClass = () => {
    if (!activeLine) return 'dialogue-text';
    if (activeLine.type === 'aria') return 'dialogue-text aria-line';
    if (activeLine.type === 'comms') return 'dialogue-text doss-line';
    return 'dialogue-text';
  };

  const getDialogueCursorClass = () => {
    if (!activeLine) return 'cursor';
    if (activeLine.type === 'aria') return 'cursor aria-cursor';
    if (activeLine.type === 'comms') return 'cursor doss-cursor';
    return 'cursor';
  };

  const getNameplateText = () => {
    if (!activeLine) return 'SHIP LOG';
    if (activeLine.type === 'narration') return 'SHIP LOG';
    if (activeLine.type === 'aria') return 'ARIA-9';
    return 'COMMS: DOSS';
  };

  return (
    <>
      <BackgroundCanvas />

      <div id="stage" className={stageShake ? 'shake' : ''}>
        <div className={`terminal ${screenFlicker ? 'glow' : ''}`}>
          <div className="corner-bracket tl"></div>
          <div className="corner-bracket tr"></div>
          <div className="corner-bracket bl"></div>
          <div className="corner-bracket br"></div>
          <div className="plate">SS THRESHER — MAINT TERMINAL 07</div>
          
          <div className="operator-badge">
            <img src={kesslerSrc} alt="Kessler Badge" className="pixelated" />
            <div className="op-text">OPERATOR<span>KESSLER</span></div>
          </div>

          <div className="screen" id="screen">
            <div className="crt-overlay"></div>
            <div className="crt-curve"></div>
            <div className="vignette"></div>
            <div className={`flicker ${screenFlicker ? 'go' : ''}`}></div>
            <div className={`static-glitch ${screenGlitch ? 'go' : ''}`}></div>

            {/* BOOT LOADING SCREEN */}
            {booting && (
              <div className="boot-screen" id="bootScreen">
                <div id="bootLines" style={{ minHeight: '90px' }}>
                  {bootLines.map((line, idx) => (
                    <div key={idx} className="mb-1">{line}</div>
                  ))}
                </div>
                <div 
                  className="boot-ring" 
                  id="bootRing"
                  style={{ opacity: bootRingOpacity, transform: `scale(${bootRingScale})` }}
                ></div>
              </div>
            )}

            {/* MAIN GAME INTERFACE */}
            {!booting && !isEnding && (
              <div id="mainUI" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                
                {/* Portrait Overlay Stage */}
                <div className="portrait-stage">
                  {/* Stage stars (CSS) */}
                  <div className="stage-stars">
                    <div className="stage-star blue" style={{ top: '15%', left: '12%', width: '2px', height: '2px' }}></div>
                    <div className="stage-star warm" style={{ top: '35%', left: '28%', width: '1px', height: '1px' }}></div>
                    <div className="stage-star warm" style={{ top: '8%', left: '62%', width: '2px', height: '2px' }}></div>
                    <div className="stage-star blue" style={{ top: '22%', left: '78%', width: '1px', height: '1px' }}></div>
                    <div className="stage-star warm" style={{ top: '40%', left: '45%', width: '2px', height: '2px' }}></div>
                  </div>

                  {/* Stage planets */}
                  <div className="stage-planet" id="stagePlanet1"></div>
                  <div className="stage-planet" id="stagePlanet2"></div>

                  {/* Floating Asteroids */}
                  <div className="stage-asteroid" id="stageAsteroid1"></div>
                  <div className="stage-asteroid" id="stageAsteroid2"></div>

                  {/* Character auras */}
                  <div className={`char-aura kessler-aura ${isKesslerActive ? 'visible' : ''}`}></div>
                  <div className={`char-aura doss-aura ${isDossActive ? 'visible' : ''}`}></div>

                  <div 
                    className={`portrait-glow ${isGlowActive ? 'active' : ''}`}
                    style={{ background: `radial-gradient(ellipse at center, ${colorMap[activeScene.mood]}, transparent 70%)` }}
                  ></div>
                  <img 
                    className={`character-portrait kessler-pos ${isKesslerActive ? 'active breathe' : ''}`} 
                    id="portraitKessler" 
                    src={kesslerSrc} 
                    alt="Kessler"
                  />
                  <img 
                    className={`character-portrait doss-pos ${isDossActive ? 'active breathe' : ''} ${!dossSurvived ? 'offline' : ''}`} 
                    id="portraitDoss" 
                    src={dossSrc} 
                    alt="Doss"
                  />

                  {/* ARIA Oscilloscope ring */}
                  <div className="aria-module">
                    <div className="ring-wrap">
                      <div 
                        className={`ring ${activeLine?.type === 'aria' && isTyping ? 'talking' : ''} ${activeScene.mood === 'unstable' ? 'unstable' : ''}`}
                        style={{ borderColor: colorMap[activeScene.mood], filter: `drop-shadow(0 0 8px ${colorMap[activeScene.mood]})` }}
                      >
                        <div className="ring-inner-dot" style={{ backgroundColor: colorMap[activeScene.mood], boxShadow: `0 0 10px ${colorMap[activeScene.mood]}` }}></div>
                      </div>
                    </div>
                    <div className="aria-status" style={{ color: colorMap[activeScene.mood] }}>
                      ARIA-9<br />STATUS: {activeScene.mood === 'red' ? 'ALARMED' : activeScene.mood === 'unstable' ? '[EXPUNGED]' : 'NOMINAL'}
                    </div>
                  </div>
                </div>

                {/* dialogue box & text panel */}
                <div className="dialogue-wrap">
                  <div className="nameplate" id="nameplate">{getNameplateText()}</div>
                  <div className="dialogue-box">
                    {isLoadingComment ? (
                      <div className="dialogue-text flex items-center justify-center gap-2 text-xs font-mono text-[#4fd8ff]">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-[#4fd8ff] rounded-full"></span>
                        DOWNLINKING AI OBSERVATION...
                      </div>
                    ) : (
                      <div 
                        className={getDialogueTextClass()} 
                        id="dialogueText" 
                        onClick={handleDialogueClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {displayedText}
                        {isTyping && <span className={getDialogueCursorClass()}></span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* switches choice menu */}
                <div className={`choices ${showChoices && !isLoadingComment ? '' : 'hidden-el'}`} id="choices">
                  {activeScene.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      className={`switch ${chosenId === idx ? 'chosen' : ''} ${chosenId !== null && chosenId !== idx ? 'faded' : ''}`}
                      disabled={chosenId !== null}
                      onClick={() => handleChoice(choice, idx)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>

                {/* status metrics footer */}
                <div className={`status-bar ${activeScene.noStatusBar ? 'hidden' : ''}`} id="statusBar">
                  <span>O2: <b id="o2Val" className={oxygen < 30 ? 'blink-danger' : ''}>{oxygen}%</b></span>
                  <span className={hullStatus === 'CRITICAL' ? 'hull-critical' : ''}>HULL: <b id="hullVal">{hullStatus}</b></span>
                  <span>PORT: <b id="timeVal">{timeToPort}</b></span>
                  <span>SESSION: <b>KESSLER-07</b></span>
                </div>
              </div>
            )}

            {/* ENDING CARD VIEW */}
            {isEnding && (
              <div className="ending-screen" id="endingScreen" style={{ display: 'flex' }}>
                <div 
                  className="ending-ring" 
                  id="endingRing"
                  style={{ borderColor: endingColor, filter: `drop-shadow(0 0 24px ${endingColor})` }}
                ></div>
                
                {isLoadingEnding ? (
                  <div className="ending-text font-mono flex items-center justify-center gap-2 text-md">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-t-transparent border-[#39ff88] rounded-full"></span>
                    SYNTHESIZING PERSONALIZED LOGS...
                  </div>
                ) : (
                  <div className="ending-text" id="endingText">
                    {displayedText}
                    {isTyping && <span className="cursor"></span>}
                  </div>
                )}

                {!isLoadingEnding && (
                  <button className="restart" id="restartBtn" onClick={handleRestart}>
                    ◀ RUN DIAGNOSTIC AGAIN
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
