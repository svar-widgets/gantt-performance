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
      start: new Date(2020, 2, start),
      end: new Date(2020, 2, end),
      text: "Task " + i,
      progress: 50,
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
      type: "e2s",
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
  const verScroll = document.querySelector(".wx-gantt");
  const verHeight = verScroll.scrollHeight;
  let posY = 0;
  let stepY = verHeight / 100;

  loopAnimation(() => {
    if (posY <= verHeight) {
      posY += stepY;
      verScroll.scrollTo(0, posY);
      console.log("scrollToBottom", posY);
      return true;
    } else {
      cb?.();
      return false;
    }
  });
}

export function scrollToRight(ganttInstance, cb) {
  const horScroll = document.querySelector(".wx-chart");
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
    ganttInstance.exec("update-task", { id: updateId, task: { start: new Date(prev.start.getTime() + 1000 * 60 * 60 * 24), text: "Updated " + prev.text } });

    const toDelete = ganttInstance.getTask(deleteId + count);
    ganttInstance.exec("delete-task", { id: deleteId + count });

    const newId = "n" + count;
    ganttInstance.exec("add-task", {
      id: newId,
      task: {
        text: "New " + toDelete.text,
        start: toDelete.start,
        duration: toDelete.duration,
        parent: 0,
        type: "task"
      }
    });

    if (prevAdded) {
      debugger;
      ganttInstance.exec("add-link", { link: { source: prevAdded, target: newId, type: "e2s" }});
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
      const update = {
        text: "Time " + (new Date() * 1).toString().substring(8, 12)
      };
      if (dates) {
        update.start = new Date(ganttInstance.getTask(id).start*1 + 1000 * 60 * 60 * 1);
      }
    
      ganttInstance.exec("update-task", { id, task: update });      
    }
    return true;
  });
}
