import { useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { GanttChart } from './components/GanttChart';
import './App.css';

function App() {
  const ganttRef = useRef(null);

  const handleLoadTasks = (count, years, config) => {
    ganttRef.current?.loadTasks(count, years, config);
  };

  const handleScrollTest = (cb) => {
    ganttRef.current?.scrollTest(cb);
  };

  const handleCrudTest = (cb) => {
    ganttRef.current?.crudTest(cb);
  };

  const handleUpdatesTest = () => {
    ganttRef.current?.updatesTest();
  };

  return (
    <>
      <Toolbar
        onLoadTasks={handleLoadTasks}
        onScrollTest={handleScrollTest}
        onCrudTest={handleCrudTest}
        onUpdatesTest={handleUpdatesTest}
      />
      <GanttChart ref={ganttRef} />
    </>
  );
}

export default App;
