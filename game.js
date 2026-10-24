/* ============================================================================
   STAR TREK: THE NEXT GENERATION — BRIDGE COMMANDER, AWAY TEAM & TACTICAL ENGINE
   ============================================================================ */

class EnterpriseGame {
  constructor() {
    this.canvas = document.getElementById('tacticalCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.stardate = 43992.4;
    this.alertLevel = 'green'; // 'green' | 'yellow' | 'red'
    this.activeDeck = 'tactical'; // 'tactical' | 'hail' | 'away' | 'astrometrics'

    // Enterprise-D State
    this.ship = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 4,
      targetX: null,
      targetY: null,
      hull: 100,
      maxHull: 100,
      shields: { fwd: 100, aft: 100, port: 100, stbd: 100 },
      energy: 100,
      torpedoes: 12,
      maxTorpedoes: 12,
      freq: 248.4,
      phaserBonus: 1.0,
      phaserCooldown: 0,
      torpedoCooldown: 0,
      evasiveTimer: 0,
      picardDecoy: null, // { x, y, angle, timer }
      power: {
        weapons: 30,
        shields: 30,
        engines: 25,
        sensors: 15
      },
      subsystems: {
        warp: 100,
        phasers: 100,
        shields: 100,
        impulse: 100,
        sensors: 100,
        lifesupport: 100
      }
    };

    // Crew Cooldowns & Away Team Selection
    this.crewCooldowns = {};
    window.CREW_ROSTER.forEach(c => {
      this.crewCooldowns[c.id] = 0;
    });
    this.selectedAwayTeam = ['riker', 'data', 'worf', 'troi'];
    this.awayStageIndex = 0;
    this.completedSectors = new Set();
    this.scannedTargets = new Set();

    // Sector Entities
    this.currentSectorIndex = 0;
    this.enemies = [];
    this.selectedTargetId = null;
    this.projectiles = [];
    this.beams = [];
    this.particles = [];
    this.floatingTexts = [];
    this.stars = [];

    // Keyboard state
    this.keys = {};

    this.initStars();
    this.bindEvents();
    this.renderCrewSidebar();
    this.loadSector(0);
    this.resizeCanvas();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 140; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.9 + 0.4,
        alpha: Math.random() * 0.7 + 0.25,
        tint: Math.random() > 0.8 ? '#99ccff' : (Math.random() > 0.5 ? '#ffeedd' : '#ffffff')
      });
    }
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const oldW = this.canvas.width || rect.width;
      const oldH = this.canvas.height || rect.height;
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;

      // Keep ship inside bounds
      this.ship.x = Math.min(Math.max(this.ship.x * (rect.width / oldW), 50), rect.width - 50);
      this.ship.y = Math.min(Math.max(this.ship.y * (rect.height / oldH), 50), rect.height - 50);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      this.keys[k] = true;

      if (k === ' ') {
        e.preventDefault();
        this.firePhasers();
      } else if (k === 'f') {
        e.preventDefault();
        this.fireTorpedo();
      } else if (k === 'e') {
        this.engageEvasive();
      } else if (k === 'm') {
        this.remodulateFrequency();
      } else if (k === 'h') {
        this.openHailDeck();
      } else if (k === 't') {
        this.cycleTarget();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Canvas click to set waypoint or select enemy target
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if clicked on an enemy ship
      for (const en of this.enemies) {
        if (en.hull <= 0) continue;
        const dist = Math.hypot(mx - en.x, my - en.y);
        if (dist < 38) {
          this.selectedTargetId = en.id;
          window.starfleetAudio.playBeep(1380, 0.05);
          this.addLog(`Target locked: ${en.name}.`, 'command');
          this.updateTargetHUD();
          return;
        }
      }

      // Otherwise set helm course
      this.ship.targetX = mx;
      this.ship.targetY = my;
      window.starfleetAudio.playBeep(960, 0.04);
      this.spawnPing(mx, my, '#66ccff');
    });

    // Mode Tabs
    document.querySelectorAll('.lcars-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const deck = btn.dataset.deck;
        this.switchDeck(deck);
      });
    });

    // Alert Status Cycle
    document.getElementById('alertIndicatorBox').addEventListener('click', () => {
      const next = this.alertLevel === 'green' ? 'yellow' : (this.alertLevel === 'yellow' ? 'red' : 'green');
      this.setAlertLevel(next);
    });

    // Power Allocation Sliders
    ['weapons', 'shields', 'engines', 'sensors'].forEach(sys => {
      const slider = document.getElementById(`power-${sys}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.ship.power[sys] = parseInt(e.target.value, 10);
          document.getElementById(`power-${sys}-val`).textContent = `${this.ship.power[sys]}%`;
          window.starfleetAudio.playBeep(880 + this.ship.power[sys] * 6, 0.03);
        });
      }
    });

    // Power Presets
    document.getElementById('presetAttack').addEventListener('click', () => this.setPowerPreset(55, 25, 15, 5, 'Attack Pattern Alpha'));
    document.getElementById('presetDefense').addEventListener('click', () => this.setPowerPreset(20, 55, 15, 10, 'Maximum Shield Reinforcement'));
    document.getElementById('presetBalanced').addEventListener('click', () => this.setPowerPreset(30, 30, 25, 15, 'Standard Cruise Allocation'));

    // Shield Balance & Arcs
    document.querySelectorAll('.shield-arc-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const arc = pill.dataset.arc;
        if (this.ship.energy >= 10) {
          this.ship.energy -= 10;
          this.ship.shields[arc] = Math.min(100, this.ship.shields[arc] + 25);
          window.starfleetAudio.playConfirm();
          this.addLog(`Engineering reinforced ${arc.toUpperCase()} shield quadrant (+25%).`, 'science');
        } else {
          window.starfleetAudio.playError();
        }
      });
    });

    document.getElementById('btnBalanceShields').addEventListener('click', () => {
      const s = this.ship.shields;
      const avg = (s.fwd + s.aft + s.port + s.stbd) / 4;
      s.fwd = s.aft = s.port = s.stbd = avg;
      window.starfleetAudio.playBeep(1120, 0.06);
      this.addLog('Shield harmonics equalized across all four quadrants.', 'science');
    });

    // Frequency Slider & Remodulate
    const freqSlider = document.getElementById('freqSlider');
    freqSlider.addEventListener('input', (e) => {
      this.ship.freq = parseFloat(e.target.value);
      document.getElementById('freqReadout').textContent = `${this.ship.freq.toFixed(1)} MHz`;
    });

    document.getElementById('btnRemodulate').addEventListener('click', () => this.remodulateFrequency());

    // Subsystem Damage Control Click-to-Repair
    document.querySelectorAll('.subsystem-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const sys = pill.dataset.sys;
        if (this.ship.subsystems[sys] >= 100) {
          window.starfleetAudio.playBeep(1100, 0.05);
          this.addLog(`Engineering: ${sys.toUpperCase()} subsystem is already operating at 100% efficiency.`, 'science');
          return;
        }
        if (this.ship.energy >= 8) {
          this.ship.energy -= 8;
          this.ship.subsystems[sys] = Math.min(100, this.ship.subsystems[sys] + 35);
          window.starfleetAudio.playConfirm();
          this.addLog(`Geordi’s Damage Control Team repaired ${sys.toUpperCase()} relays (+35%).`, 'success');
        } else {
          window.starfleetAudio.playError();
        }
      });
    });

    // Tactical Bottom Bar Buttons
    document.getElementById('btnFirePhasers').addEventListener('click', () => this.firePhasers());
    document.getElementById('btnFireTorpedo').addEventListener('click', () => this.fireTorpedo());
    document.getElementById('btnEvasive').addEventListener('click', () => this.engageEvasive());
    document.getElementById('btnScienceScan').addEventListener('click', () => this.performScienceScan());
    document.getElementById('btnOpenHail').addEventListener('click', () => this.openHailDeck());
    document.getElementById('btnOpenAway').addEventListener('click', () => this.switchDeck('away'));

    // Audio Mute Toggle, Final Boss Quick-Warp & Manual Dialog
    const warpBossBtn = document.getElementById('btnWarpFinalBoss');
    if (warpBossBtn) {
      warpBossBtn.addEventListener('click', () => {
        const bossIdx = window.SECTORS.findIndex(s => s.id === 'episode7_boss');
        if (bossIdx !== -1) {
          window.starfleetAudio.playWarp();
          this.loadSector(bossIdx);
        }
      });
    }

    document.getElementById('btnToggleAudio').addEventListener('click', (e) => {
      const on = window.starfleetAudio.toggleMute();
      e.currentTarget.textContent = on ? 'AUDIO: ONLINE' : 'AUDIO: MUTED';
    });

    const manualDialog = document.getElementById('manualDialog');
    const victoryDialog = document.getElementById('victoryDialog');
    document.getElementById('btnOpenManual').addEventListener('click', () => {
      window.starfleetAudio.playBeep(1320, 0.06);
      manualDialog.showModal();
    });

    // Mandatory fallback for browsers without <dialog closedby="any"> support per modern-web-guidance
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      [manualDialog, victoryDialog].forEach(dlg => {
        if (!dlg) return;
        dlg.addEventListener('click', (event) => {
          if (event.target !== dlg) return;
          const rect = dlg.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isDialogContent) return;
          dlg.close();
        });
      });
    }
  }

  setPowerPreset(w, s, e, sen, label) {
    this.ship.power = { weapons: w, shields: s, engines: e, sensors: sen };
    ['weapons', 'shields', 'engines', 'sensors'].forEach(k => {
      document.getElementById(`power-${k}`).value = this.ship.power[k];
      document.getElementById(`power-${k}-val`).textContent = `${this.ship.power[k]}%`;
    });
    window.starfleetAudio.playConfirm();
    this.addLog(`Warp core power preset engaged: ${label}.`, 'command');
  }

  setAlertLevel(level) {
    this.alertLevel = level;
    const app = document.querySelector('.lcars-app');
    const box = document.getElementById('alertIndicatorBox');
    const title = document.getElementById('alertStatusTitle');

    app.classList.remove('red-alert-active', 'yellow-alert-active');
    box.classList.remove('yellow', 'red');

    if (level === 'red') {
      app.classList.add('red-alert-active');
      box.classList.add('red');
      title.textContent = 'RED ALERT';
      window.starfleetAudio.playRedAlert();
    } else if (level === 'yellow') {
      app.classList.add('yellow-alert-active');
      box.classList.add('yellow');
      title.textContent = 'YELLOW ALERT';
      window.starfleetAudio.playBeep(760, 0.12);
    } else {
      title.textContent = 'CONDITION GREEN';
      window.starfleetAudio.playBeep(1140, 0.08);
    }
  }

  switchDeck(deckName) {
    this.activeDeck = deckName;
    window.starfleetAudio.playBeep(1280, 0.05);

    document.querySelectorAll('.lcars-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.deck === deckName);
    });

    document.getElementById('hailDeckOverlay').classList.toggle('hidden', deckName !== 'hail');
    document.getElementById('awayDeckOverlay').classList.toggle('hidden', deckName !== 'away');
    document.getElementById('astrometricsDeckOverlay').classList.toggle('hidden', deckName !== 'astrometrics');

    if (deckName === 'hail') {
      this.renderHailDeck();
    } else if (deckName === 'away') {
      this.renderAwayDeck();
    } else if (deckName === 'astrometrics') {
      this.renderAstrometricsDeck();
    }
  }

  // ==========================================================================
  // SECTOR LOADING & ASTROMETRICS
  // ==========================================================================
  loadSector(index) {
    this.currentSectorIndex = index;
    const sector = window.SECTORS[index];
    this.awayStageIndex = 0;
    this.awayBeamedDown = false;
    this.lastAwayOutcome = null;
    this.projectiles = [];
    this.beams = [];
    this.particles = [];

    const w = this.canvas.width || 800;
    const h = this.canvas.height || 520;

    this.ship.x = w * 0.22;
    this.ship.y = h * 0.78;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.targetX = null;
    this.ship.targetY = null;

    // Clone sector enemies
    this.enemies = sector.enemies.map(e => ({
      ...e,
      x: e.x * w,
      y: e.y * h,
      vx: 0,
      vy: 0,
      angle: Math.PI * 0.75,
      fireTimer: 2.2 + Math.random() * 1.5,
      cloaked: false,
      cloakTimer: 0,
      hitsOnCurrentFreq: 0
    }));

    this.selectedTargetId = this.enemies.length > 0 ? this.enemies[0].id : null;

    // Update Top Viewscreen HUD
    document.getElementById('hudSectorTitle').textContent = `${sector.code}: ${sector.name}`;
    document.getElementById('hudObjectiveText').textContent = sector.briefing;

    const anyHostile = this.enemies.some(e => e.hostile && e.hull > 0);
    this.setAlertLevel(anyHostile ? 'red' : 'yellow');

    this.addLog(`Entered ${sector.name} (${sector.sub}).`, 'command');
    this.addLog(sector.briefing, 'science');
    this.updateTargetHUD();
    this.switchDeck('tactical');
  }

  // ==========================================================================
  // SENIOR BRIDGE CREW SIDEBAR & ABILITIES
  // ==========================================================================
  renderCrewSidebar() {
    const container = document.getElementById('crewStationsList');
    container.innerHTML = '';

    window.CREW_ROSTER.forEach(officer => {
      const card = document.createElement('div');
      card.className = 'crew-station-card';
      card.innerHTML = `
        <div class="crew-avatar-small">${window.TNG_PORTRAITS[officer.portrait]}</div>
        <div class="crew-meta">
          <h5>${officer.name}</h5>
          <p title="${officer.bridgeAbility.desc}">${officer.bridgeAbility.name}</p>
        </div>
        <button class="crew-ability-btn" id="crew-btn-${officer.id}" title="${officer.bridgeAbility.desc}">
          ENGAGE
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => this.activateCrewAbility(officer));
      container.appendChild(card);
    });
  }

  activateCrewAbility(officer) {
    if (this.crewCooldowns[officer.id] > 0) {
      window.starfleetAudio.playError();
      return;
    }

    this.crewCooldowns[officer.id] = officer.bridgeAbility.cooldown;
    window.starfleetAudio.playConfirm();

    switch (officer.id) {
      case 'picard':
        // Picard Maneuver: Warp ghost decoy at current location + short jump forward
        this.ship.picardDecoy = {
          x: this.ship.x,
          y: this.ship.y,
          angle: this.ship.angle,
          timer: 6.5
        };
        this.ship.x = Math.min(Math.max(this.ship.x + Math.cos(this.ship.angle) * 115, 50), this.canvas.width - 50);
        this.ship.y = Math.min(Math.max(this.ship.y + Math.sin(this.ship.angle) * 115, 50), this.canvas.height - 50);
        window.starfleetAudio.playWarp();
        this.addFloatingText(this.ship.x, this.ship.y - 28, 'PICARD MANEUVER!', '#ffcc66');
        this.addLog('Capt. Picard: “Engage the Picard Maneuver!” Enemy sensors locked onto our warp afterimage decoy!', 'command');
        break;

      case 'riker':
        this.ship.evasiveTimer = 6.0;
        this.ship.energy = Math.min(100, this.ship.energy + 25);
        this.addFloatingText(this.ship.x, this.ship.y - 24, 'PATTERN OMEGA', '#66ccff');
        this.addLog('Cmdr. Riker: “Helm, execute Combat Maneuver Omega! Auxiliary power restored (+25%).”', 'command');
        break;

      case 'data': {
        const target = this.getSelectedTarget();
        if (target) {
          this.ship.freq = target.freq;
          document.getElementById('freqSlider').value = this.ship.freq;
          document.getElementById('freqReadout').textContent = `${this.ship.freq.toFixed(1)} MHz`;
          this.scannedTargets.add(target.id);
          this.addFloatingText(target.x, target.y - 30, `LOCKED ${target.freq.toFixed(1)} MHz`, '#44ffaa');
          this.addLog(`Lt. Cmdr. Data: “I have synchronized our phaser emitters to ${target.name}’s shield nutation (${target.freq.toFixed(1)} MHz).”`, 'science');
        } else {
          this.remodulateFrequency();
        }
        break;
      }

      case 'worf': {
        const hostiles = this.enemies.filter(e => e.hull > 0);
        if (hostiles.length === 0) {
          this.addLog('Lt. Worf: “No active targets in range, Captain!”', 'alert');
          break;
        }
        hostiles.forEach((en, idx) => {
          en.hostile = true;
          this.spawnTorpedo(this.ship.x, this.ship.y, en, true, idx * 0.12);
        });
        this.setAlertLevel('red');
        window.starfleetAudio.playTorpedo();
        this.addLog('Lt. Worf: “Firing full spread of high-yield photon torpedoes!”', 'alert');
        break;
      }

      case 'geordi':
        ['fwd', 'aft', 'port', 'stbd'].forEach(arc => {
          this.ship.shields[arc] = Math.min(100, this.ship.shields[arc] + 35);
        });
        Object.keys(this.ship.subsystems).forEach(sys => {
          this.ship.subsystems[sys] = Math.min(100, this.ship.subsystems[sys] + 30);
        });
        this.addFloatingText(this.ship.x, this.ship.y - 24, 'SHIELDS +35%', '#44dd88');
        this.addLog('Lt. Cmdr. La Forge: “Rerouting main warp plasma to shield grid and repairing damaged relays!”', 'science');
        break;

      case 'troi': {
        const target = this.getSelectedTarget();
        if (target) {
          target.evasionDebuff = 8.0;
          this.addLog(`Counselor Troi: “I sense hesitation from ${target.commander}. Their helm maneuvers are predictable—and hailing channels are open.”`, 'science');
        } else {
          this.addLog('Counselor Troi: “The crew’s morale is focused and steady, Captain.”', 'science');
        }
        break;
      }

      case 'crusher':
        this.ship.hull = Math.min(this.ship.maxHull, this.ship.hull + 22);
        this.ship.subsystems.lifesupport = 100;
        this.addFloatingText(this.ship.x, this.ship.y - 24, 'HULL & MEDICAL +22%', '#66eeff');
        this.addLog('Dr. Crusher: “Sickbay triage complete and emergency structural forcefields online (+22% Hull).”', 'success');
        break;
    }
  }

  // ==========================================================================
  // TACTICAL WEAPONS, HARMONICS & SCANS
  // ==========================================================================
  getSelectedTarget() {
    let t = this.enemies.find(e => e.id === this.selectedTargetId && e.hull > 0);
    if (!t) {
      t = this.enemies.find(e => e.hull > 0) || null;
      this.selectedTargetId = t ? t.id : null;
    }
    return t;
  }

  cycleTarget() {
    const alive = this.enemies.filter(e => e.hull > 0);
    if (alive.length === 0) return;
    const idx = alive.findIndex(e => e.id === this.selectedTargetId);
    const next = alive[(idx + 1) % alive.length];
    this.selectedTargetId = next.id;
    window.starfleetAudio.playBeep(1420, 0.05);
    this.updateTargetHUD();
  }

  remodulateFrequency() {
    const target = this.getSelectedTarget();
    if (target && target.adapts) {
      // Shift target's vulnerable frequency to match our new random modulation
      const newFreq = +(242 + Math.random() * 16).toFixed(1);
      this.ship.freq = newFreq;
      target.freq = newFreq;
      target.hitsOnCurrentFreq = 0;
    } else if (target && this.scannedTargets.has(target.id)) {
      this.ship.freq = target.freq;
    } else {
      this.ship.freq = +(242 + Math.random() * 16).toFixed(1);
    }

    document.getElementById('freqSlider').value = this.ship.freq;
    document.getElementById('freqReadout').textContent = `${this.ship.freq.toFixed(1)} MHz`;
    window.starfleetAudio.playConfirm();
    this.addFloatingText(this.ship.x, this.ship.y - 22, `MODULATED: ${this.ship.freq.toFixed(1)} MHz`, '#66ccff');
    this.addLog(`Shield and Phaser nutation remodulated to ${this.ship.freq.toFixed(1)} MHz.`, 'science');
  }

  performScienceScan() {
    const target = this.getSelectedTarget();
    if (!target) {
      window.starfleetAudio.playBeep(980, 0.08);
      this.addLog('Long-range sensors report no active hostile vessels in this quadrant.', 'science');
      return;
    }

    this.scannedTargets.add(target.id);
    window.starfleetAudio.playConfirm();
    this.spawnPing(target.x, target.y, '#ffcc66');
    this.addLog(
      `SCIENCE SCAN [${target.name}]: Shield Nutation Frequency is ${target.freq.toFixed(1)} MHz. Tune the left LCARS Frequency Modulator (or press M) to ${target.freq.toFixed(1)} MHz for +75% shield penetration!`,
      'science'
    );
    this.updateTargetHUD();
  }

  firePhasers() {
    const target = this.getSelectedTarget();
    if (!target) {
      window.starfleetAudio.playError();
      this.addLog('Lt. Worf: “No target locked for Phaser Arrays!”', 'alert');
      return;
    }
    if (target.cloaked) {
      window.starfleetAudio.playError();
      this.addLog('Lt. Worf: “Cannot lock phasers while target is cloaked!”', 'alert');
      return;
    }
    if (this.ship.phaserCooldown > 0 || this.ship.energy < 8) {
      window.starfleetAudio.playError();
      return;
    }

    this.ship.energy -= 8;
    this.ship.phaserCooldown = 0.85;
    target.hostile = true;
    if (this.alertLevel !== 'red') this.setAlertLevel('red');

    window.starfleetAudio.playPhaser(false);

    // Saucer dorsal phaser array strip origin
    const saucerOffsetX = this.ship.x + Math.cos(this.ship.angle) * 14;
    const saucerOffsetY = this.ship.y + Math.sin(this.ship.angle) * 14;

    this.beams.push({
      x1: saucerOffsetX,
      y1: saucerOffsetY,
      x2: target.x,
      y2: target.y,
      color: '#ff9922',
      coreColor: '#ffffcc',
      width: 4.5,
      alpha: 1.0,
      duration: 0.35
    });

    // Calculate damage based on Weapons power, Subsystem health, and Harmonic Frequency Match
    const freqDiff = Math.abs(this.ship.freq - target.freq);
    const freqMatch = freqDiff <= 0.6;
    let dmg = (18 + this.ship.power.weapons * 0.42) * (this.ship.subsystems.phasers / 100) * this.ship.phaserBonus;

    if (target.adapts) {
      target.hitsOnCurrentFreq = (target.hitsOnCurrentFreq || 0) + 1;
      if (target.hitsOnCurrentFreq > 3) {
        dmg *= 0.15;
        this.addFloatingText(target.x, target.y - 26, 'BORG ADAPTED! REMODULATE (M)', '#44ff88');
        this.addLog('Lt. Cmdr. Data: “The Borg have adapted to our phaser frequency! Press M or click REMODULATE!”', 'alert');
      } else if (freqMatch) {
        dmg *= 1.65;
        this.addFloatingText(target.x, target.y - 22, `RESONANCE CRIT -${Math.round(dmg)}`, '#ffcc33');
      }
    } else if (freqMatch) {
      dmg *= 1.65;
      this.addFloatingText(target.x, target.y - 22, `HARMONIC CRIT -${Math.round(dmg)}`, '#ffcc33');
    }

    this.applyDamageToEnemy(target, dmg);
  }

  fireTorpedo() {
    const target = this.getSelectedTarget();
    if (!target) {
      window.starfleetAudio.playError();
      return;
    }
    if (this.ship.torpedoCooldown > 0 || this.ship.torpedoes <= 0) {
      window.starfleetAudio.playError();
      this.addLog('Lt. Worf: “Photon torpedo tubes recycling or depleted!”', 'alert');
      return;
    }

    this.ship.torpedoes--;
    this.ship.torpedoCooldown = 1.4;
    target.hostile = true;
    if (this.alertLevel !== 'red') this.setAlertLevel('red');

    window.starfleetAudio.playTorpedo();
    this.spawnTorpedo(this.ship.x, this.ship.y, target, true, 0);
  }

  spawnTorpedo(x, y, target, fromPlayer, delay = 0) {
    const angle = Math.atan2(target.y - y, target.x - x);
    this.projectiles.push({
      x,
      y,
      vx: Math.cos(angle) * (fromPlayer ? 270 : 215),
      vy: Math.sin(angle) * (fromPlayer ? 270 : 215),
      target,
      fromPlayer,
      delay,
      color: fromPlayer ? '#ff4422' : (target.type === 'warbird' ? '#33ff77' : '#ff3355'),
      life: 4.5
    });
  }

  engageEvasive() {
    if (this.ship.energy < 12) {
      window.starfleetAudio.playError();
      return;
    }
    this.ship.energy -= 12;
    this.ship.evasiveTimer = 4.0;
    window.starfleetAudio.playBeep(1520, 0.08);
    this.addFloatingText(this.ship.x, this.ship.y - 20, 'EVASIVE PATTERN DELTA', '#66ccff');
    this.addLog('Helm: “Executing Evasive Pattern Picard-Delta!”', 'command');
  }

  applyDamageToEnemy(enemy, dmg) {
    // Check if Final Boss is protected by Phase II Transphasic Shield from tethered Borg Spheres
    if (enemy.invulnerable) {
      this.spawnExplosion(enemy.x, enemy.y, '#ffcc00', 8);
      this.addFloatingText(enemy.x, enemy.y - 28, 'TRANSPHASIC SHIELD — DESTROY SPHERES!', '#ffcc00');
      this.addLog('Lt. Cmdr. Data: “The Borg Queen’s Command Diamond is shielded by the tethered Borg Spheres! Target the Spheres (press T) or send an Away Team!”', 'alert');
      this.updateTargetHUD();
      return;
    }

    this.spawnExplosion(enemy.x + (Math.random() - 0.5) * 20, enemy.y + (Math.random() - 0.5) * 20, '#ffaa44', 10);

    if (enemy.shields > 0) {
      const shieldAbsorb = Math.min(enemy.shields, dmg * 0.85);
      enemy.shields -= shieldAbsorb;
      const bleed = dmg - shieldAbsorb;
      enemy.hull = Math.max(0, enemy.hull - bleed);
    } else {
      enemy.hull = Math.max(0, enemy.hull - dmg);
    }

    // Check Final Boss Phase Transitions
    if (enemy.isFinalBoss && enemy.hull > 0) {
      const hullRatio = enemy.hull / enemy.maxHull;

      // Transition to Phase II at 65% Hull: Deploy 2 Tethered Borg Spheres + Transphasic Shield
      if (enemy.phase === 1 && hullRatio <= 0.65) {
        enemy.phase = 2;
        enemy.invulnerable = true;
        enemy.shields = Math.max(enemy.shields, 220);
        window.starfleetAudio.playRedAlert();
        this.spawnBossTetherSpheres(enemy);
        this.addFloatingText(enemy.x, enemy.y - 36, 'PHASE II: TRANSPHASIC TETHER MATRIX!', '#ffcc00');
        this.addLog('BORG QUEEN (PHASE II): “You think in such three-dimensional terms!” Two Borg Spheres have tethered a Transphasic Shield to the Command Diamond! Destroy both Spheres (press T) or beam an Away Team aboard!', 'alert');
      }
      // Transition to Phase III at 32% Hull: Omega Molecule Core Overload
      else if (enemy.phase < 3 && hullRatio <= 0.32) {
        enemy.phase = 3;
        enemy.invulnerable = false;
        enemy.omegaTimer = 6.5;
        window.starfleetAudio.playRedAlert();
        this.spawnExplosion(enemy.x, enemy.y, '#33ff88', 35);
        this.addFloatingText(enemy.x, enemy.y - 36, 'PHASE III: OMEGA CORE OVERLOAD!', '#ff3344');
        this.addLog('BORG QUEEN (PHASE III — FINAL STAND): “Witness the perfection of the Omega Molecule!” Watch out for radial Omega plasma shockwaves!', 'alert');
      }
    }

    if (enemy.hull <= 0) {
      window.starfleetAudio.playExplosion(true);
      this.spawnExplosion(enemy.x, enemy.y, '#ff7722', 42);
      this.addFloatingText(enemy.x, enemy.y, `${enemy.name} NEUTRALIZED`, '#ff6666');
      this.addLog(`Target ${enemy.name} has been neutralized!`, 'success');

      // If a Tethered Borg Sphere was destroyed, check if any remain
      if (enemy.isTetherSphere) {
        const remainingSpheres = this.enemies.some(e => e.isTetherSphere && e.hull > 0);
        const boss = this.enemies.find(e => e.isFinalBoss && e.hull > 0);
        if (!remainingSpheres && boss) {
          boss.invulnerable = false;
          this.selectedTargetId = boss.id;
          this.addFloatingText(boss.x, boss.y - 34, 'TRANSPHASIC SHIELD COLLAPSED!', '#44ff88');
          this.addLog('Lt. Worf: “Both Borg Spheres destroyed! The Queen’s Transphasic Shield has collapsed—target the Command Diamond!”', 'success');
        }
      }

      // If the Final Boss was destroyed, trigger grand explosion & Victory Modal!
      if (enemy.isFinalBoss) {
        // Also neutralize any remaining spheres
        this.enemies.forEach(e => {
          if (e.isTetherSphere && e.hull > 0) {
            e.hull = 0;
            this.spawnExplosion(e.x, e.y, '#33ff88', 25);
          }
        });
        this.triggerFinalBossVictory(enemy);
      }

      this.checkSectorCompletion();
    }
    this.updateTargetHUD();
  }

  spawnBossTetherSpheres(boss) {
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 520;
    const offsets = [
      { id: `sphere_alpha_${Date.now()}`, name: 'Borg Tactical Sphere Alpha', dx: -140, dy: 55 },
      { id: `sphere_beta_${Date.now()}`, name: 'Borg Tactical Sphere Beta', dx: 140, dy: 55 }
    ];
    offsets.forEach((cfg, idx) => {
      const sp = {
        id: cfg.id,
        name: cfg.name,
        faction: 'The Borg Collective',
        commander: 'Tactical Sub-Node',
        portrait: 'borg',
        type: 'borg_sphere',
        isTetherSphere: true,
        hull: 140,
        maxHull: 140,
        shields: 90,
        maxShields: 90,
        hostile: true,
        canCloak: false,
        adapts: false,
        freq: boss.freq,
        x: Math.min(Math.max(boss.x + cfg.dx, 60), w - 60),
        y: Math.min(Math.max(boss.y + cfg.dy, 60), h - 60),
        vx: 0,
        vy: 0,
        angle: Math.PI / 2,
        fireTimer: 2.2 + idx * 0.8
      };
      this.enemies.push(sp);
      this.spawnExplosion(sp.x, sp.y, '#33ff88', 18);
    });
    // Automatically lock onto the first sphere so player can shoot immediately
    const firstSphere = this.enemies.find(e => e.isTetherSphere && e.hull > 0);
    if (firstSphere) this.selectedTargetId = firstSphere.id;
  }

  triggerFinalBossVictory(boss) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        window.starfleetAudio.playExplosion(true);
        this.spawnExplosion(
          boss.x + (Math.random() - 0.5) * 90,
          boss.y + (Math.random() - 0.5) * 90,
          i % 2 === 0 ? '#33ff88' : '#ffcc44',
          45
        );
      }, i * 220);
    }
    setTimeout(() => {
      window.starfleetAudio.playConfirm();
      const portraitEl = document.getElementById('victoryPicardPortrait');
      if (portraitEl) portraitEl.innerHTML = window.TNG_PORTRAITS.picard;
      const victoryDialog = document.getElementById('victoryDialog');
      if (victoryDialog && !victoryDialog.open) {
        victoryDialog.showModal();
      }
    }, 1150);
  }

  applyDamageToEnterprise(sourceX, sourceY, rawDmg) {
    if (this.ship.evasiveTimer > 0 && Math.random() < 0.55) {
      this.addFloatingText(this.ship.x, this.ship.y - 18, 'EVADED', '#99ccff');
      return;
    }

    // Determine which shield quadrant faces the attacker
    const relAngle = Math.atan2(sourceY - this.ship.y, sourceX - this.ship.x) - this.ship.angle;
    const norm = Math.atan2(Math.sin(relAngle), Math.cos(relAngle));
    let arc = 'fwd';
    if (norm > -Math.PI / 4 && norm <= Math.PI / 4) arc = 'fwd';
    else if (norm > Math.PI / 4 && norm <= (3 * Math.PI) / 4) arc = 'stbd';
    else if (norm < -Math.PI / 4 && norm >= -(3 * Math.PI) / 4) arc = 'port';
    else arc = 'aft';

    window.starfleetAudio.playExplosion(false);
    this.spawnExplosion(this.ship.x, this.ship.y, '#66ccff', 12);

    const shieldVal = this.ship.shields[arc];
    if (shieldVal > 0) {
      const absorbed = Math.min(shieldVal, rawDmg);
      this.ship.shields[arc] = Math.max(0, shieldVal - absorbed);
      const hullHit = (rawDmg - absorbed) * 0.7;
      if (hullHit > 0) {
        this.ship.hull = Math.max(0, this.ship.hull - hullHit);
        this.damageRandomSubsystem(hullHit);
      }
    } else {
      this.ship.hull = Math.max(0, this.ship.hull - rawDmg);
      this.damageRandomSubsystem(rawDmg);
    }

    if (this.ship.hull <= 15 && this.ship.hull > 0) {
      this.addLog('WARNING: Hull integrity critical! Dispatch Dr. Crusher or Geordi’s emergency repair teams!', 'alert');
    } else if (this.ship.hull <= 0) {
      // Emergency Warp Core Containment & Starfleet Repair
      this.ship.hull = 50;
      this.ship.shields = { fwd: 60, aft: 60, port: 60, stbd: 60 };
      this.addLog('EMERGENCY: Geordi La Forge executed an emergency warp field stasis recovery! Hull stabilized at 50%.', 'alert');
    }
  }

  damageRandomSubsystem(amount) {
    if (Math.random() > 0.45) return;
    const keys = Object.keys(this.ship.subsystems);
    const pick = keys[Math.floor(Math.random() * keys.length)];
    this.ship.subsystems[pick] = Math.max(25, this.ship.subsystems[pick] - Math.round(amount * 1.1));
  }

  checkSectorCompletion() {
    const anyHostileAlive = this.enemies.some(e => e.hostile && e.hull > 0);
    if (!anyHostileAlive) {
      const sector = window.SECTORS[this.currentSectorIndex];
      this.completedSectors.add(sector.id);
      this.setAlertLevel('green');
      this.addLog(`SECTOR SECURED: ${sector.name}. You may send an Away Team or warp to the next episode in Astrometrics!`, 'success');
    }
  }

  // ==========================================================================
  // MODE 2A: HAILING & DIPLOMACY VIEWSCREEN
  // ==========================================================================
  openHailDeck() {
    window.starfleetAudio.playHail();
    this.currentHailNode = 'root';
    this.switchDeck('hail');
  }

  renderHailDeck() {
    const sector = window.SECTORS[this.currentSectorIndex];
    const tree = sector.hailTree;
    const node = tree.nodes[this.currentHailNode || tree.startNode] || tree.nodes.root;

    document.getElementById('hailPortraitBox').innerHTML = window.TNG_PORTRAITS[tree.portrait] || window.TNG_PORTRAITS.starfleet;
    document.getElementById('hailSpeakerName').textContent = tree.speaker;
    document.getElementById('hailSpeakerTitle').textContent = tree.title;
    document.getElementById('hailSpeechText').textContent = node.text;

    const advContainer = document.getElementById('hailAdvisorStrip');
    advContainer.innerHTML = '';
    (node.advisors || []).forEach(adv => {
      const div = document.createElement('div');
      div.className = 'advisor-insight-card';
      div.innerHTML = `<strong>${adv.officer}</strong><span>${adv.note}</span>`;
      advContainer.appendChild(div);
    });

    // Apply node effects if any
    if (node.effect === 'peace_standby') {
      this.enemies.forEach(e => { e.hostile = false; });
      this.setAlertLevel('yellow');
    } else if (node.effect === 'ally_truce_bonus') {
      this.enemies.forEach(e => { e.hostile = false; });
      this.ship.shields = { fwd: 100, aft: 100, port: 100, stbd: 100 };
      this.completedSectors.add(sector.id);
      this.setAlertLevel('green');
      this.addLog(`Diplomatic resolution achieved with ${tree.speaker}!`, 'success');
    } else if (node.effect === 'disable_wingman') {
      const wingman = this.enemies.find(e => e.id === 'escort_bop');
      if (wingman) {
        wingman.hostile = false;
        wingman.hull = 0;
        this.addLog('IKS Buruk has withdrawn from combat after Duras’s Romulan ties were exposed!', 'success');
      }
    } else if (node.effect === 'pacify_sector') {
      this.enemies.forEach(e => { e.hostile = false; e.hull = 0; });
      this.completedSectors.add(sector.id);
      this.setAlertLevel('green');
      this.addLog(`Peaceful Starfleet breakthrough achieved in ${sector.name}!`, 'success');
    } else if (node.effect === 'trigger_hostile') {
      this.enemies.forEach(e => { e.hostile = true; });
      this.setAlertLevel('red');
    } else if (node.effect === 'boss_morale_boost') {
      this.ship.torpedoes = this.ship.maxTorpedoes;
      this.ship.phaserBonus = +(this.ship.phaserBonus + 0.15).toFixed(2);
      this.ship.shields = { fwd: 100, aft: 100, port: 100, stbd: 100 };
      this.setAlertLevel('red');
      this.addLog('Capt. Picard’s defiance rallied the crew! Torpedo bays reloaded (12/12), Shields 100%, and Phaser Output +15%!', 'command');
    }

    const choicesList = document.getElementById('hailChoicesList');
    choicesList.innerHTML = '';
    (node.choices || []).forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'lcars-choice-btn';
      btn.innerHTML = `<span>${ch.label}</span><span class="choice-tag">${ch.tag}</span>`;
      btn.addEventListener('click', () => {
        window.starfleetAudio.playBeep(1360, 0.06);
        if (ch.action === 'close') {
          this.switchDeck('tactical');
        } else if (ch.action === 'open_away') {
          this.switchDeck('away');
        } else if (ch.next) {
          this.currentHailNode = ch.next;
          this.renderHailDeck();
        }
      });
      choicesList.appendChild(btn);
    });
  }

  // ==========================================================================
  // MODE 2B: TRANSPORTER ROOM 3 & AWAY TEAM NARRATIVE MISSIONS
  // ==========================================================================
  renderAwayDeck() {
    const sector = window.SECTORS[this.currentSectorIndex];
    const mission = sector.awayMission;

    document.getElementById('awayMissionTitle').textContent = mission.title;
    document.getElementById('awayMissionLocation').textContent = this.awayBeamedDown
      ? `ON SURFACE: ${mission.location.toUpperCase()}`
      : `TRANSPORTER ROOM 3 // TARGET: ${mission.location}`;

    // Render Officer Roster Picker
    const rosterGrid = document.getElementById('awayRosterGrid');
    rosterGrid.innerHTML = '';
    window.CREW_ROSTER.forEach(officer => {
      const isSelected = this.selectedAwayTeam.includes(officer.id);
      const isRec = (mission.recommended || []).includes(officer.id);
      const card = document.createElement('div');
      card.className = `officer-select-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="officer-mini-avatar">${window.TNG_PORTRAITS[officer.portrait]}</div>
        <div class="officer-card-info">
          <h4>${officer.name} ${isRec ? '<span style="color:var(--lcars-gold);font-size:0.62rem;">★ REC</span>' : ''}</h4>
          <p>${officer.role}</p>
          <div class="officer-stats-pills">
            <span class="stat-mini-tag">DIP ${officer.stats.diplomacy}</span>
            <span class="stat-mini-tag">SCI ${officer.stats.science}</span>
            <span class="stat-mini-tag">SEC ${officer.stats.security}</span>
            <span class="stat-mini-tag">MED ${officer.stats.medical}</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (isSelected) {
          if (this.selectedAwayTeam.length > 1) {
            this.selectedAwayTeam = this.selectedAwayTeam.filter(id => id !== officer.id);
          }
        } else if (this.selectedAwayTeam.length < 4) {
          this.selectedAwayTeam.push(officer.id);
        } else {
          this.selectedAwayTeam.shift();
          this.selectedAwayTeam.push(officer.id);
        }
        window.starfleetAudio.playBeep(1220, 0.05);
        this.renderAwayDeck();
      });
      rosterGrid.appendChild(card);
    });

    // Render Transporter Pads
    const padsRow = document.getElementById('transporterPadsRow');
    padsRow.innerHTML = '';
    const totals = { diplomacy: 0, science: 0, security: 0, medical: 0 };

    for (let i = 0; i < 4; i++) {
      const officerId = this.selectedAwayTeam[i];
      const officer = window.CREW_ROSTER.find(c => c.id === officerId);
      const pad = document.createElement('div');
      pad.className = 'transporter-pad-slot';
      if (officer) {
        totals.diplomacy += officer.stats.diplomacy;
        totals.science += officer.stats.science;
        totals.security += officer.stats.security;
        totals.medical += officer.stats.medical;
        if (this.awayBeamedDown) {
          pad.innerHTML = `
            <div style="font-size:0.7rem;color:var(--lcars-green);font-weight:700;text-align:center;">ON SURFACE</div>
            <span style="font-size:0.65rem;margin-top:4px;color:var(--lcars-ice);text-align:center;">${officer.name.split(' ').pop()}</span>
            <span style="font-size:0.58rem;color:var(--text-muted);margin-top:2px;">TRANSPONDER LOCKED</span>
          `;
        } else {
          pad.innerHTML = `
            <div class="officer-mini-avatar" style="width:46px;height:46px;">${window.TNG_PORTRAITS[officer.portrait]}</div>
            <span style="font-size:0.65rem;margin-top:5px;color:var(--lcars-peach);text-align:center;">${officer.name.split(' ').pop()}</span>
          `;
        }
      } else {
        pad.innerHTML = `<span style="font-size:0.65rem;color:var(--text-muted);">PAD ${i + 1} OPEN</span>`;
      }
      padsRow.appendChild(pad);
    }

    document.getElementById('awayTeamTotals').textContent =
      `TEAM TOTALS — DIPLOMACY: ${totals.diplomacy} | SCIENCE: ${totals.science} | SECURITY: ${totals.security} | MEDICAL: ${totals.medical}`;

    const stageBox = document.getElementById('awayNarrativeStageBox');

    // PHASE 1: NOT YET BEAMED DOWN — SHOW BIG ENERGIZE LAUNCH PANEL
    if (!this.awayBeamedDown) {
      stageBox.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:14px 10px;gap:12px;background:radial-gradient(circle at center, rgba(102,204,255,0.12), rgba(5,10,24,0.9));border:1px solid var(--lcars-ice);border-radius:10px;">
          <div style="font-family:var(--font-lcars);font-size:1.1rem;color:var(--lcars-gold);letter-spacing:1.5px;">
            READY FOR ORBITAL INSERTION // ${mission.title.toUpperCase()}
          </div>
          <p style="font-size:0.84rem;color:var(--text-primary);max-width:560px;line-height:1.45;">
            Target coordinates locked onto <strong>${mission.location}</strong>. Select your 4 Away Team officers on the left, then command Chief O’Brien to energize the transporter pads to materialize on the surface!
          </p>
          <button class="tac-btn away" id="btnEnergizePads" style="font-size:1rem;padding:12px 28px;background:linear-gradient(90deg, var(--lcars-gold), var(--lcars-ice));color:#000;font-weight:800;box-shadow:0 0 22px rgba(102,204,255,0.5);cursor:pointer;">
            ⚡ ENERGIZE TRANSPORTER BEAM — BEAM DOWN AWAY TEAM
          </button>
        </div>
      `;

      document.getElementById('btnEnergizePads').addEventListener('click', () => {
        this.beamDownAwayTeam();
      });
      return;
    }

    // PHASE 2: BEAMED DOWN ON SURFACE — RENDER VISUAL SURFACE SCENE + STAGE CHOICES
    const stage = mission.stages[this.awayStageIndex] || mission.stages[0];

    let optionsHtml = '';
    stage.options.forEach((opt, idx) => {
      const teamStatVal = totals[opt.stat] || 10;
      const chance = Math.min(99, Math.max(25, Math.round((teamStatVal / (opt.difficulty * 1.6)) * 100)));
      optionsHtml += `
        <button class="lcars-choice-btn away-opt-btn" data-idx="${idx}">
          <span>${opt.label}</span>
          <span class="choice-tag">${opt.stat.toUpperCase()} (${chance}% READY)</span>
        </button>
      `;
    });

    // Build visual surface diorama showing the 4 beamed officers at the mission site
    const surfaceOfficersHtml = this.selectedAwayTeam.map(id => {
      const off = window.CREW_ROSTER.find(c => c.id === id);
      if (!off) return '';
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;animation:fadeIn 0.4s ease;">
          <div style="width:42px;height:42px;border-radius:50%;border:2px solid var(--lcars-gold);overflow:hidden;box-shadow:0 0 12px rgba(255,204,102,0.55);background:#081226;">
            ${window.TNG_PORTRAITS[off.portrait]}
          </div>
          <span style="font-size:0.62rem;font-family:var(--font-mono);color:#fff;background:rgba(0,0,0,0.65);padding:1px 5px;border-radius:4px;">${off.name.split(' ').pop()}</span>
        </div>
      `;
    }).join('');

    const outcomeBannerHtml = this.lastAwayOutcome ? `
      <div style="background:${this.lastAwayOutcome.success ? 'rgba(40,180,100,0.18)' : 'rgba(255,153,51,0.18)'};border-left:4px solid ${this.lastAwayOutcome.success ? 'var(--lcars-green)' : 'var(--lcars-gold)'};padding:8px 12px;border-radius:6px;margin-bottom:10px;">
        <div style="font-family:var(--font-lcars);font-size:0.78rem;color:${this.lastAwayOutcome.success ? 'var(--lcars-green)' : 'var(--lcars-gold)'};letter-spacing:1px;">
          tricorder telemetry // ${this.lastAwayOutcome.badge}
        </div>
        <div style="font-size:0.8rem;color:#fff;margin-top:2px;">${this.lastAwayOutcome.text}</div>
      </div>
    ` : '';

    stageBox.innerHTML = `
      <!-- Visual Surface Panorama -->
      <div style="position:relative;background:linear-gradient(180deg, rgba(16,32,68,0.95) 0%, rgba(38,20,58,0.88) 65%, rgba(18,28,42,0.98) 100%);border:1px solid var(--lcars-gold);border-radius:8px;padding:10px 14px;margin-bottom:10px;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--lcars-green);">
            ● LIVE AWAY TEAM TELEMETRY — STAGE ${this.awayStageIndex + 1} OF ${mission.stages.length}
          </span>
          <button class="mini-lcars-btn" id="btnEnergizePads" style="background:var(--lcars-peach);color:#000;padding:3px 10px;font-size:0.68rem;">
            BEAM BACK TO PADS
          </button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-around;padding:6px 0;">
          ${surfaceOfficersHtml}
          <div style="display:flex;flex-direction:column;align-items:center;padding:6px 12px;border:1px dashed var(--lcars-ice);border-radius:8px;background:rgba(0,20,40,0.6);">
            <span style="font-family:var(--font-lcars);font-size:0.75rem;color:var(--lcars-ice);">OBJECTIVE SITE</span>
            <span style="font-size:0.72rem;color:var(--lcars-gold);text-align:center;">${stage.title}</span>
          </div>
        </div>
      </div>

      ${outcomeBannerHtml}

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <h3 style="font-family:var(--font-lcars);color:var(--lcars-gold);letter-spacing:1px;">${stage.title}</h3>
      </div>
      <p class="hail-speech-text" style="margin-bottom:10px;">${stage.text}</p>
      <div class="dialogue-choices-list">${optionsHtml}</div>
    `;

    document.getElementById('btnEnergizePads').addEventListener('click', () => {
      this.awayBeamedDown = false;
      this.triggerTransporterEffect();
      setTimeout(() => this.renderAwayDeck(), 500);
    });

    stageBox.querySelectorAll('.away-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = stage.options[parseInt(btn.dataset.idx, 10)];
        this.resolveAwayOption(opt, totals, mission);
      });
    });
  }

  beamDownAwayTeam() {
    this.triggerTransporterEffect();
    const sector = window.SECTORS[this.currentSectorIndex];

    // Also fire a visible golden transporter beam on the Tactical Viewscreen towards the planet
    if (sector.planet) {
      const w = this.canvas.width || 800;
      const h = this.canvas.height || 520;
      const px = sector.planet.x * w;
      const py = sector.planet.y * h;
      this.beams.push({
        x1: this.ship.x,
        y1: this.ship.y,
        x2: px,
        y2: py,
        color: '#ffcc44',
        coreColor: '#ffffff',
        width: 6,
        alpha: 1.0,
        duration: 1.6
      });
      this.addFloatingText(px, py - 24, 'AWAY TEAM MATERIALIZED', '#ffcc44');
    }

    setTimeout(() => {
      this.awayBeamedDown = true;
      this.lastAwayOutcome = {
        success: true,
        badge: 'MATERIALIZATION COMPLETE',
        text: `Away Team (${this.selectedAwayTeam.map(id => id.toUpperCase()).join(', ')}) has materialized at ${sector.awayMission.location}. Tricorders online!`
      };
      this.renderAwayDeck();
    }, 650);
  }

  triggerTransporterEffect() {
    window.starfleetAudio.playTransporter();
    document.querySelectorAll('.transporter-pad-slot').forEach(slot => {
      slot.classList.remove('beaming');
      void slot.offsetWidth;
      slot.classList.add('beaming');
    });
    this.addLog('Transporter Chief O’Brien: “Targeting scanners locked. Energizing!”', 'science');
  }

  resolveAwayOption(opt, totals, mission) {
    window.starfleetAudio.playConfirm();
    const statVal = totals[opt.stat] || 10;
    const success = statVal >= opt.difficulty * 1.35 || Math.random() < 0.78;
    const outcomeText = success ? opt.successText : opt.failText;

    this.addLog(`AWAY TEAM [${mission.title}]: ${outcomeText}`, success ? 'success' : 'command');

    let rewardLabel = 'STAGE OBJECTIVE COMPLETE';
    // Apply Rewards
    if (opt.reward === 'phaser_boost') {
      this.ship.phaserBonus = +(this.ship.phaserBonus + 0.25).toFixed(2);
      rewardLabel = 'REWARD: PHASER OUTPUT +25%';
      this.addLog('Upgrade Installed: Phaser Array Output increased by +25%!', 'success');
    } else if (opt.reward === 'torpedo_reload') {
      this.ship.torpedoes = this.ship.maxTorpedoes;
      rewardLabel = 'REWARD: TORPEDO BAYS RELOADED (12/12)';
      this.addLog('Ordnance Restocked: Photon Torpedo bays reloaded to 12/12!', 'success');
    } else if (opt.reward === 'hull_repair') {
      this.ship.hull = 100;
      rewardLabel = 'REWARD: ENTERPRISE HULL RESTORED TO 100%';
      this.addLog('Engineering & Medical: Enterprise Hull restored to 100%!', 'success');
    } else if (opt.reward === 'shield_boost') {
      this.ship.shields = { fwd: 100, aft: 100, port: 100, stbd: 100 };
      this.ship.energy = 100;
      rewardLabel = 'REWARD: ALL SHIELDS & WARP ENERGY 100%';
      this.addLog('Dilithium Matrix Recrystallized: All Shields & Warp Energy at 100%!', 'success');
    } else if (opt.reward === 'pacify_sector') {
      this.enemies.forEach(e => { e.hostile = false; e.hull = 0; });
      rewardLabel = 'REWARD: SECTOR PACIFIED PEACEFULLY';
      this.checkSectorCompletion();
    } else if (opt.reward === 'borg_sleep_virus') {
      const borg = this.enemies.find(e => (e.type === 'borg' || e.type === 'borg_queen') && e.hull > 0);
      if (borg) {
        borg.shields = 0;
        borg.invulnerable = false;
        borg.hull = Math.max(85, Math.round(borg.hull * 0.55));
        rewardLabel = 'REWARD: BORG SHIELDS COLLAPSED & HULL CRIPPLED';
        this.addLog('BORG COLLECTIVE DISRUPTED! Borg shields collapsed and hull severely damaged by Data’s neural link!', 'success');
      }
    } else if (opt.reward === 'queen_core_sabotage') {
      // Destroy any tethered spheres, strip Queen's invulnerability & shields, and deal heavy hull damage!
      this.enemies.forEach(e => {
        if (e.isTetherSphere && e.hull > 0) {
          e.hull = 0;
        }
      });
      const queen = this.enemies.find(e => e.isFinalBoss && e.hull > 0);
      if (queen) {
        queen.invulnerable = false;
        queen.shields = 0;
        queen.phase = 3;
        queen.hull = Math.max(60, Math.round(queen.hull * 0.28));
        this.selectedTargetId = queen.id;
      }
      rewardLabel = 'REWARD: QUEEN’S OMEGA CORE SABOTAGED (-70% BOSS HULL & SHIELDS)!';
      this.addLog('AWAY TEAM CRITICAL STRIKE! The Borg Queen’s Transphasic Shield & Tether Spheres have been destroyed and her Command Diamond is crippled!', 'success');
    } else if (opt.reward === 'full_overcharge') {
      this.ship.hull = 100;
      this.ship.shields = { fwd: 100, aft: 100, port: 100, stbd: 100 };
      this.ship.torpedoes = 12;
      this.enemies.forEach(e => { e.shields = 0; });
      rewardLabel = 'REWARD: ALL SYSTEMS OVERCHARGED & HOSTILE SHIELDS COLLAPSED';
      this.addLog('Anti-Time Convergence Complete! All Enterprise systems overcharged & hostile shields collapsed!', 'success');
    }

    this.lastAwayOutcome = {
      success,
      badge: rewardLabel,
      text: outcomeText
    };

    // Advance stage or show completion
    if (this.awayStageIndex + 1 < mission.stages.length) {
      this.awayStageIndex++;
      this.renderAwayDeck();
    } else {
      const stageBox = document.getElementById('awayNarrativeStageBox');
      stageBox.innerHTML = `
        <div style="background:rgba(40,180,100,0.16);border:2px solid var(--lcars-green);border-radius:10px;padding:16px;">
          <h3 style="font-family:var(--font-lcars);color:var(--lcars-green);letter-spacing:1px;font-size:1.2rem;">
            ★ AWAY TEAM MISSION ACCOMPLISHED — ${rewardLabel}
          </h3>
          <p class="hail-speech-text" style="margin:10px 0;">${outcomeText}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="lcars-choice-btn" id="btnBeamBackBridge">
              <span>“O’Brien, four to beam directly to the Bridge!”</span>
              <span class="choice-tag">RETURN TO VIEWSCREEN</span>
            </button>
            <button class="lcars-choice-btn" id="btnReplayAway">
              <span>Re-run Away Team Expedition</span>
              <span class="choice-tag">RESET STAGES</span>
            </button>
          </div>
        </div>
      `;
      document.getElementById('btnBeamBackBridge').addEventListener('click', () => {
        this.awayBeamedDown = false;
        this.triggerTransporterEffect();
        this.switchDeck('tactical');
      });
      document.getElementById('btnReplayAway').addEventListener('click', () => {
        this.awayStageIndex = 0;
        this.awayBeamedDown = false;
        this.lastAwayOutcome = null;
        this.renderAwayDeck();
      });
    }
  }

  // ==========================================================================
  // ASTROMETRICS & SECTOR NAVIGATION DECK
  // ==========================================================================
  renderAstrometricsDeck() {
    const grid = document.getElementById('sectorCardsGrid');
    grid.innerHTML = '';

    window.SECTORS.forEach((sec, idx) => {
      const isCurrent = idx === this.currentSectorIndex;
      const isDone = this.completedSectors.has(sec.id);

      const card = document.createElement('div');
      card.className = `sector-card ${isCurrent ? 'current-sector' : ''} ${isDone ? 'completed-sector' : ''}`;
      card.innerHTML = `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--lcars-peach);">${sec.code}</span>
            <span style="font-family:var(--font-lcars);font-size:0.72rem;padding:2px 8px;border-radius:99px;background:${isDone ? 'var(--lcars-green)' : (isCurrent ? 'var(--lcars-ice)' : '#253252')};color:#000;">
              ${isDone ? 'COMPLETED' : (isCurrent ? 'ACTIVE SECTOR' : 'WARP READY')}
            </span>
          </div>
          <h3 style="font-family:var(--font-lcars);color:var(--lcars-gold);font-size:1.1rem;margin:4px 0;">${sec.name}</h3>
          <p style="font-size:0.74rem;color:var(--lcars-blue);margin-bottom:6px;">${sec.sub}</p>
          <p style="font-size:0.76rem;color:var(--text-primary);line-height:1.35;">${sec.briefing}</p>
        </div>
        <button class="tac-btn phaser" style="width:100%;justify-content:center;margin-top:6px;">
          ENGAGE WARP TO ${sec.name.toUpperCase()}
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        window.starfleetAudio.playWarp();
        this.loadSector(idx);
      });
      grid.appendChild(card);
    });

    // Bind Custom Tactical Skirmish Spawner buttons
    document.querySelectorAll('.spawn-skirmish-btn').forEach(btn => {
      btn.onclick = () => {
        const shipType = btn.dataset.type;
        this.spawnCustomEnemy(shipType);
        this.switchDeck('tactical');
      };
    });
  }

  spawnCustomEnemy(type) {
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 520;
    const templates = {
      warbird: {
        name: 'IRW Khazara (Romulan Warbird)',
        faction: 'Romulan Star Empire',
        commander: 'Commander Toreth',
        portrait: 'tomalak',
        type: 'warbird',
        hull: 220,
        maxHull: 220,
        shields: 180,
        maxShields: 180,
        canCloak: true
      },
      klingon: {
        name: 'IKS Bortas (Klingon Cruiser)',
        faction: 'Klingon Empire',
        commander: 'Captain Kurn',
        portrait: 'duras',
        type: 'klingon',
        hull: 190,
        maxHull: 190,
        shields: 145,
        maxShields: 145,
        canCloak: true
      },
      cardassian: {
        name: 'CMS Prakesh (Galor Warship)',
        faction: 'Cardassian Union',
        commander: 'Gul Dukat',
        portrait: 'macet',
        type: 'cardassian',
        hull: 210,
        maxHull: 210,
        shields: 170,
        maxShields: 170,
        canCloak: false
      },
      borg: {
        name: 'Borg Tactical Cube',
        faction: 'The Borg Collective',
        commander: 'The Collective',
        portrait: 'borg',
        type: 'borg',
        hull: 380,
        maxHull: 380,
        shields: 280,
        maxShields: 280,
        adapts: true,
        canCloak: false
      },
      borg_queen: {
        name: 'Borg Queen’s Command Diamond (Unimatrix 01)',
        faction: 'The Borg Collective — Supreme Nexus',
        commander: 'The Borg Queen',
        portrait: 'borgQueen',
        type: 'borg_queen',
        isFinalBoss: true,
        phase: 1,
        maxPhase: 3,
        invulnerable: false,
        omegaTimer: 10.0,
        hull: 750,
        maxHull: 750,
        shields: 450,
        maxShields: 450,
        adapts: true,
        canCloak: false
      }
    };

    const tpl = templates[type] || templates.warbird;
    const newEnemy = {
      ...tpl,
      id: `custom_${Date.now()}`,
      hostile: true,
      freq: +(243 + Math.random() * 14).toFixed(1),
      x: w * (0.35 + Math.random() * 0.45),
      y: h * (0.2 + Math.random() * 0.4),
      vx: 0,
      vy: 0,
      angle: Math.PI,
      fireTimer: 2.0,
      cloaked: false,
      cloakTimer: 0,
      hitsOnCurrentFreq: 0
    };
    this.enemies.push(newEnemy);
    this.selectedTargetId = newEnemy.id;
    this.setAlertLevel('red');
    this.addLog(`Sensors detect hostile vessel dropping out of warp: ${newEnemy.name}!`, 'alert');
    this.updateTargetHUD();
  }

  // ==========================================================================
  // MAIN GAME LOOP & SIMULATION STEP
  // ==========================================================================
  loop(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Stardate tick
    this.stardate += dt * 0.04;
    document.getElementById('stardateReadout').textContent = `STARDATE ${this.stardate.toFixed(1)}`;

    // Cooldowns
    this.ship.phaserCooldown = Math.max(0, this.ship.phaserCooldown - dt);
    this.ship.torpedoCooldown = Math.max(0, this.ship.torpedoCooldown - dt);
    this.ship.evasiveTimer = Math.max(0, this.ship.evasiveTimer - dt);

    if (this.ship.picardDecoy) {
      this.ship.picardDecoy.timer -= dt;
      if (this.ship.picardDecoy.timer <= 0) this.ship.picardDecoy = null;
    }

    // Crew cooldowns
    window.CREW_ROSTER.forEach(c => {
      if (this.crewCooldowns[c.id] > 0) {
        this.crewCooldowns[c.id] = Math.max(0, this.crewCooldowns[c.id] - dt);
      }
      const btn = document.getElementById(`crew-btn-${c.id}`);
      if (btn) {
        if (this.crewCooldowns[c.id] > 0) {
          btn.disabled = true;
          btn.textContent = `${Math.ceil(this.crewCooldowns[c.id])}s`;
        } else {
          btn.disabled = false;
          btn.textContent = 'ENGAGE';
        }
      }
    });

    // Warp Core Energy & Shield Regeneration
    const warpHealth = this.ship.subsystems.warp / 100;
    this.ship.energy = Math.min(100, this.ship.energy + dt * 5.2 * warpHealth);

    const shieldRegen = (this.ship.power.shields / 100) * 4.2 * (this.ship.subsystems.shields / 100) * dt;
    ['fwd', 'aft', 'port', 'stbd'].forEach(arc => {
      this.ship.shields[arc] = Math.min(100, this.ship.shields[arc] + shieldRegen);
    });

    // Helm Movement (Keyboard WASD / Arrows or Waypoint)
    const maxSpeed = (85 + this.ship.power.engines * 2.2) * (this.ship.subsystems.impulse / 100);
    const turnSpeed = 2.6 + (this.ship.power.engines / 100) * 1.6;

    if (this.keys['a'] || this.keys['arrowleft']) {
      this.ship.angle -= turnSpeed * dt;
      this.ship.targetX = null;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.ship.angle += turnSpeed * dt;
      this.ship.targetX = null;
    }

    let thrust = 0;
    if (this.keys['w'] || this.keys['arrowup']) {
      thrust = maxSpeed;
      this.ship.targetX = null;
    } else if (this.keys['s'] || this.keys['arrowdown']) {
      thrust = -maxSpeed * 0.55;
      this.ship.targetX = null;
    } else if (this.ship.targetX !== null && this.ship.targetY !== null) {
      const dx = this.ship.targetX - this.ship.x;
      const dy = this.ship.targetY - this.ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 14) {
        const desired = Math.atan2(dy, dx);
        const diff = Math.atan2(Math.sin(desired - this.ship.angle), Math.cos(desired - this.ship.angle));
        this.ship.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed * dt);
        thrust = Math.min(maxSpeed, dist * 1.8);
      } else {
        this.ship.targetX = null;
        this.ship.targetY = null;
      }
    }

    if (thrust !== 0) {
      this.ship.vx = Math.cos(this.ship.angle) * thrust;
      this.ship.vy = Math.sin(this.ship.angle) * thrust;
    } else {
      this.ship.vx *= 0.92;
      this.ship.vy *= 0.92;
    }

    this.ship.x = Math.min(Math.max(this.ship.x + this.ship.vx * dt, 42), this.canvas.width - 42);
    this.ship.y = Math.min(Math.max(this.ship.y + this.ship.vy * dt, 42), this.canvas.height - 42);

    // Update Enemy Ships AI
    this.enemies.forEach(en => {
      if (en.hull <= 0) return;

      // Target either Picard Maneuver decoy or Enterprise
      const aimTarget = this.ship.picardDecoy || this.ship;
      const dx = aimTarget.x - en.x;
      const dy = aimTarget.y - en.y;
      const dist = Math.hypot(dx, dy);
      const desiredAngle = Math.atan2(dy, dx);
      const diff = Math.atan2(Math.sin(desiredAngle - en.angle), Math.cos(desiredAngle - en.angle));
      en.angle += diff * 1.6 * dt;

      if (en.hostile && this.activeDeck === 'tactical') {
        // Movement orbit
        const speed = en.type === 'klingon' ? 68 : (en.type === 'borg' || en.type === 'borg_queen' ? 36 : 52);
        if (dist > 195) {
          en.x += Math.cos(en.angle) * speed * dt;
          en.y += Math.sin(en.angle) * speed * dt;
        } else if (dist < 125) {
          en.x -= Math.cos(en.angle) * speed * 0.5 * dt;
          en.y -= Math.sin(en.angle) * speed * 0.5 * dt;
        } else {
          // Strafe orbit
          en.x += Math.cos(en.angle + Math.PI / 2) * speed * 0.65 * dt;
          en.y += Math.sin(en.angle + Math.PI / 2) * speed * 0.65 * dt;
        }

        // Final Boss Phase II Regeneration & Phase III Omega Shockwave
        if (en.isFinalBoss) {
          if (en.invulnerable) {
            en.shields = Math.min(en.maxShields, en.shields + 8 * dt);
          }
          if (en.phase === 3) {
            en.omegaTimer = (en.omegaTimer || 7.0) - dt;
            if (en.omegaTimer <= 0) {
              en.omegaTimer = 7.5;
              // Fire 8-way radial Omega Particle Torpedo Burst!
              window.starfleetAudio.playTorpedo();
              this.spawnExplosion(en.x, en.y, '#33ff88', 24);
              this.addFloatingText(en.x, en.y - 32, 'OMEGA SHOCKWAVE!', '#ff3344');
              for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                this.projectiles.push({
                  x: en.x,
                  y: en.y,
                  vx: Math.cos(a) * 195,
                  vy: Math.sin(a) * 195,
                  target: null,
                  fromPlayer: false,
                  delay: 0,
                  color: '#33ff88',
                  life: 4.0
                });
              }
            }
          }
        }

        // Romulan / Klingon Cloak Cycle
        if (en.canCloak) {
          en.cloakTimer += dt;
          if (!en.cloaked && en.cloakTimer > 9.5) {
            en.cloaked = true;
            en.cloakTimer = 0;
            this.addFloatingText(en.x, en.y - 20, 'CLOAKING DEVICE ENGAGED', '#44ffaa');
          } else if (en.cloaked && en.cloakTimer > 3.2) {
            en.cloaked = false;
            en.cloakTimer = 0;
            this.addFloatingText(en.x, en.y - 20, 'DECLOAKING!', '#ffaa44');
          }
        }

        // Enemy Weapons Fire
        if (!en.cloaked) {
          en.fireTimer -= dt;
          if (en.fireTimer <= 0) {
            en.fireTimer = en.type === 'borg_queen' ? 2.0 : (en.type === 'borg' ? 2.4 : 2.9 + Math.random() * 1.4);
            if (en.type === 'borg' || en.type === 'borg_queen' || en.type === 'borg_sphere' || en.type === 'cardassian' || en.type === 'crystalline') {
              // Beam attack
              const isBorgType = en.type.startsWith('borg');
              const beamCol = en.type === 'borg_queen' ? '#00ffaa' : (isBorgType ? '#22ff66' : (en.type === 'cardassian' ? '#ffaa22' : '#88eeff'));
              window.starfleetAudio.playPhaser(isBorgType);
              this.beams.push({
                x1: en.x,
                y1: en.y,
                x2: aimTarget.x,
                y2: aimTarget.y,
                color: beamCol,
                coreColor: '#ffffff',
                width: en.type === 'borg_queen' ? 5.5 : 4,
                alpha: 1,
                duration: 0.38
              });
              if (!this.ship.picardDecoy) {
                const beamDmg = en.type === 'borg_queen' ? 18 : (en.type === 'borg' ? 15 : 11);
                this.applyDamageToEnterprise(en.x, en.y, beamDmg);
              } else {
                this.addFloatingText(aimTarget.x, aimTarget.y - 16, 'DECOY HIT!', '#ffcc66');
              }
            } else {
              // Disruptor / Plasma Torpedo bolt
              this.spawnTorpedo(en.x, en.y, aimTarget, false, 0);
            }
          }
        }
      }
    });

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Slight homing guidance
      if (p.target && (p.fromPlayer ? p.target.hull > 0 : true)) {
        const desired = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        const cur = Math.atan2(p.vy, p.vx);
        const diff = Math.atan2(Math.sin(desired - cur), Math.cos(desired - cur));
        const speed = Math.hypot(p.vx, p.vy);
        const nextAngle = cur + diff * 2.5 * dt;
        p.vx = Math.cos(nextAngle) * speed;
        p.vy = Math.sin(nextAngle) * speed;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.fromPlayer) {
        for (const en of this.enemies) {
          if (en.hull <= 0) continue;
          if (Math.hypot(p.x - en.x, p.y - en.y) < 28) {
            this.applyDamageToEnemy(en, 34);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      } else {
        const targetObj = this.ship.picardDecoy || this.ship;
        if (Math.hypot(p.x - targetObj.x, p.y - targetObj.y) < 26) {
          if (!this.ship.picardDecoy) {
            this.applyDamageToEnterprise(p.x, p.y, 14);
          } else {
            this.addFloatingText(targetObj.x, targetObj.y - 16, 'DECOY ABSORBED!', '#ffcc66');
          }
          this.projectiles.splice(i, 1);
        }
      }
    }

    // Update Beams
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.alpha -= dt / b.duration;
      if (b.alpha <= 0) this.beams.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha -= dt * 1.4;
      if (pt.alpha <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 22 * dt;
      ft.alpha -= dt * 0.75;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    this.updateLeftTelemetryUI();
    this.updateTargetHUD();
  }

  updateLeftTelemetryUI() {
    document.getElementById('hullBarFill').style.width = `${this.ship.hull}%`;
    document.getElementById('hullValText').textContent = `${Math.round(this.ship.hull)}%`;

    const avgShields = (this.ship.shields.fwd + this.ship.shields.aft + this.ship.shields.port + this.ship.shields.stbd) / 4;
    document.getElementById('shieldBarFill').style.width = `${avgShields}%`;
    document.getElementById('shieldValText').textContent = `${Math.round(avgShields)}%`;

    document.getElementById('energyBarFill').style.width = `${this.ship.energy}%`;
    document.getElementById('energyValText').textContent = `${Math.round(this.ship.energy)}%`;

    document.getElementById('torpedoCountText').textContent = `${this.ship.torpedoes} / ${this.ship.maxTorpedoes}`;

    // Update 4 Shield Quadrant pills
    ['fwd', 'aft', 'port', 'stbd'].forEach(arc => {
      const el = document.getElementById(`shield-arc-${arc}`);
      if (el) el.textContent = `${arc.toUpperCase()} ${Math.round(this.ship.shields[arc])}%`;
    });

    // Update Subsystems
    Object.entries(this.ship.subsystems).forEach(([sys, val]) => {
      const pill = document.getElementById(`sys-${sys}`);
      if (pill) {
        pill.classList.toggle('damaged', val < 85 && val >= 45);
        pill.classList.toggle('critical', val < 45);
        pill.querySelector('.sys-pct').textContent = `${Math.round(val)}%`;
      }
    });
  }

  updateTargetHUD() {
    const target = this.getSelectedTarget();
    const box = document.getElementById('hudTargetBox');
    const bossBanner = document.getElementById('bossHudBanner');

    // Update Final Boss 3-Phase Banner if a Final Boss is alive in the sector
    const boss = this.enemies.find(e => e.isFinalBoss && e.hull > 0);
    if (bossBanner) {
      if (boss) {
        bossBanner.classList.remove('hidden');
        const phaseLabels = {
          1: 'PHASE I / III — ASSIMILATION MATRIX',
          2: boss.invulnerable ? 'PHASE II / III — TRANSPHASIC SHIELD (DESTROY SPHERES!)' : 'PHASE II / III — SHIELD BROKEN',
          3: `PHASE III / III — OMEGA OVERLOAD (${Math.ceil(boss.omegaTimer || 0)}s)`
        };
        const pillClass = boss.invulnerable ? 'invulnerable' : (boss.phase === 3 ? 'omega' : '');
        bossBanner.innerHTML = `
          <div class="boss-hud-header">
            <span>👑 ${boss.name}</span>
            <span class="boss-phase-pill ${pillClass}">${phaseLabels[boss.phase] || 'PHASE I'}</span>
          </div>
          <div class="boss-bars-stack">
            <div class="boss-bar-track">
              <div class="boss-bar-fill-shields" style="width:${(boss.shields / boss.maxShields) * 100}%"></div>
            </div>
            <div class="boss-bar-track">
              <div class="boss-bar-fill-hull" style="width:${(boss.hull / boss.maxHull) * 100}%"></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;color:#99ffcc;margin-top:4px;">
            <span>SHIELDS: ${Math.round(boss.shields)} / ${boss.maxShields}</span>
            <span>HARMONIC FREQ: ${boss.freq.toFixed(1)} MHz (HITS: ${boss.hitsOnCurrentFreq || 0}/3)</span>
            <span>HULL: ${Math.round(boss.hull)} / ${boss.maxHull}</span>
          </div>
        `;
      } else {
        bossBanner.classList.add('hidden');
      }
    }

    if (!target) {
      box.innerHTML = `
        <div class="hud-target-name"><span>NO HOSTILE TARGET</span><span style="color:var(--lcars-green)">CLEAR</span></div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">Click Astrometrics to warp or open Away Team Deck.</div>
      `;
      return;
    }

    const freqKnown = this.scannedTargets.has(target.id) || target.isFinalBoss;
    box.innerHTML = `
      <div class="hud-target-name">
        <span>${target.name}</span>
        <span style="color:${target.hostile ? 'var(--lcars-salmon)' : 'var(--lcars-ice)'}">${target.hostile ? 'HOSTILE' : 'STANDBY'}</span>
      </div>
      <div class="stat-row" style="margin-top:4px;">
        <span class="stat-label" style="min-width:52px;">SHIELDS</span>
        <div class="stat-bar-wrap"><div class="stat-bar-fill fill-shields" style="width:${(target.shields / target.maxShields) * 100}%"></div></div>
        <span class="stat-value">${Math.round((target.shields / target.maxShields) * 100)}%</span>
      </div>
      <div class="stat-row" style="margin-top:3px;">
        <span class="stat-label" style="min-width:52px;">HULL</span>
        <div class="stat-bar-wrap"><div class="stat-bar-fill fill-hull" style="width:${(target.hull / target.maxHull) * 100}%"></div></div>
        <span class="stat-value">${Math.round((target.hull / target.maxHull) * 100)}%</span>
      </div>
      <div style="font-size:0.68rem;color:var(--lcars-peach);margin-top:4px;display:flex;justify-content:space-between;">
        <span>CMDR: ${target.commander}</span>
        <span>FREQ: ${freqKnown ? target.freq.toFixed(1) + ' MHz' : 'SCAN TO REVEAL'}</span>
      </div>
    `;
  }

  // ==========================================================================
  // TACTICAL CANVAS RENDERING (ENTERPRISE-D, ENEMIES, PLANETS, EFFECTS)
  // ==========================================================================
  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Tactical LCARS Sector Grid
    ctx.strokeStyle = 'rgba(102, 153, 255, 0.06)';
    ctx.lineWidth = 1;
    const step = 64;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Background Starfield
    this.stars.forEach(s => {
      ctx.fillStyle = s.tint;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 3. Sector Planet & Anomaly
    const sector = window.SECTORS[this.currentSectorIndex];
    if (sector.anomaly) {
      const ax = sector.anomaly.x * w;
      const ay = sector.anomaly.y * h;
      const grad = ctx.createRadialGradient(ax, ay, 4, ax, ay, sector.anomaly.radius);
      grad.addColorStop(0, sector.anomaly.color);
      grad.addColorStop(0.5, 'rgba(102, 204, 255, 0.22)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ax, ay, sector.anomaly.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(204, 235, 255, 0.65)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sector.anomaly.name.toUpperCase(), ax, ay + sector.anomaly.radius + 12);
    }

    if (sector.planet) {
      const px = sector.planet.x * w;
      const py = sector.planet.y * h;
      const pr = sector.planet.radius;

      const pGrad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
      pGrad.addColorStop(0, sector.planet.color1);
      pGrad.addColorStop(1, sector.planet.color2);

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      if (sector.planet.ring) {
        ctx.strokeStyle = 'rgba(255, 204, 153, 0.35)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.55, pr * 0.38, -0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffcc99';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sector.planet.name.toUpperCase(), px, py + pr + 16);

      if (this.awayBeamedDown) {
        const pulse = 6 + Math.sin(performance.now() * 0.008) * 3;
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#44ffaa';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('★ AWAY TEAM ON SURFACE', px, py - pr - 10);
      }
    }

    // 4. Helm Waypoint Indicator
    if (this.ship.targetX !== null && this.ship.targetY !== null) {
      ctx.strokeStyle = 'rgba(102, 204, 255, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.ship.x, this.ship.y);
      ctx.lineTo(this.ship.targetX, this.ship.targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#66ccff';
      ctx.beginPath();
      ctx.arc(this.ship.targetX, this.ship.targetY, 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. Picard Maneuver Decoy Ghost
    if (this.ship.picardDecoy) {
      ctx.save();
      ctx.globalAlpha = 0.45 + Math.sin(performance.now() * 0.02) * 0.15;
      this.drawEnterpriseHull(ctx, this.ship.picardDecoy.x, this.ship.picardDecoy.y, this.ship.picardDecoy.angle, true);
      ctx.restore();
    }

    // 5b. Draw Phase II Transphasic Tether Beams from Borg Spheres to Borg Queen Boss
    const boss = this.enemies.find(e => e.isFinalBoss && e.hull > 0);
    if (boss) {
      this.enemies.forEach(sp => {
        if (sp.isTetherSphere && sp.hull > 0) {
          ctx.save();
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 2.6;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(boss.x, boss.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      });
    }

    // 6. Draw Enemy Vessels
    this.enemies.forEach(en => {
      if (en.hull <= 0) return;
      this.drawEnemyShip(ctx, en);
    });

    // 7. Draw USS Enterprise NCC-1701-D
    this.drawEnterpriseHull(ctx, this.ship.x, this.ship.y, this.ship.angle, false);

    // 8. Draw Phaser & Disruptor Beams
    this.beams.forEach(b => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.width;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();

      ctx.strokeStyle = b.coreColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    });

    // 9. Draw Photon Torpedoes
    this.projectiles.forEach(p => {
      if (p.delay > 0) return;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. Draw Particles & Floating Combat Text
    this.particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  drawEnterpriseHull(ctx, x, y, angle, isDecoy) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Directional Shield Bubble Glow
    if (!isDecoy) {
      const avgS = (this.ship.shields.fwd + this.ship.shields.aft + this.ship.shields.port + this.ship.shields.stbd) / 4;
      if (avgS > 5) {
        ctx.strokeStyle = `rgba(102, 204, 255, ${0.15 + (avgS / 100) * 0.25})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 26, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Nacelle Pylons
    ctx.strokeStyle = '#99aacc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-18, -16);
    ctx.moveTo(-10, 6);
    ctx.lineTo(-18, 16);
    ctx.stroke();

    // Port & Starboard Warp Nacelles (Blue Cherenkov Glow + Red Bussard Collectors)
    [-16, 16].forEach(ny => {
      ctx.fillStyle = '#bcc8dc';
      ctx.fillRect(-26, ny - 2.5, 22, 5);
      // Blue warp field grille
      ctx.fillStyle = '#44bbff';
      ctx.fillRect(-24, ny - 1.2, 16, 2.4);
      // Red Bussard collector tip
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(-4, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Engineering Secondary Hull (Stardrive Section)
    ctx.fillStyle = '#c8d4e6';
    ctx.beginPath();
    ctx.ellipse(-8, 0, 14, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Galaxy-Class Elliptical Saucer Section
    ctx.fillStyle = isDecoy ? '#88ddff' : '#dce6f5';
    ctx.strokeStyle = '#667799';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(10, 0, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dorsal Phaser Array Strip Ring & Bridge Dome
    ctx.strokeStyle = '#8899bb';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(10, 0, 11, 15, 0, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Label below ship
    ctx.fillStyle = isDecoy ? '#ffcc66' : '#99ccff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isDecoy ? 'WARP DECOY' : 'NCC-1701-D', x, y + 34);
  }

  drawEnemyShip(ctx, en) {
    ctx.save();
    ctx.translate(en.x, en.y);

    if (en.cloaked) {
      ctx.globalAlpha = 0.22;
    }

    // Target selection reticle
    if (en.id === this.selectedTargetId) {
      ctx.strokeStyle = en.hostile ? '#ff5555' : '#66ccff';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, en.isFinalBoss ? 44 : 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.rotate(en.angle);

    if (en.type === 'borg_queen') {
      // FINAL BOSS: Borg Queen's Octahedral Command Diamond (Unimatrix 01)
      const spin = performance.now() * 0.0008;
      ctx.rotate(-en.angle + spin);

      // Phase II Invulnerability Shield Halo or Phase III Omega Aura
      if (en.invulnerable) {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();
      } else if (en.phase === 3) {
        ctx.strokeStyle = 'rgba(255, 51, 68, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 38 + Math.sin(performance.now() * 0.015) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer Octahedral Diamond Hull
      ctx.fillStyle = '#0e1f18';
      ctx.strokeStyle = '#33ff88';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(34, 0);
      ctx.lineTo(0, 34);
      ctx.lineTo(-34, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Counter-Rotating Octahedron Matrix
      ctx.rotate(-spin * 2.2);
      ctx.strokeStyle = '#66ffcc';
      ctx.fillStyle = 'rgba(51, 255, 136, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(20, 0);
      ctx.lineTo(0, 20);
      ctx.lineTo(-20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Queen's Nexus Omega Core
      ctx.fillStyle = en.phase === 3 ? '#ff3355' : '#55ffaa';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (en.type === 'borg_sphere') {
      // Tethered Borg Tactical Sphere
      ctx.rotate(-en.angle + performance.now() * 0.0015);
      ctx.fillStyle = '#13261c';
      ctx.strokeStyle = '#33ff88';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(102, 255, 170, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0, 7, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (en.type === 'warbird') {
      // Romulan D'deridex Warbird (Crescent Green Eagle Hull)
      ctx.fillStyle = '#2d6e4e';
      ctx.strokeStyle = '#55cc88';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.quadraticCurveTo(4, -24, -18, -20);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-16, 0);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-18, 20);
      ctx.quadraticCurveTo(4, 24, 22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (en.type === 'klingon') {
      // Klingon Bird-of-Prey (Swept Forward Wings + Disruptor Tips)
      ctx.fillStyle = '#4e5944';
      ctx.strokeStyle = '#99aa77';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(4, -4);
      ctx.lineTo(8, -20);
      ctx.lineTo(-14, -14);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-14, 14);
      ctx.lineTo(8, 20);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (en.type === 'borg') {
      // Borg Cube (Isometric Cybernetic Matrix)
      ctx.rotate(-en.angle + performance.now() * 0.0003);
      ctx.fillStyle = '#18241e';
      ctx.strokeStyle = '#33ff77';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-22, -22, 44, 44);
      ctx.strokeRect(-22, -22, 44, 44);

      ctx.strokeStyle = 'rgba(51, 255, 119, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-22, -7); ctx.lineTo(22, -7);
      ctx.moveTo(-22, 7); ctx.lineTo(22, 7);
      ctx.moveTo(-7, -22); ctx.lineTo(-7, 22);
      ctx.moveTo(7, -22); ctx.lineTo(7, 22);
      ctx.stroke();
    } else if (en.type === 'cardassian') {
      // Cardassian Galor-Class (Ochre Delta Hull)
      ctx.fillStyle = '#9c7838';
      ctx.strokeStyle = '#ffcc66';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-4, -18);
      ctx.lineTo(-18, -6);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-18, 6);
      ctx.lineTo(-4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Crystalline Entity Lattice
      ctx.rotate(performance.now() * 0.0012);
      ctx.strokeStyle = '#99f2ff';
      ctx.fillStyle = 'rgba(153, 242, 255, 0.25)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24, -5);
        ctx.lineTo(28, 0);
        ctx.lineTo(24, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();

    // Mini Health Bar & Name
    ctx.fillStyle = en.isFinalBoss ? '#44ff88' : (en.hostile ? '#ff8888' : '#99ccff');
    ctx.font = en.isFinalBoss ? 'bold 11px monospace' : '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(en.name, en.x, en.y + (en.isFinalBoss ? 48 : 36));
  }

  spawnExplosion(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: 1.5 + Math.random() * 2.5,
        color,
        alpha: 1.0
      });
    }
  }

  spawnPing(x, y, color) {
    this.spawnExplosion(x, y, color, 8);
  }

  addFloatingText(x, y, text, color = '#ffcc66') {
    this.floatingTexts.push({ x, y, text, color, alpha: 1.3 });
  }

  addLog(message, type = 'info') {
    const feed = document.getElementById('captainsLogFeed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = `[SD ${this.stardate.toFixed(1)}] ${message}`;
    feed.prepend(div);
    while (feed.children.length > 35) {
      feed.removeChild(feed.lastChild);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.enterpriseGame = new EnterpriseGame();
});
