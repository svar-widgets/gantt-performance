import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Gantt } from '@bryntum/gantt-trial';
import '@bryntum/gantt-trial/gantt.css';
import '@bryntum/gantt-trial/svalbard-light.css';
import { generateData, scrollToBottom, scrollToRight, updateTasks, startUpdateLoop } from '../utils/ganttHelpers';

export const GanttChart = forwardRef(function GanttChart(props, ref) {
  const containerRef = useRef(null);
  const ganttRef = useRef(null);

  useEffect(() => {
    return () => {
      ganttRef.current?.destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    loadTasks: (count, years, config) => {
      ganttRef.current?.destroy();
      containerRef.current.innerHTML = '';

      const { tasks, links } = generateData(count, years);
      config?.start?.();

      ganttRef.current = new Gantt({
        appendTo: containerRef.current,
        rowHeight: 35,
        tickSize: 45,
        barMargin: 8,
        columns: [
          { type: 'name', field: 'name', text: 'Name', width: 200 },
          { type: 'startdate', text: 'Start date' },
          { type: 'duration', text: 'Duration' }
        ],
        project: {
          tasks,
          dependencies: links,
          listeners: {
            dataReady() {
              requestAnimationFrame(() => {
                window.dispatchEvent(new CustomEvent('render-metric', { detail: { label: 'chart' } }));
              });
            }
          }
        }
      });
    },
    scrollTest: (cb) => {
      scrollToBottom(() => {
        scrollToRight(cb);
      });
    },
    crudTest: (cb) => {
      updateTasks(ganttRef.current, 100, cb, true);
    },
    updatesTest: () => {
      startUpdateLoop(ganttRef.current, true, true);
    }
  }));

  return <div id="container" ref={containerRef} />;
});
