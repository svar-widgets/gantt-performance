export function generateData(count, years) {
  years = years || 1;
  count = count || 1000;

  const tasks = [];
  for (let i = 1; i <= count; i++) {
    const ii = i % (365 * years);

    let start = 2 + ii - (ii >= 13 ? 12 : 0);
    let end = start + 2;
    tasks.push({
      id: i,
      title: "Task " + i,
      start: new Date(2020, 2, start),
      end: new Date(2020, 2, end),
      percentComplete: 0.5,
      children: [],
      isExpanded: true,
    });
  }

  const dependencies = [];
  for (let i = 1; i < tasks.length; i++) {
    dependencies.push({
      id: i,
      fromId: tasks[i - 1].id,
      toId: tasks[i].id,
      type: 0, // Finish-to-Start
    });
  }

  return { tasks, dependencies };
}

export function loopAnimation(cb) {
  requestAnimationFrame(() => {
    if (cb?.()) {
      loopAnimation(cb);
    }
  });
}

export function loopSync(cb) {
  let c = true;
  while (c) {
    c = cb?.();
  }
}

function findScrollable(parentEl, direction) {
  if (!parentEl) return null;
  // Try Kendo-specific selectors first
  const selectors = direction === 'vertical'
    ? ['.k-grid-content', '.k-gantt-timeline .k-scrollable', '.k-virtual-content']
    : ['.k-gantt-timeline', '.k-gantt-timeline .k-scrollable'];

  for (const sel of selectors) {
    const el = parentEl.querySelector(sel);
    if (el) {
      if (direction === 'vertical' && el.scrollHeight > el.clientHeight + 10) return el;
      if (direction === 'horizontal' && el.scrollWidth > el.clientWidth + 10) return el;
    }
  }
  // Fallback: search all divs for scrollable ones
  const divs = parentEl.querySelectorAll('div');
  for (const el of divs) {
    if (direction === 'vertical' && el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 50) return el;
    if (direction === 'horizontal' && el.scrollWidth > el.clientWidth + 10 && el.clientWidth > 50) return el;
  }
  return null;
}

export function scrollToBottom(cb) {
  const ganttEl = document.querySelector('.k-gantt') || document.querySelector('#container');
  if (!ganttEl) { cb?.(); return; }

  const el = findScrollable(ganttEl, 'vertical');
  if (!el) { cb?.(); return; }

  const scrollHeight = el.scrollHeight;
  let posY = 0;
  const stepY = scrollHeight / 100;

  loopAnimation(() => {
    if (posY <= scrollHeight) {
      posY += stepY;
      el.scrollTop = posY;
      return true;
    } else {
      cb?.();
      return false;
    }
  });
}

export function scrollToRight(cb) {
  const ganttEl = document.querySelector('.k-gantt') || document.querySelector('#container');
  if (!ganttEl) { cb?.(); return; }

  const el = findScrollable(ganttEl, 'horizontal');
  if (!el) { cb?.(); return; }

  const scrollWidth = el.scrollWidth;
  let posX = 0;
  const stepX = scrollWidth / 100;

  loopAnimation(() => {
    if (posX <= scrollWidth) {
      posX += stepX;
      el.scrollLeft = posX;
      return true;
    } else {
      cb?.();
      return false;
    }
  });
}
