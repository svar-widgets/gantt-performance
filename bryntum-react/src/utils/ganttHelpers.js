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
      startDate: new Date(2020, 2, start),
      endDate: new Date(2020, 2, end),
      name: "Task " + i,
      progress: 50,
      parent: 0,
      type: "task",
      manuallyScheduled: true,
    });
  }

  const links = [];
  for (let i = 1; i < tasks.length; i++) {
    links.push({
      fromTask: tasks[i - 1].id,
      toTask: tasks[i].id,
    });
  }

  return { tasks, links };
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
  // Try Bryntum-specific selectors first
  const selectors = direction === 'vertical'
    ? ['.b-grid-body-container', '.b-virtual-scroller']
    : ['.b-timeline-subgrid .b-grid-body-container'];

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
  const ganttEl = document.querySelector('.b-gantt') || document.querySelector('#container');
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
  const ganttEl = document.querySelector('.b-gantt') || document.querySelector('#container');
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

export function updateTasks(ganttInstance, n, cb, sync) {
  const loop = sync ? loopSync : loopAnimation;
  const updateId = 500;
  const deleteId = 800;

  let count = 1;
  let prevAdded = 0;
  loop(() => {
    if (count >= n) {
      cb?.();
      return false;
    }

    const prev = ganttInstance.taskStore.getById(updateId);
    prev.set('startDate', new Date(prev.get('startDate').getTime() + 1000 * 60 * 60 * 24));
    prev.set('name', "Updated " + prev.name);

    const toDelete = ganttInstance.taskStore.getById(deleteId + count);
    ganttInstance.taskStore.remove(deleteId + count);

    const newId = "n" + count;
    ganttInstance.taskStore.add({
      id: newId,
      name: "New " + toDelete.name,
      startDate: toDelete.startDate,
      duration: toDelete.duration,
      parent: 0,
      type: "task"
    });

    if (prevAdded) {
      ganttInstance.dependencyStore.add({ fromTask: prevAdded, toTask: newId });
    }
    prevAdded = newId;
    count++;

    return true;
  });
}

export function startUpdateLoop(ganttInstance, optimal, dates) {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  loopAnimation(() => {
    for (const id of ids) {
      const task = ganttInstance.taskStore.getById(id);
      task.set('name', "Time " + (new Date() * 1).toString().substring(8, 12));
      if (dates) {
        task.set('startDate', new Date(task.get('startDate').getTime() + 1000 * 60 * 60 * 1));
      }
    }
    return true;
  });
}
