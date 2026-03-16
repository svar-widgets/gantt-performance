import { useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactGantt, { gantt } from '@dhx/trial-react-gantt';
import '@dhx/trial-react-gantt/dist/react-gantt.css';
import { generateData, scrollToBottom, scrollToRight, updateTasks, startUpdateLoop } from '../utils/ganttHelpers';

export const GanttChart = forwardRef(function GanttChart({ onReady }, ref) {
  const ganttRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [generation, setGeneration] = useState(0);

  const config = useMemo(() => {
    const weekDayToStr = gantt.date.date_to_str("%D");
    return {
      scales : [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: (date) => weekDayToStr(date).substr(0, 1) }
      ],
      min_column_width: 40
    };
  }, []);

  const templates = useMemo(() => ({
    // task_text: (start, end, task) => {
    //   return (<span className="green">{task.text}</span>);
    // }
  }), []);

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
      scrollToBottom(ganttRef.current?.instance, () => {
        scrollToRight(ganttRef.current?.instance, cb);
      });
    },
    crudTest: (cb) => {
      updateTasks(ganttRef.current?.instance, 100, cb, true);
    },
    updatesTest: () => {
      console.log("updatesTest",);
      startUpdateLoop(ganttRef.current?.instance, true);
    }
  }));

  return (
    <div id="container">
      { generation && tasks.length ? <ReactGantt key={generation}
        ref={ganttRef}
        tasks={tasks}
        links={links}
        config={config}
        templates={templates}
      /> : null}
    </div>
  );
});
