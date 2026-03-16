import { useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Gantt } from '@svar-ui/react-gantt';
import { generateData, scrollToBottom, scrollToRight, updateTasks, startUpdateLoop } from '../utils/ganttHelpers';

export const GanttChart = forwardRef(function GanttChart({ onReady }, ref) {
  const ganttRef = useRef(null);
  
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [generation, setGeneration] = useState(0);


  useImperativeHandle(ref, () => ({
    loadTasks: (count, years, config) => {
      const { tasks, links } = generateData(count, years);

      config?.start?.();

      setTasks(tasks);
      setLinks(links);
      setGeneration(generation + 1);

      requestAnimationFrame(() => {
        config?.end?.();
      });
    },
    scrollTest: (cb) => {
      scrollToBottom(ganttRef.current, () => {
        scrollToRight(ganttRef.current, cb);
      });
    },
    crudTest: (cb) => {
      updateTasks(ganttRef.current, 100, cb, true);
    },
    updatesTest: () => {
      console.log("updatesTest",);
      startUpdateLoop(ganttRef.current, true, true);
    }
  }));

  return (
    <div id="container">
      { generation && tasks.length ? <Gantt key={generation}
        cellWidth={40}
        cellHeight={35}
        ref={ganttRef}
        tasks={tasks}
        links={links}
      /> : null}
    </div>
  );
});
