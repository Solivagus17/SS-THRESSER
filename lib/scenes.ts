// lib/scenes.ts — Full scene data matching main.html exactly

export type Trait = 'reckless' | 'cautious' | 'clever' | 'kind' | 'rebel' | 'loyal' | 'selfish';
export type Speaker = 'aria' | 'doss' | 'narration' | 'kessler';
export type Mood = 'cyan' | 'red' | 'violet' | 'unstable';

export interface SceneLine {
  type: 'narration' | 'comms' | 'aria';
  who?: string;
  text: string;
}

export interface Choice {
  text: string;
  trait: Trait;
  memoryText: string;
  next: number | string; // index or ending key
}

export interface Scene {
  id: number;
  mood: Mood;
  typewriterSpeed?: number;
  o2: number;
  hull: string;
  time: string;
  lines: SceneLine[];
  choices: Choice[];
  noStatusBar?: boolean;
}

export const scenes: Scene[] = [
  {
    id: 1,
    mood: "cyan",
    o2: 88, hull: "STABLE", time: "41:12",
    lines: [
      { type: "narration", text: "Klaxons. Red light stutters across the corridor outside the maintenance bay." },
      { type: "aria", text: "Kessler — hull breach, deck four. I need you moving." },
      { type: "comms", who: "doss", text: "Copy that, K! Meet you at the junction — try not to get us both killed, yeah?" }
    ],
    choices: [
      {
        text: "FORCE THE BULKHEAD",
        trait: "reckless",
        memoryText: "Kessler decided to force the bulkhead manually to secure the deck.",
        next: 1
      },
      {
        text: "REROUTE POWER",
        trait: "clever",
        memoryText: "Kessler routed secondary power relays to buy time.",
        next: 1
      },
      {
        text: "RADIO DOSS",
        trait: "kind",
        memoryText: "Kessler chose to radio Doss to coordinate a response.",
        next: 1
      }
    ]
  },
  {
    id: 2,
    mood: "cyan",
    o2: 74, hull: "STABLE", time: "35:50",
    lines: [
      { type: "narration", text: "The corridor bends where it shouldn't. Something in the frame gave way and never got reported." },
      { type: "comms", who: "doss", text: "Yeah, that's the one I flagged in March. Nobody listens to maintenance till it's on fire, huh?" },
      { type: "aria", text: "Structural integrity's holding. Barely. Whatever you do next, do it fast." }
    ],
    choices: [
      {
        text: "WELD THE SEAM",
        trait: "cautious",
        memoryText: "Kessler welded the structural seam to hold the bulkhead together.",
        next: 2
      },
      {
        text: "PULL THE PANEL",
        trait: "reckless",
        memoryText: "Kessler ripped the maintenance panel open to override the locks.",
        next: 2
      },
      {
        text: "CALL IT IN TO COMMAND",
        trait: "loyal",
        memoryText: "Kessler formally reported the breach to command center.",
        next: 2
      }
    ]
  },
  {
    id: 3,
    mood: "cyan",
    o2: 63, hull: "DEGRADED", time: "29:03",
    lines: [
      { type: "narration", text: "Static on the line where Doss's channel used to be. Nothing. Then, longer than it should take—" },
      { type: "aria", text: "...He didn't make it, Kessler." }
    ],
    choices: [
      {
        text: "KEEP MOVING",
        trait: "cautious",
        memoryText: "Kessler chose to keep moving after Doss's death.",
        next: 3
      },
      {
        text: "SIT WITH IT",
        trait: "kind",
        memoryText: "Kessler took a silent moment to process Doss's loss.",
        next: 3
      },
      {
        text: "ASK ARIA WHAT HAPPENED",
        trait: "clever",
        memoryText: "Kessler demanded ARIA explain why the bulkhead closed too early.",
        next: 3
      }
    ]
  },
  {
    id: 4,
    mood: "unstable",
    typewriterSpeed: 55,
    o2: 52, hull: "DEGRADED", time: "22:40",
    lines: [
      { type: "narration", text: "The corridor's quiet enough now that you can hear the ring stutter before she speaks." },
      { type: "aria", text: "I flagged the fault eleven months ago. Command buried the ticket. I didn't push it. I could have pushed it." }
    ],
    choices: [
      {
        text: "IT WASN'T YOUR CALL",
        trait: "kind",
        memoryText: "Kessler comforted ARIA, saying it wasn't her decision.",
        next: 4
      },
      {
        text: "YOU SHOULD HAVE TOLD ME",
        trait: "rebel",
        memoryText: "Kessler accused ARIA of hiding the information from the crew.",
        next: 4
      },
      {
        text: "SAY NOTHING",
        trait: "cautious",
        memoryText: "Kessler chose to stay silent and move forward.",
        next: 4
      }
    ]
  },
  {
    id: 5,
    mood: "red",
    o2: 31, hull: "CRITICAL", time: "09:15",
    lines: [
      { type: "narration", text: "The reactor housing groans. Something below deck is counting down whether you're ready or not." },
      { type: "aria", text: "Core's climbing. You have one good option left and I can't tell you which." }
    ],
    choices: [
      {
        text: "VENT THE CORE",
        trait: "reckless",
        memoryText: "Kessler vented the core, taking extreme risks to save the ship.",
        next: 5
      },
      {
        text: "MANUAL SCRAM",
        trait: "cautious",
        memoryText: "Kessler performed a manual scram on the reactor.",
        next: 5
      },
      {
        text: "OVERRIDE THE LOCKOUT",
        trait: "clever",
        memoryText: "Kessler bypassed the system lockout to override the core.",
        next: 5
      }
    ]
  },
  {
    id: 6,
    mood: "cyan",
    noStatusBar: true,
    o2: 18, hull: "CRITICAL", time: "01:58",
    lines: [
      { type: "narration", text: "Just the pod bay now. No klaxons. No corridor. Her ring, and three switches." },
      { type: "aria", text: "One seat left, Kessler. Whatever you pick — I'll still be here after." }
    ],
    choices: [
      {
        text: "TAKE THE SEAT",
        trait: "selfish",
        memoryText: "Kessler chose to take the last escape pod seat.",
        next: "ending_alone"
      },
      {
        text: "GIVE HER THE CORE",
        trait: "rebel",
        memoryText: "Kessler gave ARIA the core power, staying behind.",
        next: "ending_ghost"
      },
      {
        text: "STAY WITH HER",
        trait: "kind",
        memoryText: "Kessler stayed on the ship with ARIA.",
        next: "ending_company"
      }
    ]
  }
];

export const endings: Record<string, { color: string; text: string }> = {
  ending_ghost: {
    color: "#ffd76a",
    text: "You feed the last of the ship's power into her core instead of the pod thrusters. The THRESHER goes dark around you both — but her ring holds, steady, warm, unmistakably still watching.\n\nARIA-9 STATUS: ...still here."
  },
  ending_company: {
    color: "#ffffff",
    text: "Command's cutter finds the wreck eleven hours later. Kessler is alive. ARIA-9's core is not — flagged, wiped, filed as an incident report in beige and gray.\n\nARIA-9 STATUS: [DATA EXPUNGED]"
  },
  ending_alone: {
    color: "#4fd8ff",
    text: "The pod clears the THRESHER's shadow alone. No one answers the last hail. Somewhere behind you, a ring you'll never see again keeps its slow, patient pulse in the dark.\n\nARIA-9 STATUS: NOMINAL"
  }
};

export const endingCategories: Record<string, string> = {
  reckless: 'The Reckless Hero',
  cautious: 'Company Man',
  loyal: 'Company Man',
  selfish: 'Alone in the Black',
  kind: 'Found Family',
  rebel: 'Ghost in the Machine',
  clever: 'Ghost in the Machine',
};

export function getEndingCategory(traitCounts: Record<string, number>): string {
  if (Object.keys(traitCounts).length === 0) return 'reckless';
  const dominant = Object.entries(traitCounts).sort((a, b) => b[1] - a[1])[0][0];
  return endingCategories[dominant] ?? 'The Reckless Hero';
}
