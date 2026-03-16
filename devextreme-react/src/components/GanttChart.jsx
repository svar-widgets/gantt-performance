import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Gantt, { Tasks, Dependencies, Column, Editing } from 'devextreme-react/gantt';
import 'devexpress-gantt/dist/dx-gantt.min.css';
import { generateData, scrollToBottom, scrollToRight, updateTasks, startUpdateLoop } from '../utils/ganttHelpers';

export const GanttChart = forwardRef(function GanttChart(props, ref) {
  const ganttRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [generation, setGeneration] = useState(0);

  const getInstance = () => {
    const ref = ganttRef.current;
    if (!ref) return null;
    return typeof ref.instance === 'function' ? ref.instance() : ref.instance;
  };

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
      scrollToBottom(getInstance(), () => {
        scrollToRight(getInstance(), cb);
      });
    },
    crudTest: (cb) => {
      updateTasks(getInstance(), 100, cb, true);
    },
    updatesTest: () => {
      startUpdateLoop(getInstance(), true, true);
    }
  }));

  const handleContentReady = () => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('render-metric', { detail: { label: 'chart' } }));
    });
  };

  return (
    <div id="container">
      {generation && tasks.length ? (
        <Gantt
          key={generation}
          ref={ganttRef}
          taskListWidth={300}
          scaleType="weeks"
          height="100%"
          onContentReady={handleContentReady}
        >
          <Tasks
            dataSource={tasks}
            keyExpr="id"
            parentIdExpr="parentId"
            titleExpr="title"
            startExpr="start"
            endExpr="end"
            progressExpr="progress"
          />
          <Dependencies
            dataSource={dependencies}
            keyExpr="id"
            predecessorIdExpr="predecessorId"
            successorIdExpr="successorId"
            typeExpr="type"
          />
          <Column dataField="title" caption="Task" width={300} />
          <Column dataField="start" caption="Start" />
          <Column dataField="end" caption="End" />
          <Editing enabled />
        </Gantt>
      ) : null}
    </div>
  );
});
