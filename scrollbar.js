/* A viewport scrollbar independent of mobile browsers' native overlay-scrollbar styling. */
(function () {
  'use strict';

  var root = document.documentElement;
  var thumbId = 'toolboxOverlayThumb';
  var isTouchDevice = !!(window.matchMedia &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches);

  function install() {
    if (!document.body || document.getElementById(thumbId) ||
        (window.matchMedia && window.matchMedia('(forced-colors: active)').matches)) return;

    var thumb = document.createElement('div');
    thumb.id = thumbId;
    thumb.className = 'toolbox-overlay-thumb';
    thumb.hidden = true;
    thumb.tabIndex = 0;
    thumb.setAttribute('role', 'scrollbar');
    thumb.setAttribute('aria-orientation', 'vertical');
    thumb.setAttribute('aria-label', root.lang.toLowerCase().startsWith('en') ? 'Page scrollbar' : '页面滚动条');
    thumb.setAttribute('aria-valuemin', '0');
    thumb.setAttribute('aria-valuemax', '100');
    thumb.setAttribute('aria-valuenow', '0');
    document.body.appendChild(thumb);
    root.classList.add('toolbox-overlay-scrollbar');

    var dragging = false;
    var dragOffset = 0;
    var visible = false;
    var pending = false;
    var hideTimer = null;

    function metrics() {
      var element = document.scrollingElement || root;
      var view = element.clientHeight;
      var scroll = element.scrollHeight;
      return { element: element, view: view, scroll: scroll, max: Math.max(0, scroll - view) };
    }

    function update() {
      var m = metrics();
      if (m.max <= 0 || m.view <= 0) {
        thumb.hidden = true;
        thumb.setAttribute('aria-valuenow', '0');
        return;
      }

      var height = Math.min(m.view, Math.max(24, Math.round(m.view * m.view / m.scroll)));
      var travel = Math.max(0, m.view - height);
      var position = (m.element.scrollTop / m.max) * travel;
      thumb.style.height = height + 'px';
      thumb.style.transform = 'translateY(' + position + 'px)';
      thumb.setAttribute('aria-valuenow', String(Math.round(m.element.scrollTop / m.max * 100)));
      thumb.hidden = isTouchDevice && !visible && !dragging;
    }

    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        update();
      });
    }

    function showOnTouch() {
      if (!isTouchDevice) return;
      visible = true;
      root.classList.add('is-scrolling');
      if (hideTimer !== null) clearTimeout(hideTimer);
      schedule();
      hideTimer = setTimeout(function () {
        visible = false;
        root.classList.remove('is-scrolling');
        schedule();
      }, 500);
    }

    function finishDrag(event) {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('is-dragging');
      if (event && event.pointerId != null) {
        try { thumb.releasePointerCapture(event.pointerId); } catch (error) {}
      }
      showOnTouch();
      schedule();
    }

    thumb.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      dragging = true;
      thumb.classList.add('is-dragging');
      dragOffset = event.clientY - thumb.getBoundingClientRect().top;
      thumb.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    thumb.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var m = metrics();
      var travel = m.view - thumb.offsetHeight;
      if (travel <= 0) return;
      var position = Math.max(0, Math.min(travel, event.clientY - dragOffset));
      m.element.scrollTop = position / travel * m.max;
    });
    thumb.addEventListener('pointerup', finishDrag);
    thumb.addEventListener('pointercancel', finishDrag);
    thumb.addEventListener('lostpointercapture', finishDrag);

    thumb.addEventListener('keydown', function (event) {
      var m = metrics();
      var destinations = {
        ArrowDown: m.element.scrollTop + 40,
        ArrowUp: m.element.scrollTop - 40,
        PageDown: m.element.scrollTop + m.view * 0.9,
        PageUp: m.element.scrollTop - m.view * 0.9,
        Home: 0,
        End: m.max
      };
      if (!Object.prototype.hasOwnProperty.call(destinations, event.key)) return;
      m.element.scrollTop = destinations[event.key];
      event.preventDefault();
    });

    window.addEventListener('scroll', function () {
      schedule();
      showOnTouch();
    }, { passive: true, capture: true });
    window.addEventListener('touchmove', showOnTouch, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', schedule);
    if (window.ResizeObserver) {
      var resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(root);
      resizeObserver.observe(document.body);
    }
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
