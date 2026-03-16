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
      start_date: new Date(2020, 2, start),
      end_date: new Date(2020, 2, end),
      text: "Task " + i,
      progress: count / 100,
      parent: 0,
      type: "task",
    });
  }

  const links = [];
  for (let i = 1; i < tasks.length; i++) {
    links.push({
      id: i,
      source: tasks[i - 1].id,
      target: tasks[i].id,
      type: "0",
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

export function scrollToBottom(ganttInstance, cb) {
  const verScroll = document.querySelector(".gantt_ver_scroll");
  if (!verScroll) {
    cb?.();
    return;
  }
  const verHeight = verScroll.scrollHeight;
  let posY = 0;
  let stepY = verHeight / 100;

  loopAnimation(() => {
    if (posY <= verHeight) {
      posY += stepY;
      verScroll.scrollTo(0, posY);
      return true;
    } else {
      cb?.();
      return false;
    }
  });
}

export function scrollToRight(ganttInstance, cb) {
  const horScroll = document.querySelector(".gantt_hor_scroll");
  if (!horScroll) {
    cb?.();
    return;
  }
  const horWidth = horScroll.scrollWidth;
  let posX = 0;
  let stepX = horWidth / 100;

  loopAnimation(() => {
    if (posX <= horWidth) {
      posX += stepX;
      horScroll.scrollTo(posX, 0);
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

    const prev = ganttInstance.getTask(updateId);
    if (!prev) {
      cb?.();
      return false;
    }
    prev.start_date = new Date(prev.start_date.getTime() + 1000 * 60 * 60 * 24);
    prev.text = "Updated " + prev.text;
    ganttInstance.updateTask(updateId);

    ganttInstance.deleteTask(deleteId + count);

    const newId = "n" + count;
    const toDelete = ganttInstance.getTask(deleteId);
    if (toDelete) {
      ganttInstance.addTask({
        id: newId,
        text: "New " + toDelete.text,
        start_date: toDelete.start_date,
        duration: toDelete.duration,
        parent: 0,
        type: "task"
      });
      if (prevAdded) {
        ganttInstance.addLink({ source: prevAdded, target: newId, type: "0" });
      }
      prevAdded = newId;
    }
    count++;

    return true;
  });
}

export function startUpdateLoop(ganttInstance, optimal) {
  const trigger = optimal ? (v => ganttInstance.batchUpdate(v)) : (v => v());
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  loopAnimation(() => {
    trigger(() => {
      for (const id of ids) {
        const task = ganttInstance.getTask(id);
        if (task) {
          task.text = "Time " + (new Date() * 1).toString().substring(8, 12);
          ganttInstance.updateTask(id);
        }
      }
    });
    return true;
  });
}
