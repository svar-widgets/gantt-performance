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
      parentId: 0,
      title: "Task " + i,
      start: new Date(2020, 2, start),
      end: new Date(2020, 2, end),
      progress: 50,
    });
  }

  const dependencies = [];
  for (let i = 1; i < tasks.length; i++) {
    dependencies.push({
      id: i,
      predecessorId: tasks[i - 1].id,
      successorId: tasks[i].id,
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

function findScrollable(ganttEl, direction) {
  // First try DevExtreme scrollable containers
  const containers = ganttEl.querySelectorAll('.dx-scrollable-container');
  for (const el of containers) {
    if (direction === 'vertical' && el.scrollHeight > el.clientHeight + 10) return el;
    if (direction === 'horizontal' && el.scrollWidth > el.clientWidth + 10) return el;
  }
  // Fallback: search all divs for scrollable ones
  const divs = ganttEl.querySelectorAll('div');
  for (const el of divs) {
    if (direction === 'vertical' && el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 50) return el;
    if (direction === 'horizontal' && el.scrollWidth > el.clientWidth + 10 && el.clientWidth > 50) return el;
  }
  return null;
}

export function scrollToBottom(ganttInstance, cb) {
  const ganttEl = document.querySelector('.dx-gantt');
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

export function scrollToRight(ganttInstance, cb) {
  const ganttEl = document.querySelector('.dx-gantt');
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
  loop(() => {
    if (count >= n) {
      cb?.();
      return false;
    }

    // Update task
    ganttInstance.updateTask(updateId, {
      title: "Updated " + count,
      start: new Date(2020, 2, 2 + (count % 30)),
      end: new Date(2020, 2, 4 + (count % 30))
    });

    // Delete task
    ganttInstance.deleteTask(deleteId + count);

    // Add task
    ganttInstance.insertTask({
      title: "New Task " + count,
      start: new Date(2020, 2, 5),
      end: new Date(2020, 2, 7),
      progress: 50,
      parentId: 0
    });

    count++;
    return true;
  });
}

export function startUpdateLoop(ganttInstance, optimal, dates) {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let tick = 0;
  loopAnimation(() => {
    tick++;
    for (const id of ids) {
      const update = {
        title: "Time " + (new Date() * 1).toString().substring(8, 12)
      };
      if (dates) {
        update.start = new Date(2020, 2, 2 + (tick % 30));
        update.end = new Date(2020, 2, 4 + (tick % 30));
      }
      ganttInstance.updateTask(id, update);
    }
    return true;
  });
}
