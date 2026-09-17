// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const list = document.querySelector('.nav__list');

  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const isOpen = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    list.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Count-up stat numbers — only elements with a data-target (skips static boxes).
  // Runs on page load, always — not gated by whether the box is in view.
  const countUpEls = document.querySelectorAll('[data-target]');

  const runCountUp = (el) => {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500; // ms
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic: fast start, slow finish
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target + suffix;
    };
    requestAnimationFrame(frame);
  };

  countUpEls.forEach((el) => runCountUp(el));

  // Sticky header: add a shadow/solid background once scrolled past the hero
  const header = document.querySelector('.site-header');

  if (header) {
    const updateHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  // Ask Intendra: hero demo widget — click a question, type out a sample answer
  const askIntendra = document.querySelector('.ask-intendra');

  if (askIntendra) {
    const answers = {
      'root-cause': "Compass™ maps 12,400 monthly contacts against the value-irritant framework. 3,150 trace back to a single avoidable cause — a delayed-refund policy — and would never have existed with a proactive fix.",
      'billing': "Pulse™ shows billing disputes running at roughly 4,200 contacts/month. Root cause analysis traces 61% to delayed-refund processing, with high effort scores across the group.",
      'emotion': "Sentiment mapping flags a sharp anger spike right after the second hold transfer on billing calls — not at the start of the conversation, but the moment agents re-explain a policy the customer already heard once.",
      'churn': "Reveal™ flags accounts with declining interaction frequency and flattening sentiment over 3+ touchpoints — a pattern that historically precedes churn by 4–6 weeks, before any complaint is ever logged.",
    };

    const chips = askIntendra.querySelectorAll('.ask-intendra__chips button');
    const answerBox = askIntendra.querySelector('.ask-intendra__answer');
    let typingTimer = null;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = answers[chip.dataset.answer];
        if (!text) return;

        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        clearInterval(typingTimer);
        answerBox.innerHTML = '<span class="typed"></span><span class="cursor"></span>';
        const typedEl = answerBox.querySelector('.typed');

        let i = 0;
        typingTimer = setInterval(() => {
          i += 1;
          typedEl.textContent = text.slice(0, i);
          if (i >= text.length) {
            clearInterval(typingTimer);
            answerBox.querySelector('.cursor')?.remove();
          }
        }, 12);
      });
    });
  }

  // Solutions by role: tabs
  const roleTabs = document.querySelectorAll('.role-tabs button');
  const rolePanels = document.querySelectorAll('.role-panel__text');

  roleTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      roleTabs.forEach((t) => t.classList.remove('is-active'));
      rolePanels.forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelector(`.role-panel__text[data-role-panel="${tab.dataset.roleTab}"]`)?.classList.add('is-active');
    });
  });

  // FAQ accordion: one open at a time
  const faqQuestions = document.querySelectorAll('.faq-item__question');

  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';
      faqQuestions.forEach((q) => q.setAttribute('aria-expanded', 'false'));
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Hero product mockup: cross-fade between views on a timer, or on tab click.
  // Auto-advance is skipped for users who prefer reduced motion.
  const appCycle = document.querySelector('[data-app-cycle]');

  if (appCycle) {
    const tabs = [...appCycle.querySelectorAll('.app-tab')];
    const views = [...appCycle.querySelectorAll('.app-view')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const askView = appCycle.querySelector('.app-view[data-view="ask"]');
    let index = 0;
    let timer = null;
    let askTimers = [];

    const clearAsk = () => { askTimers.forEach(clearTimeout); askTimers = []; };

    // Ask Intendra: type out the question, then reveal the cards, then the summary
    const animateAsk = () => {
      if (!askView) return;
      clearAsk();
      const feed = askView.querySelector('.ask-feed');
      const input = askView.querySelector('.ask-mock__input');
      const sendBtn = askView.querySelector('.ask-mock__send');

      // Build the ordered list of turns (question → thinking → answer)
      const turns = [...askView.querySelectorAll('[data-answer]')].map((ans) => {
        const n = ans.dataset.answer;
        const q = askView.querySelector(`[data-q="${n}"]`);
        return {
          q,
          userMsg: q ? q.closest('.ask-msg') : null,
          typing: askView.querySelector(`[data-typing="${n}"]`),
          answer: ans,
          cards: ans.querySelector('.ask-reveal--cards'),
          hasDemand: !!ans.querySelector('.demand-toggle'),
          text: (q && q.dataset.text) || '',
        };
      });

      const scrollFeed = () => { if (feed) feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' }); };
      // Type the question into the composer input (not into the chat bubble)
      const typeComposer = (text) => {
        if (!input) return;
        input.classList.add('is-typing');
        let i = 0;
        const step = () => {
          i += 1;
          input.textContent = text.slice(0, i);
          if (i < text.length) askTimers.push(setTimeout(step, 45));
          else input.classList.remove('is-typing');
        };
        askTimers.push(setTimeout(step, 80));
      };

      // reset the whole feed
      askView.querySelectorAll('.ask-reveal').forEach((el) => el.classList.remove('is-in'));
      askView.querySelectorAll('.ask-mock__q').forEach((q) => { q.textContent = ''; });
      if (input) { input.textContent = ''; input.classList.remove('is-typing'); }
      if (feed) feed.scrollTop = 0;
      stopDemand();

      if (reduceMotion) {
        turns.forEach((turn) => {
          if (turn.q) turn.q.textContent = turn.text;
          turn.userMsg && turn.userMsg.classList.add('is-in');
          turn.answer && turn.answer.classList.add('is-in');
          if (turn.cards) turn.cards.classList.add('is-in');
        });
        const last = turns[turns.length - 1];
        if (last && last.hasDemand) startDemand();
        scrollFeed();
        return;
      }

      // A running feed: type → send it up → think → answer, then the next question
      let t = 300;
      turns.forEach((turn) => {
        const typeMs = 80 + turn.text.length * 45 + 250;

        // type the question in the composer input
        askTimers.push(setTimeout(() => { if (input) input.textContent = ''; typeComposer(turn.text); }, t)); t += typeMs;
        // send: the message slides up into the feed, everything scrolls up
        askTimers.push(setTimeout(() => {
          if (turn.q) turn.q.textContent = turn.text;
          turn.userMsg && turn.userMsg.classList.add('is-in');
          if (input) input.textContent = '';
          if (sendBtn) { sendBtn.classList.add('is-sent'); askTimers.push(setTimeout(() => sendBtn.classList.remove('is-sent'), 260)); }
          scrollFeed();
        }, t)); t += 900;
        // think
        askTimers.push(setTimeout(() => { turn.typing && turn.typing.classList.add('is-in'); scrollFeed(); }, t)); t += 1500;
        // answer
        askTimers.push(setTimeout(() => {
          turn.typing && turn.typing.classList.remove('is-in');
          turn.answer && turn.answer.classList.add('is-in');
          if (turn.cards) turn.cards.classList.add('is-in');
          if (turn.hasDemand) startDemand();
          scrollFeed();
        }, t)); t += 3200;
      });
    };

    // Pulse histogram (now inside the Ask answer) toggles between Volume and Cost
    const demandBtns = [...appCycle.querySelectorAll('.demand-toggle__btn')];
    const demandCharts = [...appCycle.querySelectorAll('.demand-view')];
    let demandTimer = null;
    const setMetric = (m) => {
      demandBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.metric === m));
      demandCharts.forEach((v) => v.classList.toggle('is-active', v.dataset.metric === m));
    };
    const currentMetric = () => (demandBtns.find((b) => b.classList.contains('is-active'))?.dataset.metric || 'cost');
    const stopDemand = () => { if (demandTimer) { clearInterval(demandTimer); demandTimer = null; } };
    const startDemand = () => {
      if (reduceMotion) return;
      stopDemand();
      demandTimer = setInterval(() => setMetric(currentMetric() === 'cost' ? 'volume' : 'cost'), 3000);
    };
    demandBtns.forEach((b) => b.addEventListener('click', () => { setMetric(b.dataset.metric); startDemand(); }));

    // Ask Intendra dwells longer so its animation has room to play
    const dwellFor = (i) => (views[i].dataset.view === 'ask' ? 35000 : 4200);

    const show = (i) => {
      index = (i + views.length) % views.length;
      // A view may borrow another tab (e.g. Root cause stays under Compass) via data-tab
      const tabKey = views[index].dataset.tab || views[index].dataset.view;
      tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.view === tabKey));
      views.forEach((v, n) => v.classList.toggle('is-active', n === index));
      if (views[index].dataset.view === 'ask') animateAsk();
      else stopDemand();
    };

    const stop = () => { if (timer) { clearTimeout(timer); timer = null; } };
    const schedule = () => {
      if (reduceMotion) return;
      stop();
      timer = setTimeout(() => { show(index + 1); schedule(); }, dwellFor(index));
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const i = views.findIndex((v) => (v.dataset.tab || v.dataset.view) === tab.dataset.view);
        if (i >= 0) { show(i); schedule(); }
      });
    });

    // Pause while the pointer is over the card, resume on leave
    appCycle.addEventListener('mouseenter', () => { stop(); stopDemand(); });
    appCycle.addEventListener('mouseleave', () => {
      schedule();
      const a2 = askView && askView.querySelector('[data-answer="2"]');
      if (views[index].dataset.view === 'ask' && a2 && a2.classList.contains('is-in')) startDemand();
    });

    // Ask is the default active view — animate it on load, then start cycling
    if (views[0] && views[0].dataset.view === 'ask') animateAsk();
    schedule();
  }
});

// The Chain / engine stepper (Platform page): click a node, show its detail
document.addEventListener('DOMContentLoaded', () => {
  const chainNodes = document.querySelectorAll('.chain-node');
  const chainDetails = document.querySelectorAll('.chain-detail__text');
  if (!chainNodes.length) return;
  chainNodes.forEach((node) => {
    node.addEventListener('click', () => {
      chainNodes.forEach((n) => n.classList.remove('is-active'));
      chainDetails.forEach((d) => d.classList.remove('is-active'));
      node.classList.add('is-active');
      document.querySelector(`.chain-detail__text[data-step-detail="${node.dataset.step}"]`)?.classList.add('is-active');
    });
  });
});

// Impact metrics: count up numbers/ranges when the section scrolls into view
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.outcomes-list');
  if (!list) return;
  const metrics = list.querySelectorAll('.outcome__metric:not(.outcome__metric--soft)');
  if (!metrics.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const text = el.dataset.full || el.textContent;
    el.dataset.full = text;
    if (reduce) { el.textContent = text; return; }
    const parts = text.split(/(\d+)/);
    const targets = parts.map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : null));
    const dur = 1100;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = parts.map((p, i) => (targets[i] !== null ? Math.round(e * targets[i]) : p)).join('');
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    };
    requestAnimationFrame(frame);
  };

  if (!('IntersectionObserver' in window)) { metrics.forEach(animate); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { metrics.forEach(animate); io.disconnect(); }
    });
  }, { threshold: 0.3 });
  io.observe(list);
});
