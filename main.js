/* ============================================================
   P. Sri Sai Charan — portfolio interactions
   Vanilla JS, no dependencies. Motion respects reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: stuck state + scroll progress + active link ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], header[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('stuck', y > 40);
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

    var current = '';
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 120) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileClose');
  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(true); });
  if (mobileClose) mobileClose.addEventListener('click', function () { setMenu(false); });
  if (mobileMenu) mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero typed effect ---------- */
  var typed = document.getElementById('typed');
  var phrases = [
    'I build the systems around the models.',
    'Developer intelligence · AI agents · modular architecture.',
    'From ML serving to knowledge graphs.',
    'Open to internships — SWE / ML / AI systems.'
  ];
  if (typed) {
    if (reduceMotion) {
      typed.textContent = phrases[0];
    } else {
      var pi = 0, ci = 0, deleting = false;
      var tick = function () {
        var p = phrases[pi];
        if (!deleting) {
          typed.textContent = p.slice(0, ++ci);
          if (ci === p.length) { setTimeout(function () { deleting = true; tick(); }, 2000); return; }
        } else {
          typed.textContent = p.slice(0, --ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        }
        setTimeout(tick, deleting ? 30 : 55);
      };
      setTimeout(tick, 900);
    }
  }

  /* ---------- Flagship expand / collapse ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.entry-head')).forEach(function (head) {
    head.addEventListener('click', function () {
      var entry = head.closest('.entry');
      var open = entry.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Project filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.entry[data-status], .scard[data-status]'));
  var bands = [
    { grid: document.getElementById('flagship'), label: null },
    { grid: document.getElementById('more'), label: null },
    { grid: document.getElementById('concepts'), label: null }
  ];
  bands.forEach(function (b) { if (b.grid) b.label = b.grid.previousElementSibling; });

  function matches(item, f) {
    if (f === 'all') return true;
    if (f === 'flagship') return item.getAttribute('data-flag') === 'flagship';
    if (f === 'shipped' || f === 'progress' || f === 'concept') return item.getAttribute('data-status') === f;
    var cat = ' ' + (item.getAttribute('data-cat') || '') + ' ';
    if (f === 'ai') return cat.indexOf(' ai ') > -1 || cat.indexOf(' ml ') > -1;
    return cat.indexOf(' ' + f + ' ') > -1;
  }

  function applyFilter(f) {
    items.forEach(function (item) {
      var show = matches(item, f);
      item.classList.toggle('hide', !show);
    });
    // Hide a band's label when the band has no visible items
    bands.forEach(function (b) {
      if (!b.grid || !b.label) return;
      var anyVisible = Array.prototype.some.call(b.grid.children, function (c) { return !c.classList.contains('hide'); });
      b.label.style.display = anyVisible ? '' : 'none';
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('cf-msg');
  var submitBtn = document.getElementById('cf-submit');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim() || 'Portfolio contact',
        message: form.message.value.trim(),
        _template: 'table'
      };
      msg.className = 'form-msg';
      msg.textContent = 'Sending…';
      submitBtn.disabled = true;

      fetch('https://formsubmit.co/ajax/psrisaicharan5@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && (res.success === true || res.success === 'true')) {
            msg.className = 'form-msg ok';
            msg.textContent = '✓ Message sent — I\'ll get back to you.';
            form.reset();
          } else {
            msg.className = 'form-msg err';
            msg.textContent = (res && res.message)
              ? res.message
              : 'Could not send right now — please email psrisaicharan5@gmail.com directly.';
          }
        })
        .catch(function () {
          msg.className = 'form-msg err';
          msg.textContent = 'Network error — please email psrisaicharan5@gmail.com directly.';
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }
})();
