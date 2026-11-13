/* ============ ATHLETE//01 ============ */
(function(){
  'use strict';

  /* ============ CUSTOM CURSOR ============ */
  const isDesktop = window.matchMedia('(pointer: fine)').matches;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (isDesktop && dot && ring) {
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const bindHover = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, .program-row, .coach-card, .story-card, .session-row').forEach(el => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
      });
    };
    bindHover();
    window.__bindCursorHover = bindHover;
  }

  /* ============ NAVBAR ============ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Active section indicator */
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const sections = ['hero','performance','programs','coaches','schedule','memberships','stories','booking','contact'];
  const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = en.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sectionEls.forEach(s => secObs.observe(s));

  /* ============ MOBILE MENU ============ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const openMenu = () => {
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  };
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  mobileClose.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  /* ============ SMOOTH SCROLL ============ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 60;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ============ HERO PARALLAX ============ */
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = `translateY(${y * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ============ REVEAL ON SCROLL ============ */
  const revealEls = document.querySelectorAll('.section-head, .pi-layout, .programs-list, .coaches-grid, .schedule-controls, .schedule-list, .memberships-grid, .stories-filters, .stories-grid, .challenge-inner, .booking-layout, .final-cta-inner');
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  /* ============ PERFORMANCE INDEX ============ */
  const piState = {
    strength: 5,
    endurance: 5,
    mobility: 5,
    consistency: 5
  };
  const piInitial = { ...piState };

  const piSlidersEl = document.getElementById('piSliders');
  const radarPolygon = document.getElementById('radarPolygon');
  const radarDots = document.getElementById('radarDots');
  const piScoreValue = document.getElementById('piScoreValue');
  const piProfile = document.getElementById('piProfile');
  const piDescription = document.getElementById('piDescription');

  const dimensions = [
    { key: 'strength', label: 'STRENGTH', angle: 'top' },
    { key: 'endurance', label: 'ENDURANCE', angle: 'right' },
    { key: 'mobility', label: 'MOBILITY', angle: 'bottom' },
    { key: 'consistency', label: 'CONSISTENCY', angle: 'left' }
  ];

  // Build sliders
  if (piSlidersEl) {
    dimensions.forEach(d => {
      const row = document.createElement('div');
      row.className = 'pi-slider-row';
      row.innerHTML = `
        <div class="pi-slider-head">
          <span class="pi-slider-label">${d.label}</span>
          <span class="pi-slider-value" data-prefix="${d.key.charAt(0).toUpperCase()}::" id="val-${d.key}">${piState[d.key]}/10</span>
        </div>
        <input type="range" min="1" max="10" value="${piState[d.key]}" data-dim="${d.key}" aria-label="${d.label}" />
      `;
      piSlidersEl.appendChild(row);
    });

    piSlidersEl.querySelectorAll('input[type=range]').forEach(input => {
      input.addEventListener('input', e => {
        const dim = e.target.dataset.dim;
        piState[dim] = parseInt(e.target.value, 10);
        document.getElementById(`val-${dim}`).textContent = `${piState[dim]}/10`;
        updateRadar();
      });
    });
  }

  function updateRadar() {
    // Center (200,200), max radius 160
    const cx = 200, cy = 200, maxR = 160;
    const rs = piState.strength * (maxR / 10);
    const re = piState.endurance * (maxR / 10);
    const rm = piState.mobility * (maxR / 10);
    const rc = piState.consistency * (maxR / 10);

    const top = { x: cx, y: cy - rs };
    const right = { x: cx + re, y: cy };
    const bottom = { x: cx, y: cy + rm };
    const left = { x: cx - rc, y: cy };

    const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;
    radarPolygon.setAttribute('points', points);
    radarPolygon.style.transition = 'all 0.35s cubic-bezier(0.22,0.61,0.36,1)';

    // Dots
    radarDots.innerHTML = `
      <circle cx="${top.x}" cy="${top.y}" r="4" fill="#C6FF35"/>
      <circle cx="${right.x}" cy="${right.y}" r="4" fill="#C6FF35"/>
      <circle cx="${bottom.x}" cy="${bottom.y}" r="4" fill="#C6FF35"/>
      <circle cx="${left.x}" cy="${left.y}" r="4" fill="#C6FF35"/>
    `;

    // Score
    const score = Math.round((piState.strength + piState.endurance + piState.mobility + piState.consistency) / 40 * 100);
    piScoreValue.textContent = score;

    // Profile logic
    const { strength, endurance, mobility, consistency } = piState;
    const avg = (strength + endurance + mobility + consistency) / 4;
    const max = Math.max(strength, endurance, mobility, consistency);
    const min = Math.min(strength, endurance, mobility, consistency);
    const spread = max - min;

    let profile, description;

    if (avg >= 8.5 && spread <= 2) {
      profile = 'ELITE PERFORMER';
      description = 'A complete, balanced profile at a high level. Your training is well-rounded — focus now on peaking and refinement.';
    } else if (avg >= 7 && spread <= 2.5) {
      profile = 'BALANCED ATHLETE';
      description = 'A strong balanced profile with consistent development across all dimensions. Great foundation for specific goals.';
    } else if (avg < 4 && spread <= 3) {
      profile = 'DEVELOPING ATHLETE';
      description = 'Early-stage baseline. Focus on building consistency first — the rest develops naturally from there.';
    } else if (spread <= 1.5) {
      profile = 'BALANCED ATHLETE';
      description = 'Your dimensions are evenly distributed. This is a versatile profile — great for a generalist training approach.';
    } else if (strength === max) {
      profile = 'STRENGTH SPECIALIST';
      description = 'Strength is your strongest dimension. Recommend adding mobility and conditioning work to unlock full performance.';
    } else if (endurance === max) {
      profile = 'ENDURANCE ENGINE';
      description = 'Endurance dominates your profile. Adding strength and consistency will improve power output and long-term progress.';
    } else if (mobility === max) {
      profile = 'MOVEMENT SPECIALIST';
      description = 'Mobility is your standout dimension. Strength and endurance development will round out your capacity.';
    } else if (consistency === max) {
      profile = 'DISCIPLINED ATHLETE';
      description = 'Consistency is your edge — a rare and valuable trait. Focus on periodized strength and endurance next.';
    } else {
      profile = 'BALANCED ATHLETE';
      description = 'A versatile profile. Adjust sliders to explore different training directions.';
    }

    piProfile.textContent = profile;
    piDescription.textContent = description;
  }

  // Initialize
  if (piSlidersEl) {
    updateRadar();

    const resetBtn = document.getElementById('piReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.keys(piInitial).forEach(k => { piState[k] = piInitial[k]; });
        dimensions.forEach(d => {
          document.getElementById(`val-${d.key}`).textContent = `${piState[d.key]}/10`;
          const slider = piSlidersEl.querySelector(`input[data-dim="${d.key}"]`);
          if (slider) slider.value = piState[d.key];
        });
        updateRadar();
      });
    }
  }

  /* ============ MODAL SYSTEM ============ */
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  function openModal(html) {
    modalContent.innerHTML = html;
    modalBackdrop.hidden = false;
    requestAnimationFrame(() => modalBackdrop.classList.add('open'));
    document.body.style.overflow = 'hidden';
    if (window.__bindCursorHover) window.__bindCursorHover();
  }
  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modalBackdrop.hidden = true; modalContent.innerHTML = ''; }, 300);
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', e => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
  });

  function bookProgramInForm(programName) {
    closeModal();
    const sel = document.getElementById('program');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toUpperCase() === programName.toUpperCase()) {
          sel.selectedIndex = i; break;
        }
      }
    }
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  }

  /* ============ PROGRAMS ============ */
  const programsData = [
    {
      num: '01',
      name: 'STRENGTH LAB',
      short: 'Structured strength training focused on technique and progressive development.',
      duration: '60 MIN',
      difficulty: 'ALL LEVELS',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85',
      overview: 'A structured strength development system built around progressive overload, technical precision and measurable output. Every session is planned — nothing is improvised.',
      structure: [
        'Movement assessment on entry',
        'Technique-first block (compound lifts)',
        'Progressive overload block',
        'Accessory and stability work',
        'Cool-down and mobility',
      ],
      benefits: 'Improved force production, joint stability and long-term strength foundations.',
    },
    {
      num: '02',
      name: 'CONDITIONING',
      short: 'Build endurance and improve overall athletic capacity.',
      duration: '45 MIN',
      difficulty: 'INTERMEDIATE',
      img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=85',
      overview: 'Cardio and metabolic conditioning that builds real-world endurance — not just time on the treadmill. Structured intervals, tempo work and progressive density.',
      structure: [
        'Warm-up and breathing prep',
        'Aerobic base block',
        'Interval block (zone 4–5)',
        'Recovery intervals',
        'Cool-down',
      ],
      benefits: 'Higher work capacity, faster recovery, improved cardiovascular efficiency.',
    },
    {
      num: '03',
      name: 'FUNCTIONAL MOVEMENT',
      short: 'Develop coordination, balance and movement quality.',
      duration: '50 MIN',
      difficulty: 'ALL LEVELS',
      img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85',
      overview: 'A movement-first program focused on quality, control and coordination. Bridges the gap between isolated strength training and real-world physical ability.',
      structure: [
        'Joint-by-joint warm-up',
        'Fundamental pattern practice',
        'Loaded movement patterns',
        'Balance and stability work',
        'Integrated flow',
      ],
      benefits: 'Better coordination, safer movement under load, reduced injury risk.',
    },
    {
      num: '04',
      name: 'MOBILITY SYSTEM',
      short: 'Improve flexibility and movement control.',
      duration: '40 MIN',
      difficulty: 'BEGINNER',
      img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=85',
      overview: 'A systematic mobility program that builds range of motion you can actually control. Not just stretching — active, loaded and measurable mobility work.',
      structure: [
        'Soft tissue prep',
        'Controlled articular rotations',
        'Loaded stretching',
        'End-range control drills',
        'Integration with breathing',
      ],
      benefits: 'Improved joint range, better movement control, reduced stiffness and pain.',
    }
  ];

  const programsList = document.getElementById('programsList');
  if (programsList) {
    programsData.forEach(p => {
      const row = document.createElement('div');
      row.className = 'program-row';
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.innerHTML = `
        <span class="program-num">${p.num}</span>
        <span class="program-name">${p.name}</span>
        <div class="program-meta"><span>DURATION</span>${p.duration}</div>
        <div class="program-meta"><span>LEVEL</span>${p.difficulty}</div>
        <span class="program-arrow">→</span>
      `;
      row.addEventListener('click', () => openProgramModal(p));
      row.addEventListener('keydown', e => { if (e.key === 'Enter') openProgramModal(p); });
      programsList.appendChild(row);
    });
  }

  function openProgramModal(p) {
    openModal(`
      <span class="modal-eyebrow">PROGRAM ${p.num} — ${p.name}</span>
      <img class="modal-img" src="${p.img}" alt="${p.name}">
      <h2>${p.name}</h2>
      <p class="modal-lead">${p.overview}</p>
      <div class="modal-meta">
        <div><span>DURATION</span><strong>${p.duration}</strong></div>
        <div><span>LEVEL</span><strong>${p.difficulty}</strong></div>
        <div><span>TYPE</span><strong>STRENGTH / PERFORMANCE</strong></div>
      </div>
      <h3 style="font-size:1rem;margin-bottom:.8rem">SESSION STRUCTURE</h3>
      <ul class="modal-list">
        ${p.structure.map(s => `<li>${s}</li>`).join('')}
      </ul>
      <p class="modal-sub">${p.benefits}</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-book-program="${p.name}">BOOK THIS PROGRAM <span>→</span></button>
        <button class="btn btn-ghost" data-close-modal>CLOSE</button>
      </div>
    `);
    modalContent.querySelector('[data-close-modal]').addEventListener('click', closeModal);
    modalContent.querySelector('[data-book-program]').addEventListener('click', () => bookProgramInForm(p.name));
  }

  /* ============ COACHES ============ */
  const coachesData = [
    {
      num: '01',
      name: 'ALEX MORGAN',
      role: 'Strength & Performance Coach',
      experience: '9 YEARS',
      img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=1200&q=85',
      bio: 'Alex specializes in structured strength development and technical lifting. His approach combines progressive overload with careful joint preparation.',
      approach: 'I train the fundamentals first — every rep is intentional. Strength isn\'t built by accident, it\'s engineered session by session.',
      programs: ['STRENGTH LAB', 'FUNCTIONAL MOVEMENT'],
    },
    {
      num: '02',
      name: 'DANIEL REED',
      role: 'Functional Training Coach',
      experience: '7 YEARS',
      img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=85',
      bio: 'Daniel focuses on movement quality and functional capacity. He bridges traditional strength training and real-world performance.',
      approach: 'The goal is to move better — not just lift heavier. Coordination and control always come first.',
      programs: ['FUNCTIONAL MOVEMENT', 'STRENGTH LAB'],
    },
    {
      num: '03',
      name: 'EMMA CARTER',
      role: 'Mobility Specialist',
      experience: '6 YEARS',
      img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=1200&q=85',
      bio: 'Emma works with athletes on mobility, range of motion and joint health. Her approach is systematic and measurable.',
      approach: 'Mobility is not stretching — it\'s control of your range. We build it like any other physical quality.',
      programs: ['MOBILITY SYSTEM'],
    },
    {
      num: '04',
      name: 'RYAN BLAKE',
      role: 'Conditioning Coach',
      experience: '8 YEARS',
      img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85',
      bio: 'Ryan builds endurance and cardiovascular capacity with a measured, data-informed approach. No wasted sessions.',
      approach: 'Conditioning is engineering — zone control, recovery, and progressive density. Not random suffering.',
      programs: ['CONDITIONING'],
    }
  ];

  const coachesGrid = document.getElementById('coachesGrid');
  if (coachesGrid) {
    coachesData.forEach(c => {
      const card = document.createElement('div');
      card.className = 'coach-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="coach-img-wrap">
          <span class="coach-num">${c.num}</span>
          <img src="${c.img}" alt="${c.name}" loading="lazy">
        </div>
        <div class="coach-info">
          <div class="coach-name">${c.name}</div>
          <div class="coach-role">${c.role}</div>
        </div>
      `;
      card.addEventListener('click', () => openCoachModal(c));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openCoachModal(c); });
      coachesGrid.appendChild(card);
    });
  }

  function openCoachModal(c) {
    openModal(`
      <span class="modal-eyebrow">COACH ${c.num} — ${c.role}</span>
      <img class="modal-img" src="${c.img}" alt="${c.name}">
      <h2>${c.name}</h2>
      <p class="modal-lead">${c.bio}</p>
      <div class="modal-meta">
        <div><span>EXPERIENCE</span><strong>${c.experience}</strong></div>
        <div><span>SPECIALTY</span><strong>${c.role}</strong></div>
        <div><span>PROGRAMS</span><strong>${c.programs.length}</strong></div>
      </div>
      <h3 style="font-size:1rem;margin-bottom:.8rem">TRAINING APPROACH</h3>
      <p class="modal-sub">"${c.approach}"</p>
      <h3 style="font-size:1rem;margin-bottom:.8rem">PROGRAMS</h3>
      <ul class="modal-list">
        ${c.programs.map(p => `<li>${p}</li>`).join('')}
      </ul>
      <div class="modal-actions">
        <button class="btn btn-primary" data-book-coach="${c.name}">BOOK WITH THIS COACH <span>→</span></button>
        <button class="btn btn-ghost" data-close-modal>CLOSE</button>
      </div>
    `);
    modalContent.querySelector('[data-close-modal]').addEventListener('click', closeModal);
    modalContent.querySelector('[data-book-coach]').addEventListener('click', () => {
      closeModal();
      const coachSel = document.getElementById('coach');
      if (coachSel) {
        for (let i = 0; i < coachSel.options.length; i++) {
          if (coachSel.options[i].text.toUpperCase() === c.name.toUpperCase()) {
            coachSel.selectedIndex = i; break;
          }
        }
      }
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ============ SCHEDULE ============ */
  const scheduleData = {
    MONDAY: [
      { time: '08:00', name: 'MORNING STRENGTH', coach: 'ALEX MORGAN', duration: '60 MIN', spots: 4, type: 'strength' },
      { time: '10:30', name: 'FUNCTIONAL FLOW', coach: 'DANIEL REED', duration: '50 MIN', spots: 8, type: 'functional' },
      { time: '14:00', name: 'CONDITIONING', coach: 'RYAN BLAKE', duration: '45 MIN', spots: 3, type: 'cardio' },
      { time: '18:00', name: 'EVENING PERFORMANCE', coach: 'ALEX MORGAN', duration: '60 MIN', spots: 6, type: 'strength' },
    ],
    TUESDAY: [
      { time: '07:30', name: 'MOBILITY WAKE-UP', coach: 'EMMA CARTER', duration: '40 MIN', spots: 5, type: 'mobility' },
      { time: '09:00', name: 'STRENGTH LAB', coach: 'ALEX MORGAN', duration: '60 MIN', spots: 2, type: 'strength' },
      { time: '12:30', name: 'LUNCH CONDITIONING', coach: 'RYAN BLAKE', duration: '45 MIN', spots: 7, type: 'cardio' },
      { time: '17:00', name: 'FUNCTIONAL MOVEMENT', coach: 'DANIEL REED', duration: '50 MIN', spots: 4, type: 'functional' },
    ],
    WEDNESDAY: [
      { time: '08:00', name: 'STRENGTH FOUNDATIONS', coach: 'ALEX MORGAN', duration: '60 MIN', spots: 5, type: 'strength' },
      { time: '11:00', name: 'DEEP MOBILITY', coach: 'EMMA CARTER', duration: '50 MIN', spots: 6, type: 'mobility' },
      { time: '15:00', name: 'AEROBIC BASE', coach: 'RYAN BLAKE', duration: '50 MIN', spots: 8, type: 'cardio' },
      { time: '19:00', name: 'FUNCTIONAL STRENGTH', coach: 'DANIEL REED', duration: '50 MIN', spots: 3, type: 'functional' },
    ],
    THURSDAY: [
      { time: '07:00', name: 'MORNING RUN', coach: 'RYAN BLAKE', duration: '45 MIN', spots: 10, type: 'cardio' },
      { time: '09:30', name: 'STRENGTH ACCESSORY', coach: 'ALEX MORGAN', duration: '55 MIN', spots: 4, type: 'strength' },
      { time: '13:00', name: 'FUNCTIONAL FLOW', coach: 'DANIEL REED', duration: '50 MIN', spots: 7, type: 'functional' },
      { time: '18:30', name: 'EVENING MOBILITY', coach: 'EMMA CARTER', duration: '40 MIN', spots: 5, type: 'mobility' },
    ],
    FRIDAY: [
      { time: '08:00', name: 'PEAK STRENGTH', coach: 'ALEX MORGAN', duration: '60 MIN', spots: 2, type: 'strength' },
      { time: '10:00', name: 'CONDITIONING INTERVALS', coach: 'RYAN BLAKE', duration: '45 MIN', spots: 6, type: 'cardio' },
      { time: '16:00', name: 'MOVEMENT LAB', coach: 'DANIEL REED', duration: '50 MIN', spots: 4, type: 'functional' },
      { time: '19:00', name: 'WIND-DOWN MOBILITY', coach: 'EMMA CARTER', duration: '40 MIN', spots: 8, type: 'mobility' },
    ],
    SATURDAY: [
      { time: '09:00', name: 'WEEKEND WARRIOR', coach: 'ALEX MORGAN', duration: '75 MIN', spots: 5, type: 'strength' },
      { time: '11:00', name: 'FULL BODY CONDITIONING', coach: 'RYAN BLAKE', duration: '60 MIN', spots: 9, type: 'cardio' },
      { time: '13:00', name: 'OPEN MOVEMENT SESSION', coach: 'DANIEL REED', duration: '60 MIN', spots: 6, type: 'functional' },
    ],
  };

  const scheduleDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  let currentDay = 'MONDAY';
  let currentFilter = 'all';

  const scheduleDaysEl = document.getElementById('scheduleDays');
  const scheduleListEl = document.getElementById('scheduleList');

  if (scheduleDaysEl) {
    scheduleDays.forEach(d => {
      const tab = document.createElement('button');
      tab.className = 'day-tab' + (d === currentDay ? ' active' : '');
      tab.textContent = d;
      tab.dataset.day = d;
      tab.addEventListener('click', () => {
        currentDay = d;
        document.querySelectorAll('.day-tab').forEach(t => t.classList.toggle('active', t.dataset.day === d));
        renderSchedule();
      });
      scheduleDaysEl.appendChild(tab);
    });
  }

  document.querySelectorAll('.schedule-filters .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.schedule-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSchedule();
    });
  });

  function renderSchedule() {
    if (!scheduleListEl) return;
    const sessions = scheduleData[currentDay] || [];
    const filtered = currentFilter === 'all' ? sessions : sessions.filter(s => s.type === currentFilter);
    if (filtered.length === 0) {
      scheduleListEl.innerHTML = `<div class="no-sessions">NO SESSIONS MATCH THIS FILTER</div>`;
      return;
    }
    scheduleListEl.innerHTML = filtered.map(s => `
      <div class="session-row" data-session='${JSON.stringify(s).replace(/'/g, "&apos;")}' role="button" tabindex="0">
        <span class="session-time">${s.time}</span>
        <span class="session-name">${s.name}</span>
        <span class="session-coach">${s.coach}</span>
        <span class="session-duration">${s.duration}</span>
        <span class="session-spots ${s.spots <= 3 ? 'low' : ''}">${s.spots} SPOTS</span>
        <span class="session-arrow">→</span>
      </div>
    `).join('');

    scheduleListEl.querySelectorAll('.session-row').forEach(row => {
      row.addEventListener('click', () => {
        try {
          const s = JSON.parse(row.dataset.session.replace(/&apos;/g, "'"));
          openSessionModal(s);
        } catch (err) { console.warn(err); }
      });
    });
    if (window.__bindCursorHover) window.__bindCursorHover();
  }
  renderSchedule();

  function openSessionModal(s) {
    openModal(`
      <span class="modal-eyebrow">${currentDay} — ${s.time}</span>
      <h2>${s.name}</h2>
      <p class="modal-lead">A ${s.duration.toLowerCase()} group session led by ${s.coach}. Open to all levels unless stated otherwise.</p>
      <div class="modal-meta">
        <div><span>COACH</span><strong>${s.coach}</strong></div>
        <div><span>DURATION</span><strong>${s.duration}</strong></div>
        <div><span>SPOTS LEFT</span><strong>${s.spots}</strong></div>
      </div>
      <p class="modal-sub">Sessions are capped to preserve coaching quality. If a session is full, you'll be added to the waitlist automatically.</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-book-session>BOOK SESSION <span>→</span></button>
        <button class="btn btn-ghost" data-close-modal>CLOSE</button>
      </div>
    `);
    modalContent.querySelector('[data-close-modal]').addEventListener('click', closeModal);
    modalContent.querySelector('[data-book-session]').addEventListener('click', () => {
      closeModal();
      const progSel = document.getElementById('program');
      if (progSel) {
        const map = { strength: 'STRENGTH LAB', functional: 'FUNCTIONAL MOVEMENT', cardio: 'CONDITIONING', mobility: 'MOBILITY SYSTEM' };
        const target = map[s.type];
        for (let i = 0; i < progSel.options.length; i++) {
          if (progSel.options[i].text.toUpperCase() === target) { progSel.selectedIndex = i; break; }
        }
      }
      const coachSel = document.getElementById('coach');
      if (coachSel) {
        for (let i = 0; i < coachSel.options.length; i++) {
          if (coachSel.options[i].text.toUpperCase() === s.coach.toUpperCase()) { coachSel.selectedIndex = i; break; }
        }
      }
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ============ MEMBERSHIPS ============ */
  const membershipsData = [
    {
      num: '01',
      label: 'ENTRY',
      name: 'BASE',
      price: '€39',
      period: 'PER MONTH',
      features: ['4 sessions monthly', 'Group training', 'Studio access'],
      featured: false,
      booking: 'BASE — €39/MO',
    },
    {
      num: '02',
      label: 'MOST SELECTED',
      name: 'PERFORMANCE',
      price: '€69',
      period: 'PER MONTH',
      features: ['8 sessions monthly', 'Group training', 'Progress tracking', 'Priority booking'],
      featured: true,
      booking: 'PERFORMANCE — €69/MO',
    },
    {
      num: '03',
      label: 'PREMIUM ACCESS',
      name: 'ELITE',
      price: '€119',
      period: 'PER MONTH',
      features: ['12 sessions monthly', 'Personal coaching', 'Individual training plan', 'Progress reviews', 'Priority booking'],
      featured: false,
      booking: 'ELITE — €119/MO',
    }
  ];

  const membershipsGrid = document.getElementById('membershipsGrid');
  if (membershipsGrid) {
    membershipsData.forEach(m => {
      const card = document.createElement('div');
      card.className = 'member-card' + (m.featured ? ' member-card-featured' : '');
      card.innerHTML = `
        ${m.featured ? `<span class="member-badge">${m.label}</span>` : ''}
        <span class="member-code">${m.num} / ${m.label}</span>
        <div class="member-name">${m.name}</div>
        <div class="member-price">${m.price}</div>
        <div class="member-period">${m.period}</div>
        <ul class="member-features">
          ${m.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <button class="btn ${m.featured ? 'btn-primary' : 'btn-ghost'}" data-membership="${m.booking}">SELECT MEMBERSHIP <span>→</span></button>
      `;
      card.querySelector('[data-membership]').addEventListener('click', () => {
        const memSel = document.getElementById('membership');
        if (memSel) {
          for (let i = 0; i < memSel.options.length; i++) {
            if (memSel.options[i].text.toUpperCase() === m.booking.toUpperCase()) { memSel.selectedIndex = i; break; }
          }
        }
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      });
      membershipsGrid.appendChild(card);
    });
    if (window.__bindCursorHover) window.__bindCursorHover();
  }

  /* ============ CLIENT STORIES ============ */
  const storiesData = [
    {
      name: 'SARAH K.',
      goal: 'Build strength, improve posture',
      duration: '6 MONTHS',
      type: 'strength',
      typeLabel: 'STRENGTH',
      size: '',
      img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
      story: 'Sarah came in with limited lifting experience. Over 6 months we focused on technique-first strength work — the progress showed up in everything from posture to confidence.',
      plan: ['STRENGTH LAB', 'FUNCTIONAL MOVEMENT'],
    },
    {
      name: 'MARCUS D.',
      goal: 'Improve endurance for sport',
      duration: '4 MONTHS',
      type: 'endurance',
      typeLabel: 'ENDURANCE',
      size: 'wide',
      img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=85',
      story: 'Training around a demanding job, Marcus needed efficiency. We built a conditioning base with focused intervals that translated directly into his sport performance.',
      plan: ['CONDITIONING'],
    },
    {
      name: 'PRIYA M.',
      goal: 'Movement quality & mobility',
      duration: '5 MONTHS',
      type: 'mobility',
      typeLabel: 'MOBILITY',
      size: 'tall',
      img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85',
      story: 'Priya\'s focus was reclaiming movement range after years of desk work. The mobility system gave her a structured, progressive path — not just stretching.',
      plan: ['MOBILITY SYSTEM'],
    },
    {
      name: 'JAMES O.',
      goal: 'Return to sport safely',
      duration: '7 MONTHS',
      type: 'strength',
      typeLabel: 'STRENGTH',
      size: '',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
      story: 'Rebuilding after time off, James needed a careful progression. We layered strength and movement quality — the priority was durability, not speed.',
      plan: ['STRENGTH LAB', 'MOBILITY SYSTEM'],
    },
    {
      name: 'ANNA T.',
      goal: 'Overall athletic capacity',
      duration: '8 MONTHS',
      type: 'endurance',
      typeLabel: 'ENDURANCE',
      size: 'tall',
      img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85',
      story: 'Anna wanted a full shift in capacity, not a quick fix. Eight months of structured progression built an engine that shows up in everything she does.',
      plan: ['CONDITIONING', 'FUNCTIONAL MOVEMENT'],
    },
    {
      name: 'TOM R.',
      goal: 'Daily movement confidence',
      duration: '3 MONTHS',
      type: 'mobility',
      typeLabel: 'MOBILITY',
      size: '',
      img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=85',
      story: 'Tom\'s goal was practical — move better in daily life. Three months of mobility work gave him tools he now uses independently.',
      plan: ['MOBILITY SYSTEM'],
    }
  ];

  const storiesGrid = document.getElementById('storiesGrid');
  const storiesFilters = document.getElementById('storiesFilters');
  let currentStoryFilter = 'all';

  if (storiesGrid) {
    storiesData.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = `story-card ${s.size}`;
      card.dataset.type = s.type;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <img src="${s.img}" alt="${s.name}" loading="lazy">
        <div class="story-overlay">
          <span class="story-tag">${s.typeLabel} — ${s.duration}</span>
          <span class="story-name">${s.name}</span>
          <span class="story-goal">${s.goal}</span>
          <span class="story-view">VIEW STORY →</span>
        </div>
      `;
      card.addEventListener('click', () => openStoryModal(s));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openStoryModal(s); });
      storiesGrid.appendChild(card);
    });
    if (window.__bindCursorHover) window.__bindCursorHover();
  }

  if (storiesFilters) {
    storiesFilters.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentStoryFilter = btn.dataset.filter;
        storiesFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        storiesGrid.querySelectorAll('.story-card').forEach(card => {
          const match = currentStoryFilter === 'all' || card.dataset.type === currentStoryFilter;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  function openStoryModal(s) {
    openModal(`
      <span class="modal-eyebrow">${s.typeLabel} — ${s.duration}</span>
      <img class="modal-img" src="${s.img}" alt="${s.name}">
      <h2>${s.name}</h2>
      <p class="modal-lead">Goal: ${s.goal}</p>
      <div class="modal-meta">
        <div><span>FOCUS</span><strong>${s.typeLabel}</strong></div>
        <div><span>DURATION</span><strong>${s.duration}</strong></div>
        <div><span>TYPE</span><strong>STRUCTURED</strong></div>
      </div>
      <h3 style="font-size:1rem;margin-bottom:.8rem">STORY</h3>
      <p class="modal-sub">${s.story}</p>
      <h3 style="font-size:1rem;margin-bottom:.8rem">PROGRAMS USED</h3>
      <ul class="modal-list">
        ${s.plan.map(p => `<li>${p}</li>`).join('')}
      </ul>
      <p style="font-size:11px;color:var(--grey);margin-top:1rem;line-height:1.6;font-family:var(--font-mono);letter-spacing:.05em">Client stories are illustrative examples. Progress varies by individual — no specific outcome is guaranteed.</p>
      <div class="modal-actions">
        <button class="btn btn-primary" data-close-modal>CLOSE <span>×</span></button>
      </div>
    `);
    modalContent.querySelector('[data-close-modal]').addEventListener('click', closeModal);
  }

  /* ============ WORKOUT TIMER ============ */
  const workoutStages = [
    { label: 'WARM-UP', name: 'DYNAMIC PREP', duration: 30 },
    { label: 'STAGE 01', name: 'SQUAT PATTERN', duration: 25 },
    { label: 'REST', name: 'RECOVER', duration: 10 },
    { label: 'STAGE 02', name: 'PRESS PATTERN', duration: 25 },
    { label: 'REST', name: 'RECOVER', duration: 10 },
    { label: 'STAGE 03', name: 'PULL PATTERN', duration: 25 },
    { label: 'REST', name: 'RECOVER', duration: 10 },
    { label: 'STAGE 04', name: 'PLANK HOLD', duration: 40 },
    { label: 'COOLDOWN', name: 'BREATHE + RESET', duration: 20 },
  ];

  const workoutState = {
    idx: 0,
    remaining: workoutStages[0].duration,
    running: false,
    interval: null,
    paused: false,
  };

  const workoutUI = {
    exercise: document.getElementById('workoutExercise'),
    timer: document.getElementById('workoutTimer'),
    stageLabel: document.getElementById('workoutStageLabel'),
    stageNum: document.getElementById('workoutStageNum'),
    next: document.getElementById('workoutNext'),
    status: document.getElementById('workoutStatus'),
    progress: document.getElementById('workoutProgressFill'),
    start: document.getElementById('workoutStart'),
    pause: document.getElementById('workoutPause'),
    reset: document.getElementById('workoutReset'),
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function updateWorkoutUI() {
    const stage = workoutStages[workoutState.idx];
    workoutUI.stageLabel.textContent = stage.label;
    workoutUI.stageNum.textContent = `STAGE ${String(workoutState.idx + 1).padStart(2,'0')} / ${String(workoutStages.length).padStart(2,'0')}`;
    workoutUI.exercise.textContent = stage.name;
    workoutUI.timer.textContent = formatTime(workoutState.remaining);
    const nextStage = workoutStages[workoutState.idx + 1];
    workoutUI.next.textContent = nextStage ? `NEXT: ${nextStage.name}` : 'FINAL STAGE';

    const totalDuration = workoutStages.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;
    for (let i = 0; i < workoutState.idx; i++) elapsed += workoutStages[i].duration;
    elapsed += (stage.duration - workoutState.remaining);
    const pct = Math.min(100, (elapsed / totalDuration) * 100);
    workoutUI.progress.style.width = pct + '%';
  }

  function startWorkout() {
    if (workoutState.running) return;
    workoutState.running = true;
    workoutState.paused = false;
    workoutUI.status.textContent = 'RUNNING';
    workoutUI.status.className = 'workout-status running';
    workoutUI.start.hidden = true;
    workoutUI.pause.hidden = false;
    workoutUI.pause.textContent = 'PAUSE';
    workoutUI.reset.hidden = false;
    tickWorkout();
    workoutState.interval = setInterval(tickWorkout, 1000);
  }

  function tickWorkout() {
    workoutState.remaining--;
    if (workoutState.remaining <= 0) {
      workoutState.idx++;
      if (workoutState.idx >= workoutStages.length) {
        endWorkout();
        return;
      }
      workoutState.remaining = workoutStages[workoutState.idx].duration;
    }
    updateWorkoutUI();
  }

  function endWorkout() {
    clearInterval(workoutState.interval);
    workoutState.interval = null;
    workoutState.running = false;
    workoutUI.status.textContent = 'COMPLETE';
    workoutUI.status.className = 'workout-status done';
    workoutUI.exercise.textContent = 'SESSION COMPLETE';
    workoutUI.stageLabel.textContent = 'FINISHED';
    workoutUI.stageNum.textContent = `${workoutStages.length} / ${workoutStages.length}`;
    workoutUI.timer.textContent = '00:00';
    workoutUI.next.textContent = 'WELL DONE';
    workoutUI.progress.style.width = '100%';
    workoutUI.pause.hidden = true;
    workoutUI.start.hidden = false;
    workoutUI.start.textContent = 'START AGAIN';
  }

  function pauseWorkout() {
    if (!workoutState.running) return;
    if (workoutState.paused) {
      // resume
      workoutState.paused = false;
      workoutUI.status.textContent = 'RUNNING';
      workoutUI.status.className = 'workout-status running';
      workoutUI.pause.textContent = 'PAUSE';
      workoutState.interval = setInterval(tickWorkout, 1000);
    } else {
      // pause
      workoutState.paused = true;
      clearInterval(workoutState.interval);
      workoutState.interval = null;
      workoutUI.status.textContent = 'PAUSED';
      workoutUI.status.className = 'workout-status paused';
      workoutUI.pause.textContent = 'RESUME';
    }
  }

  function resetWorkout() {
    clearInterval(workoutState.interval);
    workoutState.interval = null;
    workoutState.idx = 0;
    workoutState.remaining = workoutStages[0].duration;
    workoutState.running = false;
    workoutState.paused = false;
    workoutUI.status.textContent = 'READY';
    workoutUI.status.className = 'workout-status';
    workoutUI.start.hidden = false;
    workoutUI.start.textContent = 'START WORKOUT';
    workoutUI.pause.hidden = true;
    workoutUI.pause.textContent = 'PAUSE';
    workoutUI.reset.hidden = true;
    updateWorkoutUI();
    workoutUI.progress.style.width = '0%';
  }

  if (workoutUI.start) {
    updateWorkoutUI();
    workoutUI.start.addEventListener('click', () => {
      if (workoutState.idx >= workoutStages.length) resetWorkout();
      startWorkout();
    });
    workoutUI.pause.addEventListener('click', pauseWorkout);
    workoutUI.reset.addEventListener('click', resetWorkout);
  }

  // Cleanup interval on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && workoutState.running && !workoutState.paused) {
      clearInterval(workoutState.interval);
      workoutState.interval = null;
      workoutState.paused = true;
      workoutUI.status.textContent = 'PAUSED';
      workoutUI.status.className = 'workout-status paused';
      workoutUI.pause.textContent = 'RESUME';
    }
  });

  /* ============ BOOKING FORM ============ */
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');

  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  function setFieldError(field, msg) {
    const errEl = bookingForm.querySelector(`.form-error[data-for="${field.id}"]`);
    if (errEl) errEl.textContent = msg;
    field.classList.toggle('error', !!msg);
  }

  function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
      setFieldError(field, 'THIS FIELD IS REQUIRED');
      return false;
    }
    if (field.type === 'email' && field.value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        setFieldError(field, 'INVALID EMAIL');
        return false;
      }
    }
    if (field.type === 'tel' && field.value) {
      if (field.value.replace(/\D/g, '').length < 8) {
        setFieldError(field, 'INVALID NUMBER');
        return false;
      }
    }
    if (field.type === 'date' && field.value) {
      const d = new Date(field.value);
      const today = new Date(); today.setHours(0,0,0,0);
      if (d < today) {
        setFieldError(field, 'DATE MUST BE TODAY OR LATER');
        return false;
      }
    }
    setFieldError(field, '');
    return true;
  }

  if (bookingForm) {
    bookingForm.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.classList.contains('error')) validateField(f);
      });
    });

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      bookingForm.querySelectorAll('input[required], select[required]').forEach(f => {
        if (!validateField(f)) valid = false;
      });
      if (!valid) {
        const firstErr = bookingForm.querySelector('.error');
        if (firstErr) firstErr.focus();
        return;
      }

      document.getElementById('sProgram').textContent = document.getElementById('program').value || '—';
      document.getElementById('sCoach').textContent = document.getElementById('coach').value || 'ANY COACH';
      const dateVal = document.getElementById('date').value;
      document.getElementById('sDate').textContent = dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '—';
      document.getElementById('sMembership').textContent = document.getElementById('membership').value || '—';

      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
      bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const successReset = document.getElementById('successReset');
  if (successReset) {
    successReset.addEventListener('click', () => {
      bookingForm.reset();
      bookingForm.hidden = false;
      bookingSuccess.hidden = true;
      bookingForm.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
      bookingForm.querySelectorAll('.form-error').forEach(e => e.textContent = '');
      bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

})();