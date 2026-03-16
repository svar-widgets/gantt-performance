export function generateData(count, years) {
  years = years || 1;
  count = count || 1000;

  const tasks = [];
  for (let i = 1; i <= count; i++) {
    const ii = i % (365 * years);

    let start = 2 + ii - (ii >= 13 ? 12 : 0);
    let end = start + 1;
    tasks.push({
      TaskID: i,
      TaskName: "Task " + i,
      StartDate: new Date(2020, 2, start),
      EndDate: new Date(2020, 2, end),
      Progress: 50,
      ParentId: null,
      Predecessor: i > 1 ? (i - 1) + "FS" : null
    });
  }

  return { tasks };
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

export function scrollToBottom(ganttInstance, cb) {
  const ganttEl = ganttInstance?.element || document.querySelector('.e-gantt');
  if (!ganttEl) { cb?.(); return; }

  const el = ganttEl.querySelector('.e-chart-scroll-container') ||
             ganttEl.querySelector('.e-content');
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
  const ganttEl = ganttInstance?.element || document.querySelector('.e-gantt');
  if (!ganttEl) { cb?.(); return; }

  const el = ganttEl.querySelector('.e-chart-scroll-container') ||
             ganttEl.querySelector('.e-gantt-chart');
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
    ganttInstance.updateRecordByID({
      TaskID: updateId,
      TaskName: "Updated " + count,
      StartDate: new Date(2020, 2, 2 + (count % 30)),
      EndDate: new Date(2020, 2, 4 + (count % 30))
    });

    // Delete task
    ganttInstance.deleteRecord(deleteId + count);

    // Add task
    ganttInstance.addRecord({
      TaskID: 1000000 + count,
      TaskName: "New Task " + count,
      StartDate: new Date(2020, 2, 5),
      EndDate: new Date(2020, 2, 7),
      Progress: 50
    }, 'Bottom');

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
        TaskID: id,
        TaskName: "Time " + (new Date() * 1).toString().substring(8, 12)
      };
      if (dates) {
        update.StartDate = new Date(2020, 2, 2 + (tick % 30));
        update.EndDate = new Date(2020, 2, 4 + (tick % 30));
      }
      ganttInstance.updateRecordByID(update);
    }
    return true;
  });
}
