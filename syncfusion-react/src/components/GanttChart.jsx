import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GanttComponent, Inject, Edit, Selection, VirtualScroll } from '@syncfusion/ej2-react-gantt';
import { generateData, scrollToBottom, scrollToRight, updateTasks, startUpdateLoop } from '../utils/ganttHelpers';

export const GanttChart = forwardRef(function GanttChart(props, ref) {
  const syncGanttRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [generation, setGeneration] = useState(0);

  const taskFields = {
    id: 'TaskID',
    name: 'TaskName',
    startDate: 'StartDate',
    endDate: 'EndDate',
    progress: 'Progress',
    parentID: 'ParentId',
    dependency: 'Predecessor'
  };

  const editSettings = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true
  };

  useEffect(() => {
    // fires once per second, must not affect perfomance tests
    // removes trial banner from the top of the page
    const interval = setInterval(() => {
      const divs = document.querySelectorAll('div');
      divs.forEach(div => {
        if (div.style.position === 'fixed') {
          div.style.position = '';
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useImperativeHandle(ref, () => ({
    loadTasks: (count, years, config) => {
      const { tasks } = generateData(count, years);
      config?.start?.();
      setTasks(tasks);
      setGeneration(prev => prev + 1);
      requestAnimationFrame(() => {
        config?.end?.();
      });
    },
    scrollTest: (cb) => {
      scrollToBottom(syncGanttRef.current, () => {
        scrollToRight(syncGanttRef.current, cb);
      });
    },
    crudTest: (cb) => {
      updateTasks(syncGanttRef.current, 100, cb, true);
    },
    updatesTest: () => {
      startUpdateLoop(syncGanttRef.current, true, true);
    }
  }));

  const handleDataBound = () => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('render-metric', { detail: { label: 'chart' } }));
    });
  };

  return (
    <div id="container">
      {generation && tasks.length ? (
        <GanttComponent
          key={generation}
          ref={syncGanttRef}
          dataSource={tasks}
          taskFields={taskFields}
          editSettings={editSettings}
          rowHeight={35}
          height="100%"
          taskMode="Manual"
          enableVirtualization={true}
          allowSelection={true}
          dataBound={handleDataBound}
        >
          <Inject services={[Edit, Selection, VirtualScroll]} />
        </GanttComponent>
      ) : null}
    </div>
  );
});
