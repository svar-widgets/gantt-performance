import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Gantt, GanttWeekView } from '@progress/kendo-react-gantt';
import { generateData, scrollToBottom, scrollToRight, loopAnimation } from '../utils/ganttHelpers';

const taskModelFields = {
  id: 'id',
  start: 'start',
  end: 'end',
  title: 'title',
  percentComplete: 'percentComplete',
  isExpanded: 'isExpanded',
  children: 'children'
};

const dependencyModelFields = {
  id: 'id',
  fromId: 'fromId',
  toId: 'toId',
  type: 'type'
};

const columns = [
  { field: 'title', title: 'Task', width: 300, expandable: true },
  { field: 'start', title: 'Start', width: 120, format: '{0:MM/dd/yyyy}' },
  { field: 'end', title: 'End', width: 120, format: '{0:MM/dd/yyyy}' }
];

export const GanttChart = forwardRef(function GanttChart(props, ref) {
  const [tasks, setTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [generation, setGeneration] = useState(0);
  const tasksRef = useRef([]);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  // Dispatch render-metric after Kendo renders new data
  useEffect(() => {
    if (generation > 0) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('render-metric', { detail: { label: 'chart' } }));
      });
    }
  }, [generation]);

  useImperativeHandle(ref, () => ({
    loadTasks: (count, years, config) => {
      const data = generateData(count, years);
      config?.start?.();
      setTasks(data.tasks);
      setDependencies(data.dependencies);
      setGeneration(prev => prev + 1);
      requestAnimationFrame(() => {
        config?.end?.();
      });
    },
    scrollTest: (cb) => {
      scrollToBottom(() => {
        scrollToRight(cb);
      });
    },
    crudTest: (cb) => {
      const currentTasks = [...tasksRef.current];
      const updateId = 500;
      const deleteId = 800;

      for (let count = 1; count < 100; count++) {
        // Update task
        const idx = currentTasks.findIndex(t => t.id === updateId);
        if (idx >= 0) {
          currentTasks[idx] = {
            ...currentTasks[idx],
            title: "Updated " + count,
            start: new Date(2020, 2, 2 + (count % 30)),
            end: new Date(2020, 2, 4 + (count % 30))
          };
        }
        // Delete task
        const delIdx = currentTasks.findIndex(t => t.id === deleteId + count);
        if (delIdx >= 0) currentTasks.splice(delIdx, 1);
        // Add task
        currentTasks.push({
          id: 1000000 + count,
          title: "New Task " + count,
          start: new Date(2020, 2, 5),
          end: new Date(2020, 2, 7),
          percentComplete: 50,
          children: []
        });
      }

      setTasks(currentTasks);
      requestAnimationFrame(() => cb?.());
    },
    updatesTest: () => {
      const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let tick = 0;
      loopAnimation(() => {
        tick++;
        setTasks(prev => prev.map(t => {
          if (ids.includes(t.id)) {
            return {
              ...t,
              title: "Time " + (new Date() * 1).toString().substring(8, 12),
              start: new Date(2020, 2, 2 + (tick % 30)),
              end: new Date(2020, 2, 4 + (tick % 30))
            };
          }
          return t;
        }));
        return true;
      });
    }
  }));

  return (
    <div id="container">
      {generation && tasks.length ? (
        <Gantt
          key={generation}
          style={{ height: '100%', width: '100%' }}
          taskData={tasks}
          taskModelFields={taskModelFields}
          dependencyData={dependencies}
          dependencyModelFields={dependencyModelFields}
          columns={columns}
        >
          <GanttWeekView />
        </Gantt>
      ) : null}
    </div>
  );
});
