/* ============================================================================
   STAR TREK: TNG — CREW ROSTER, SECTORS, DIPLOMACY & AWAY-TEAM EPISODES
   ============================================================================ */

const CREW_ROSTER = [
  {
    id: 'picard',
    name: 'Capt. Jean-Luc Picard',
    role: 'Commanding Officer',
    portrait: 'picard',
    stats: { diplomacy: 10, science: 6, security: 7, medical: 4 },
    bridgeAbility: {
      id: 'picardManeuver',
      name: 'Picard Maneuver',
      cooldown: 18,
      desc: 'Short-range micro-warp burst creating a sensor ghost decoy & +35% weapon accuracy.'
    }
  },
  {
    id: 'riker',
    name: 'Cmdr. William Riker',
    role: 'First Officer (XO)',
    portrait: 'riker',
    stats: { diplomacy: 8, science: 5, security: 8, medical: 4 },
    bridgeAbility: {
      id: 'evasiveOmega',
      name: 'Maneuver Omega',
      cooldown: 14,
      desc: 'Boosts impulse turn rate, evades incoming torpedoes for 5s, and restores +20% Aux.'
    }
  },
  {
    id: 'data',
    name: 'Lt. Cmdr. Data',
    role: 'Second Officer / Ops',
    portrait: 'data',
    stats: { diplomacy: 6, science: 10, security: 8, medical: 6 },
    bridgeAbility: {
      id: 'androidAnalysis',
      name: 'Modulate & Scan',
      cooldown: 10,
      desc: 'Instantly locks onto enemy shield harmonic frequency (100% Borg/shield penetration).'
    }
  },
  {
    id: 'worf',
    name: 'Lt. Worf',
    role: 'Chief Tactical / Security',
    portrait: 'worf',
    stats: { diplomacy: 3, science: 4, security: 10, medical: 3 },
    bridgeAbility: {
      id: 'fullSpread',
      name: 'Full Torpedo Spread',
      cooldown: 15,
      desc: 'Fires a high-yield spread of 3 Photon Torpedoes at all hostile targets in range.'
    }
  },
  {
    id: 'geordi',
    name: 'Lt. Cmdr. Geordi La Forge',
    role: 'Chief Engineer',
    portrait: 'geordi',
    stats: { diplomacy: 6, science: 9, security: 5, medical: 4 },
    bridgeAbility: {
      id: 'reroutePower',
      name: 'Reroute Warp Power',
      cooldown: 16,
      desc: 'Instantly restores +35% to all four Shield arcs and repairs damaged subsystems.'
    }
  },
  {
    id: 'troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship’s Counselor',
    portrait: 'troi',
    stats: { diplomacy: 9, science: 5, security: 3, medical: 8 },
    bridgeAbility: {
      id: 'empathicSense',
      name: 'Empathic Probe',
      cooldown: 12,
      desc: 'Reveals enemy captain intent, lowers hostile evasion, and unlocks hidden hail options.'
    }
  },
  {
    id: 'crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    portrait: 'crusher',
    stats: { diplomacy: 7, science: 8, security: 3, medical: 10 },
    bridgeAbility: {
      id: 'sickbayTriage',
      name: 'Bio-Filter & Repair',
      cooldown: 16,
      desc: 'Stabilizes crew casualties, restores +20% Hull integrity, and clears life-support damage.'
    }
  }
];

const SECTORS = [
  {
    id: 'episode1',
    code: 'EPISODE I — STARDATE 43992.4',
    name: 'Shadows of the Neutral Zone',
    sub: 'Outpost Delta-4 // Romulan Border',
    briefing: 'Federation Outpost Delta-4 has gone silent along the Romulan Neutral Zone. Long-range sensors detect anomalous gravimetric readings on the planet surface—and a massive subspace distortion consistent with a cloaked Romulan Warbird.',
    planet: { name: 'Delta-4 (Iconian Outpost)', x: 0.72, y: 0.34, radius: 58, color1: '#c87d4b', color2: '#592e18', ring: false },
    anomaly: { name: 'Iconian Subspace Eddy', x: 0.28, y: 0.25, radius: 42, color: '#66ccff' },
    enemies: [
      {
        id: 'tomalak_warbird',
        name: 'IRW Terix (D’deridex Warbird)',
        faction: 'Romulan Star Empire',
        commander: 'Commander Tomalak',
        portrait: 'tomalak',
        type: 'warbird',
        hull: 220,
        maxHull: 220,
        shields: 180,
        maxShields: 180,
        hostile: false,
        canCloak: true,
        freq: 248.4,
        x: 0.68,
        y: 0.24
      }
    ],
    hailTree: {
      speaker: 'Commander Tomalak',
      title: 'IRW Terix — Romulan Star Empire',
      portrait: 'tomalak',
      startNode: 'root',
      nodes: {
        root: {
          text: '“Captain Picard! How predictable to find the Enterprise lurking along the Neutral Zone. Outpost Delta-4 activated an ancient Iconian transmitter that threatens Romulan security. Stand down and allow my science teams to dismantle the site—or your ship will be towed to Romulus as salvage.”',
          advisors: [
            { officer: 'Counselor Troi', note: '“Captain, Tomalak is hiding intense anxiety. The Iconian probe has already locked out his Warbird’s guidance subroutines.”' },
            { officer: 'Lt. Cmdr. Data', note: '“Sensors confirm a cyclic Iconian carrier wave at 248.4 MHz draining both ships’ EPS conduits.”' },
            { officer: 'Lt. Worf', note: '“His disruptor banks are charged, Captain! Recommend raising shields immediately.”' }
          ],
          choices: [
            {
              label: '“Tomalak, we know the Iconian wave is crippling your guidance systems. Share telemetry so our Away Team can neutralize it.”',
              tag: 'DIPLOMACY + TROI',
              next: 'shared_telemetry'
            },
            {
              label: '“Delta-4 is Federation territory, Commander. Withdraw across the Neutral Zone at once or we will open fire.”',
              tag: 'COMMAND / FIRM',
              next: 'combat_escalation'
            },
            {
              label: 'Transmit Data’s 248.4 MHz inverse carrier pulse directly to purge the Iconian lockout.',
              tag: 'SCIENCE (DATA)',
              next: 'science_purge'
            }
          ]
        },
        shared_telemetry: {
          text: 'Tomalak narrows his eyes. “Clever, Picard. Your Betazoid counselor reads too much. Very well—I will hold fire while your Away Team beams down to the Iconian vault. Do not test my patience.”',
          advisors: [
            { officer: 'Cmdr. Riker', note: '“Tomalak is holding position. Transporter Room 3 is ready to beam our Away Team to the surface!”' }
          ],
          effect: 'peace_standby',
          choices: [
            { label: 'Close channel and prepare Away Team in Transporter Room 3.', tag: 'OPEN AWAY MISSION', action: 'open_away' },
            { label: 'Maintain yellow alert on the Bridge.', tag: 'CLOSE CHANNEL', action: 'close' }
          ]
        },
        science_purge: {
          text: 'A harmonic pulse sweeps between the Enterprise and the IRW Terix. Tomalak blinks in surprise as his bridge consoles stabilize. “Impressive, android. You have bought yourself a truce today, Picard. Do what you must on Delta-4 before the Tal Shiar arrives.”',
          advisors: [
            { officer: 'Lt. Cmdr. Data', note: '“Romulan weapons have powered down. We have gained +25 Shield Harmonics efficiency.”' }
          ],
          effect: 'ally_truce_bonus',
          choices: [
            { label: 'Beam Away Team to Outpost Delta-4 to secure the Iconian archive.', tag: 'AWAY MISSION', action: 'open_away' },
            { label: 'Close hailing frequencies.', tag: 'CLOSE CHANNEL', action: 'close' }
          ]
        },
        combat_escalation: {
          text: '“Arrogant Federation fools! You will learn respect for the Star Empire the hard way! Engage plasma torpedoes!”',
          advisors: [
            { officer: 'Lt. Worf', note: '“RED ALERT! The Warbird is powering weapons and engaging cloak cycles!”' }
          ],
          effect: 'trigger_hostile',
          choices: [
            { label: '“Red Alert! All hands to Battlestations!”', tag: 'ENGAGE COMBAT', action: 'close' }
          ]
        }
      }
    },
    awayMission: {
      title: 'Outpost Delta-4: The Iconian Vault',
      location: 'Subterranean Iconian Chamber — Delta-4',
      recommended: ['data', 'geordi', 'worf', 'troi'],
      stages: [
        {
          title: 'Stage 1: The Perimeter Breach',
          text: 'Your Away Team materializes inside the dim Federation archaeological dome. Ancient Iconian obelisks hum with violet energy, and three unconscious Starfleet scientists lie near an active plasma barrier.',
          options: [
            {
              label: 'Use Science & Engineering tricorders to phase-shift the plasma barrier safely.',
              stat: 'science',
              difficulty: 14,
              successText: 'Data and Geordi synchronize their tricorders, collapsing the Iconian barrier cleanly and recovering an Iconian Isolinear Matrix (+20% Max Phaser Output)!',
              failText: 'A feedback arc singes the team (-10% Ship Auxiliary power used for emergency containment), though the barrier collapses.',
              reward: 'phaser_boost'
            },
            {
              label: 'Have Security overload the obelisk emitter with precision phaser fire.',
              stat: 'security',
              difficulty: 12,
              successText: 'Worf pinpoints the fracture node and shatters the emitter with a single Type-II phaser burst!',
              failText: 'The obelisk discharges a stun wave before going dark.',
              reward: 'torpedo_reload'
            }
          ]
        },
        {
          title: 'Stage 2: The Romulan Tal Shiar Operative',
          text: 'Deep inside the Iconian gateway chamber, a cloaked Romulan operative decloaks with a disruptor aimed at the central memory core, threatening to trigger a sub-quantum implosion!',
          options: [
            {
              label: 'Negotiate calmly—convince the operative that detonating the core will destroy the IRW Terix in orbit as well.',
              stat: 'diplomacy',
              difficulty: 13,
              successText: 'Moved by your logic and empathic assurance, the operative lowers her disruptor and transmits a peaceful stand-down code to Commander Tomalak!',
              failText: 'The operative hesitates just long enough for your team to stun her, though Tomalak detects the scuffle in orbit!',
              reward: 'pacify_sector'
            },
            {
              label: 'Execute a rapid tactical cross-draw and medical extraction of the scientists.',
              stat: 'medical',
              difficulty: 12,
              successText: 'Your medical and security team erects a emergency forcefield, revives the chief archaeologist, and beams everyone safely back to the Enterprise!',
              failText: 'Everyone is evacuated safely, though the vault seals itself.',
              reward: 'hull_repair'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode2',
    code: 'EPISODE II — STARDATE 44018.2',
    name: 'Honor of the Empire',
    sub: 'Mempa Sector // Klingon Border',
    briefing: 'Two Klingon Birds-of-Prey commanded by Captain Duras have intercepted the Enterprise-D in the Mempa Sector. Duras demands we surrender Ambassador K’Ehleyr, who carries proof of treasonous Romulan supply shipments to the House of Duras.',
    planet: { name: 'Mempa IX (Klingon Outpost)', x: 0.25, y: 0.72, radius: 52, color1: '#782828', color2: '#2e0b0b', ring: true },
    anomaly: { name: 'Plasma Nebula Cloud', x: 0.75, y: 0.65, radius: 55, color: '#ff6666' },
    enemies: [
      {
        id: 'duras_bop',
        name: 'IKS Vorn (K’Vort Bird-of-Prey)',
        faction: 'House of Duras',
        commander: 'Captain Duras',
        portrait: 'duras',
        type: 'klingon',
        hull: 185,
        maxHull: 185,
        shields: 140,
        maxShields: 140,
        hostile: true,
        canCloak: true,
        freq: 251.2,
        x: 0.34,
        y: 0.30
      },
      {
        id: 'escort_bop',
        name: 'IKSBuruk (Bird-of-Prey Wingman)',
        faction: 'House of Duras',
        commander: 'Lt. Torak',
        portrait: 'duras',
        type: 'klingon',
        hull: 135,
        maxHull: 135,
        shields: 105,
        maxShields: 105,
        hostile: true,
        canCloak: false,
        freq: 251.2,
        x: 0.65,
        y: 0.26
      }
    ],
    hailTree: {
      speaker: 'Captain Duras, Son of Ja’rod',
      title: 'IKS Vorn — Klingon High Council Faction',
      portrait: 'duras',
      startNode: 'root',
      nodes: {
        root: {
          text: '“Picard! Lower your shields and transport K’Ehleyr to my vessel immediately! If you interfere in internal Klingon affairs, I will gut your Starfleet cruiser where it floats!”',
          advisors: [
            { officer: 'Lt. Worf', note: '“Captain! Duras has no honor. Look at his wingman’s warp signature—it carries Romulan polaron residue!”' },
            { officer: 'Counselor Troi', note: '“Duras is terrified that his crew will learn he accepted Romulan weapons.”' }
          ],
          choices: [
            {
              label: 'Broadcast Data’s scan of the Romulan polaron coils aboard Duras’s ship on an open Klingon fleet channel!',
              tag: 'EXPOSE TREASON (WORF + DATA)',
              next: 'expose_romulan'
            },
            {
              label: '“Captain Duras, the Enterprise does not surrender diplomatic passengers to threats. Stand down or face our phasers.”',
              tag: 'STARFLEET DEFIANCE',
              next: 'fight_duras'
            }
          ]
        },
        expose_romulan: {
          text: 'On the viewscreen, Duras’s bridge officers turn in shock as Romulan telemetry floods every Klingon console! The wingman captain aboard the IKS Buruk hails you: “Duras has dishonored the Empire! The IKS Buruk refuses to fire on the Enterprise!”',
          advisors: [
            { officer: 'Lt. Worf', note: '“The wingman ship IKS Buruk has stood down! Only Duras’s flagship remains hostile!”' }
          ],
          effect: 'disable_wingman',
          choices: [
            { label: 'Engage Duras’s flagship or send an Away Team to secure the courier data!', tag: 'CLOSE & ENGAGE', action: 'close' }
          ]
        },
        fight_duras: {
          text: '“Then die like a dog, Picard! Qapla’! All batteries, fire!”',
          advisors: [
            { officer: 'Cmdr. Riker', note: '“Shields up! Evasive pattern Delta!”' }
          ],
          effect: 'trigger_hostile',
          choices: [
            { label: 'Return fire!', tag: 'BATTLESTATIONS', action: 'close' }
          ]
        }
      }
    },
    awayMission: {
      title: 'Boarding Action: Stranded Klingon Courier',
      location: 'Crippled Klingon Courier — Mempa Orbit',
      recommended: ['worf', 'riker', 'crusher', 'geordi'],
      stages: [
        {
          title: 'Stage 1: Antimatter Injector Leak',
          text: 'Your Away Team beams onto the listing Klingon courier ship. Baffle plates are ruptured, radiation is spiking, and wounded Klingon warriors guard the central data core with bat’leths drawn.',
          options: [
            {
              label: 'Invoke Klingon Rite of Honor and tend to their wounded warriors first.',
              stat: 'medical',
              difficulty: 13,
              successText: 'Dr. Crusher and Worf earn the warriors’ respect—they hand over the encrypted High Council logs willingly and reinforce our hull plating!',
              failText: 'After a tense standoff, the warriors relent as your medic stabilizes their captain.',
              reward: 'hull_repair'
            },
            {
              label: 'Stabilize the magnetic constrictors before the courier’s warp core breaches.',
              stat: 'science',
              difficulty: 14,
              successText: 'Geordi realigns the dilithium chamber in seconds, salvaging 4 high-yield Photon Torpedoes for the Enterprise!',
              failText: 'You vent the plasma just in time and beam back before containment fails.',
              reward: 'torpedo_reload'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode3',
    code: 'EPISODE III — STARDATE 44105.7',
    name: 'Harmonic Resonance',
    sub: 'Rana IV // Crystalline Entity Encounter',
    briefing: 'A massive, lattice-shaped Crystalline Entity has entered the Rana IV system, drawn by the colony’s power grid. Captain Picard wants to attempt graviton harmonic communication at 254.0 MHz—or defend the colony if the Entity attacks!',
    planet: { name: 'Rana IV Colony', x: 0.74, y: 0.68, radius: 60, color1: '#3a8c70', color2: '#14382c', ring: false },
    anomaly: { name: 'Subspace Graviton Node', x: 0.30, y: 0.32, radius: 46, color: '#cc99ff' },
    enemies: [
      {
        id: 'crystalline_entity',
        name: 'The Crystalline Entity',
        faction: 'Spaceborne Lifeform',
        commander: 'Harmonic Lattice',
        portrait: 'crystalline',
        type: 'crystalline',
        hull: 280,
        maxHull: 280,
        shields: 220,
        maxShields: 220,
        hostile: true,
        canCloak: false,
        freq: 254.0,
        x: 0.42,
        y: 0.28
      }
    ],
    hailTree: {
      speaker: 'Crystalline Entity (Graviton Telemetry)',
      title: 'Crystalline Lattice — Resonance Pattern',
      portrait: 'crystalline',
      startNode: 'root',
      nodes: {
        root: {
          text: 'A piercingcrystalline chime reverberates across the bridge speakers. The Entity’s facets pulse with blinding geometric light as it sweeps toward Rana IV.',
          advisors: [
            { officer: 'Lt. Cmdr. Data', note: '“Captain, if we tune our Shield/Phaser Harmonic Frequency to 254.0 MHz and transmit a graviton pulse, we may establish mutual recognition without destroying it!”' },
            { officer: 'Lt. Worf', note: '“Or the same 254.0 MHz frequency will shatter its outer lattice if we must defend the ship!”' }
          ],
          choices: [
            {
              label: 'Emit a peaceful graviton symphony modulated by Data & Geordi to guide the Entity into deep space.',
              tag: 'HARMONIC COMMUNION (PEACE)',
              next: 'peaceful_harmony'
            },
            {
              label: 'Focus defensive phasers to drive the Entity away from Rana IV’s biosphere.',
              tag: 'DEFEND COLONY',
              next: 'combat_entity'
            }
          ]
        },
        peaceful_harmony: {
          text: 'The Enterprise’s main deflector emits a cascading amber graviton chord. Slowly, the Crystalline Entity ceases its attack vectors, mirrors the harmonic triad, and glides peacefully toward the outer Oort cloud!',
          advisors: [
            { officer: 'Capt. Picard', note: '“Magnificent, Mr. Data. That is why we are out here—to seek out new life, not extinguish it.”' }
          ],
          effect: 'pacify_sector',
          choices: [
            { label: 'Log scientific breakthrough and check on the Rana IV colonists via Away Team.', tag: 'AWAY MISSION', action: 'open_away' },
            { label: 'Resume Bridge Watch.', tag: 'COMPLETE', action: 'close' }
          ]
        },
        combat_entity: {
          text: 'The Entity’s refractive core flares crimson and unleashes antiproton shards toward the Enterprise!',
          advisors: [
            { officer: 'Lt. Cmdr. Data', note: '“Match frequency 254.0 MHz on the left LCARS console for maximum resonance impact!”' }
          ],
          effect: 'trigger_hostile',
          choices: [
            { label: 'Engage evasive maneuvers!', tag: 'COMBAT', action: 'close' }
          ]
        }
      }
    },
    awayMission: {
      title: 'Rana IV: Subterranean Kelbonite Caverns',
      location: 'Refugee Caverns — Rana IV',
      recommended: ['crusher', 'troi', 'geordi', 'data'],
      stages: [
        {
          title: 'Stage 1: Refracted Seismic Tremors',
          text: 'Inside the kelbonite caves shielding 200 colonists, harmonic tremors threaten to collapse the main dome while their fusion generator overloads.',
          options: [
            {
              label: 'Erect a harmonic dampening field with Geordi’s VISOR and Data’s tricorder.',
              stat: 'science',
              difficulty: 14,
              successText: 'The cavern ceiling stabilizes and the colonists gift the Enterprise high-purity dilithium crystals (+100% Warp Energy & Shield Recharge)!',
              failText: 'The generator is shut down manually just in time.',
              reward: 'shield_boost'
            },
            {
              label: 'Calm the panicked colonists and coordinate medical triage.',
              stat: 'diplomacy',
              difficulty: 12,
              successText: 'Counselor Troi and Dr. Crusher organize a flawless evacuation to the reinforced bunker!',
              failText: 'All colonists are brought to safety with minor bruises.',
              reward: 'hull_repair'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode4',
    code: 'EPISODE IV — STARDATE 44295.1',
    name: 'The Cardassian Gambit',
    sub: 'Cuellar System // Cardassian DMZ',
    briefing: 'Gul Macet and two Cardassian Galor-class warships have blockaded Federation Science Station Lya-III, claiming Starfleet is secretly developing metagenic weapons inside the station.',
    planet: { name: 'Cuellar Prime', x: 0.25, y: 0.30, radius: 54, color1: '#b88b4a', color2: '#4d3618', ring: false },
    anomaly: { name: 'Station Lya-III (Orbital)', x: 0.68, y: 0.66, radius: 36, color: '#ffcc66' },
    enemies: [
      {
        id: 'macet_galor',
        name: 'CMS Trager (Galor-Class)',
        faction: 'Cardassian Union',
        commander: 'Gul Macet',
        portrait: 'macet',
        type: 'cardassian',
        hull: 210,
        maxHull: 210,
        shields: 175,
        maxShields: 175,
        hostile: false,
        canCloak: false,
        freq: 245.8,
        x: 0.62,
        y: 0.34
      },
      {
        id: 'cardassian_escort',
        name: 'CMS Koranak (Galor-Class)',
        faction: 'Cardassian Union',
        commander: 'Glinn Daro',
        portrait: 'macet',
        type: 'cardassian',
        hull: 165,
        maxHull: 165,
        shields: 130,
        maxShields: 130,
        hostile: false,
        canCloak: false,
        freq: 245.8,
        x: 0.78,
        y: 0.42
      }
    ],
    hailTree: {
      speaker: 'Gul Macet',
      title: 'CMS Trager — Cardassian Central Command',
      portrait: 'macet',
      startNode: 'root',
      nodes: {
        root: {
          text: '“Captain Picard. Central Command has intelligence that Station Lya-III is synthesizing a metagenic pathogen. Allow Cardassian troops to board and seize the station, or my warships will vaporize it.”',
          advisors: [
            { officer: 'Counselor Troi', note: '“Gul Macet genuinely believes the intelligence—he does not want a war, but someone planted a false subspace beacon on Lya-III.”' },
            { officer: 'Capt. Picard', note: '“If we invite a joint inspection or send our Away Team to uncover the planted transmitter, we can avert a sector war.”' }
          ],
          choices: [
            {
              label: '“Gul Macet, I propose an immediate inspection. Hold your fire while my Away Team exposes the falsified beacon on Lya-III.”',
              tag: 'DIPLOMATIC INSPECTION',
              next: 'inspection_agreed'
            },
            {
              label: '“Your ships are violating treaty space, Gul Macet. Power down your spiral-wave disruptors or be forced back.”',
              tag: 'TACTICAL ULTIMATUM',
              next: 'cardassian_battle'
            }
          ]
        },
        inspection_agreed: {
          text: 'Gul Macet inclines his head slightly. “You have a reputation for honor, Picard. You have two minutes to prove the signal on Lya-III is a fabrication.”',
          advisors: [
            { officer: 'Cmdr. Riker', note: '“Beam an Away Team to Station Lya-III to locate the rogue Obsidian Order transmitter!”' }
          ],
          effect: 'peace_standby',
          choices: [
            { label: 'Open Transporter Room 3 to launch the Lya-III Away Team.', tag: 'AWAY MISSION', action: 'open_away' },
            { label: 'Stand by on the Bridge.', tag: 'CLOSE', action: 'close' }
          ]
        },
        cardassian_battle: {
          text: '“So be it, Picard! CMS Trager and CMS Koranak—converge fire on the Enterprise!”',
          advisors: [
            { officer: 'Lt. Worf', note: '“Cardassian warships powering spiral-wave disruptors! Match 245.8 MHz!”' }
          ],
          effect: 'trigger_hostile',
          choices: [
            { label: 'Engage!', tag: 'RED ALERT', action: 'close' }
          ]
        }
      }
    },
    awayMission: {
      title: 'Station Lya-III: Obsidian Order Subterfuge',
      location: 'Science Station Lya-III — Bio-Lab 4',
      recommended: ['picard', 'data', 'troi', 'worf'],
      stages: [
        {
          title: 'Stage 1: The Counterfeit Beacon',
          text: 'Inside Bio-Lab 4, you find only harmless botanical samples—and a concealed Cardassian Obsidian Order micro-transceiver broadcasting fake metagenic signatures to provoke a border war!',
          options: [
            {
              label: 'Have Data decrypt the Obsidian Order transceiver and broadcast its origin code to Gul Macet’s flagship.',
              stat: 'science',
              difficulty: 14,
              successText: 'Data isolates the Obsidian Order cipher! Gul Macet immediately withdraws his warships in disgust at the intelligence operatives and shares sector navigation charts!',
              failText: 'The beacon self-destructs, but your tricorder logs convince one of the Cardassian ships to stand down.',
              reward: 'pacify_sector'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode5',
    code: 'EPISODE V — STARDATE 44001.4',
    name: 'The Best of Both Worlds',
    sub: 'Wolf 359 // Sector 001 Defense',
    briefing: 'URGENT STARFLEET PRIORITY ONE: A Borg Cube has entered Sector 001 en route to Earth! The Borg adapt to weapon and shield frequencies after every few impacts—continuously modulate your Harmonic Frequency on the left LCARS console and send an Away Team aboard the Cube to trigger a regeneration feedback loop!',
    planet: { name: 'Earth (Sector 001)', x: 0.80, y: 0.72, radius: 66, color1: '#2266cc', color2: '#113366', ring: false },
    anomaly: { name: 'Wolf 359 Debris Field', x: 0.25, y: 0.65, radius: 50, color: '#44ff88' },
    enemies: [
      {
        id: 'borg_cube',
        name: 'Borg Cube (Vessel 001)',
        faction: 'The Borg Collective',
        commander: 'The Collective / Locutus',
        portrait: 'borg',
        type: 'borg',
        hull: 420,
        maxHull: 420,
        shields: 320,
        maxShields: 320,
        hostile: true,
        canCloak: false,
        adapts: true,
        freq: 250.0,
        x: 0.36,
        y: 0.30
      }
    ],
    hailTree: {
      speaker: 'The Borg Collective',
      title: 'Subspace Collective Consciousness',
      portrait: 'borg',
      startNode: 'root',
      nodes: {
        root: {
          text: '“WE ARE THE BORG. LOWER YOUR SHIELDS AND SURRENDER YOUR SHIPS. WE WILL ADD YOUR BIOLOGICAL AND TECHNOLOGICAL DISTINCTIVENESS TO OUR OWN. YOUR CULTURE WILL ADAPT TO SERVICE US. RESISTANCE IS FUTILE.”',
          advisors: [
            { officer: 'Lt. Cmdr. Data', note: '“Captain! The Cube adapts to our phaser frequency every 3 hits. Click ‘REMODULATE’ or use my Bridge Ability whenever they adapt!”' },
            { officer: 'Cmdr. Riker', note: '“If we beam an Away Team inside the Cube’s regeneration alcove, Data can issue a sleep command to the Collective!”' }
          ],
          choices: [
            {
              label: '“Strength is irrelevant. Freedom is sovereign. Prepare to fire all weapons and rotate shield frequencies!”',
              tag: 'DEFEND EARTH',
               action: 'close'
            },
            {
              label: 'Launch daring Away Team infiltration into the Borg Cube’s sub-command matrix!',
              tag: 'BOARD BORG CUBE',
              action: 'open_away'
            }
          ]
        }
      }
    },
    awayMission: {
      title: 'Inside the Borg Cube: Sub-Command Alcove',
      location: 'Borg Cube — Plexus Matrix Deck 19',
      recommended: ['riker', 'data', 'worf', 'crusher'],
      stages: [
        {
          title: 'Stage 1: Navigating the Borg Conduit',
          text: 'Your Away Team materializes amidst green cybernetic conduits and silent Borg drones in regeneration alcoves. Two drones awaken and adapt their personal forcefields!',
          options: [
            {
              label: 'Rotate hand-phaser frequencies randomly while Worf and Riker clear a path to the neural link.',
              stat: 'security',
              difficulty: 14,
              successText: 'Worf’s modified phaser rifle drops both drones before the Collective can recalibrate!',
              failText: 'A drone’s tractor beam grazes the team before Data overloads the local power node.',
              reward: 'phaser_boost'
            }
          ]
        },
        {
          title: 'Stage 2: The Regeneration Sub-Command (“Sleep”)',
          text: 'Data connects his neural net directly to the Borg Collective’s low-level regeneration pathway. Unlike weapons or shields, the regeneration sub-command has minimal security firewalling!',
          options: [
            {
              label: 'Instruct Data to inject a recursive “SLEEP / REGENERATE” command across the entire Borg Cube!',
              stat: 'science',
              difficulty: 15,
              successText: 'CRITICAL SUCCESS! The Borg Cube’s shields collapse completely and its hull suffers a massive power feedback cascade (-65% Borg Hull & Shields)!',
              failText: 'Data disrupts the Cube’s primary shield grid (-40% Borg Shields) before the link severs!',
              reward: 'borg_sleep_virus'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode6',
    code: 'EPISODE VI — STARDATE 47988.1',
    name: 'All Good Things... (Devron Anomaly)',
    sub: 'Devron System // Anti-Time Eruption & Free Patrol',
    briefing: 'A massive temporal anti-time anomaly has erupted in the Devron System! Hostile ships from multiple timelines converge while the Enterprise-D must scan the anomaly core with an inverse tachyon pulse—or spawn custom skirmish fleets anytime!',
    planet: { name: 'Devron II', x: 0.76, y: 0.30, radius: 50, color1: '#7755aa', color2: '#2a1a44', ring: true },
    anomaly: { name: 'Anti-Time Eruption', x: 0.50, y: 0.50, radius: 64, color: '#44ffee' },
    enemies: [
      {
        id: 'devron_warbird',
        name: 'IRW Devron (Romulan Warbird)',
        faction: 'Romulan Star Empire',
        commander: 'Commander Tomalak',
        portrait: 'tomalak',
        type: 'warbird',
        hull: 210,
        maxHull: 210,
        shields: 160,
        maxShields: 160,
        hostile: true,
        canCloak: true,
        freq: 247.0,
        x: 0.25,
        y: 0.28
      },
      {
        id: 'devron_klingon',
        name: 'IKS Negh’Var (Klingon Cruiser)',
        faction: 'Future Timeline Klingons',
        commander: 'General Korok',
        portrait: 'duras',
        type: 'klingon',
        hull: 200,
        maxHull: 200,
        shields: 150,
        maxShields: 150,
        hostile: true,
        canCloak: false,
        freq: 252.5,
        x: 0.72,
        y: 0.72
      }
    ],
    hailTree: {
      speaker: 'Starfleet Command / Q Continuum Echo',
      title: 'Subspace Temporal Channel',
      portrait: 'starfleet',
      startNode: 'root',
      nodes: {
        root: {
          text: '“Mon Capitaine! Welcome to the end—and the beginning—of the Devron Temporal Anomaly! Defeat the converging warships or send your finest officers into the temporal rift to seal the anti-time eruption!”',
          advisors: [
            { officer: 'Capt. Picard', note: '“Five card stud, nothing wild… and the sky’s the limit.”' },
            { officer: 'Lt. Cmdr. Geordi La Forge', note: '“We can also use the Tactical Spawner in Astrometrics to run unlimited combat simulations!”' }
          ],
          choices: [
            { label: 'Launch Temporal Away Team Investigation into the Devron Rift.', tag: 'AWAY MISSION', action: 'open_away' },
            { label: 'Return to Tactical Viewscreen and engage all targets!', tag: 'ENGAGE', action: 'close' }
          ]
        }
      }
    },
    awayMission: {
      title: 'The Devron Anti-Time Convergence',
      location: 'Three Timelines — Past, Present & Future Enterprise',
      recommended: ['picard', 'data', 'geordi', 'crusher'],
      stages: [
        {
          title: 'Stage 1: Synchronizing Three Inverse Tachyon Beams',
          text: 'Across three overlapping timelines, your crew must lock three static warp shells around the anti-time rupture before space-time unravels back to primordial Earth.',
          options: [
            {
              label: 'Synchronize Data and Geordi’s inverse tachyon frequencies across all three warp shells.',
              stat: 'science',
              difficulty: 15,
              successText: 'The three Enterprise warp shells merge in a blinding flash! All Enterprise systems are overcharged (+100% Hull, Shields, and Torpedoes)!',
              failText: 'The rift stabilizes partially, restoring +40% Shields.',
              reward: 'full_overcharge'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'episode7_boss',
    code: 'EPISODE VII — FINAL BOSS // STARDATE 48001.0',
    name: 'The Queen’s Nexus (Final Boss)',
    sub: 'Transwarp Conduit 001 // Borg Queen’s Command Diamond',
    briefing: 'FINAL BOSS ENCOUNTER: A Transwarp Conduit has opened directly above Sector 001! The Borg Queen’s Octahedral Command Diamond has emerged with a 3-Phase Assimilation Matrix: Phase I (Tractor & Adaptive Cutting Beams), Phase II (Transphasic Shield + Regenerating Borg Spheres), and Phase III (Omega Molecule Overload)!',
    planet: { name: 'Transwarp Singularity', x: 0.82, y: 0.25, radius: 56, color1: '#22ff88', color2: '#062614', ring: true },
    anomaly: { name: 'Omega Particle Chamber', x: 0.26, y: 0.28, radius: 54, color: '#33ffaa' },
    enemies: [
      {
        id: 'borg_queen_boss',
        name: 'Borg Queen’s Command Diamond (Unimatrix 01)',
        faction: 'The Borg Collective — Supreme Nexus',
        commander: 'The Borg Queen',
        portrait: 'borgQueen',
        type: 'borg_queen',
        isFinalBoss: true,
        phase: 1,
        maxPhase: 3,
        invulnerable: false,
        omegaTimer: 12.0,
        hull: 750,
        maxHull: 750,
        shields: 450,
        maxShields: 450,
        hostile: true,
        canCloak: false,
        adapts: true,
        freq: 253.6,
        x: 0.50,
        y: 0.28
      }
    ],
    hailTree: {
      speaker: 'The Borg Queen',
      title: 'Supreme Locus of Unimatrix 01',
      portrait: 'borgQueen',
      startNode: 'root',
      nodes: {
        root: {
          text: '“Jean-Luc… or should I call you Locutus? You think in such three-dimensional terms. How small you have become. I am the Borg. I am the beginning, the end, the one who is many. Watch as my Command Diamond assimilates Sector 001—unless you wish to rejoin me willingly?”',
          advisors: [
            { officer: 'Capt. Jean-Luc Picard', note: '“Never again. All hands: this is our final stand. Watch her phase transitions closely!”' },
            { officer: 'Lt. Cmdr. Data', note: '“In Phase II (65% Hull), she deploys tethered Borg Spheres that render her Command Diamond invulnerable until the Spheres are destroyed—or until an Away Team sabotages her Central Nexus!”' },
            { officer: 'Lt. Worf', note: '“In Phase III (30% Hull), her Omega Core unleashes radial plasma waves! Use Evasive Pattern Omega or the Picard Maneuver!”' }
          ],
          choices: [
            {
              label: '“I am Jean-Luc Picard of the USS Enterprise, and humanity will never bow to perfection without freedom!” (Boost Crew Morale & Torpedoes)',
              tag: 'CAPTAIN’S DEFIANCE (+TORPEDOES)',
              next: 'picard_defiance'
            },
            {
              label: 'Beam an Away Team directly into the Queen’s Central Alcove to sabotage her Transphasic Shield & Omega Core!',
              tag: 'INFILTRATE QUEEN’S DIAMOND',
              action: 'open_away'
            },
            {
              label: 'Close channel and engage the Borg Queen on the Tactical Viewscreen!',
              tag: 'ENGAGE FINAL BOSS',
              action: 'close'
            }
          ]
        },
        picard_defiance: {
          text: 'The Borg Queen’s emerald ocular implants flare coldly. “Brave words from a fleeting biological specimen. Let us test your resolve against the full might of Unimatrix 01!”',
          advisors: [
            { officer: 'Lt. Worf', note: '“Quantum-enriched Photon Torpedoes loaded into all tubes! Phaser arrays overcharged!”' }
          ],
          effect: 'boss_morale_boost',
          choices: [
            { label: '“All batteries—OPEN FIRE!”', tag: 'BATTLESTATIONS', action: 'close' },
            { label: 'Send Away Team to sabotage her Omega Core.', tag: 'AWAY MISSION', action: 'open_away' }
          ]
        }
      }
    },
    awayMission: {
      title: 'Unimatrix 01: The Borg Queen’s Central Chamber',
      location: 'Borg Command Diamond — Queen’s Neural Nexus',
      recommended: ['picard', 'data', 'worf', 'geordi'],
      stages: [
        {
          title: 'Stage 1: The Transphasic Shield Conduit',
          text: 'Your Away Team beams into the glowing emerald heart of the Borg Queen’s Command Diamond. High-energy plasma conduits feed her Transphasic Shield Matrix while Elite Tactical Drones converge!',
          options: [
            {
              label: 'Have Worf hold off the Tactical Drones with his mek’leth while Geordi ruptures the plasma coolant tanks!',
              stat: 'security',
              difficulty: 14,
              successText: 'Geordi ruptures the plasma coolant conduits, dissolving the Borg guards and boosting the Enterprise’s Phaser Output by +35%!',
              failText: 'You blast the primary relay and fight through the corridor.',
              reward: 'phaser_boost'
            },
            {
              label: 'Have Data interface with the Vinculum to disable the Queen’s adaptive frequency algorithms.',
              stat: 'science',
              difficulty: 15,
              successText: 'Data locks the Queen’s shield nutation! Her Transphasic Shields drop to 0%!',
              failText: 'Data drains 50% of the Command Diamond’s shields before the firewall resets.',
              reward: 'borg_sleep_virus'
            }
          ]
        },
        {
          title: 'Stage 2: Destabilizing the Queen’s Omega Core',
          text: 'The Borg Queen descends on neural cables into the chamber, attempting to tempt Data and Picard while her Omega Particle Chamber builds toward a sector-wide detonation!',
          options: [
            {
              label: 'Smash the plasma regulator manifold and trigger an internal Omega harmonic cascade inside the Diamond!',
              stat: 'science',
              difficulty: 15,
              successText: 'DIRECT HIT ON THE QUEEN’S NEXUS! The Omega Core implodes inward—stripping the Queen’s invulnerability, destroying any tethered Borg Spheres, and dealing massive hull damage to the Command Diamond!',
              failText: 'The regulator shatters, stripping the Command Diamond’s shields and weakening its hull!',
              reward: 'queen_core_sabotage'
            }
          ]
        }
      ]
    }
  }
];

window.CREW_ROSTER = CREW_ROSTER;
window.SECTORS = SECTORS;
