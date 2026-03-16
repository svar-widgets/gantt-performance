import { useEffect, useRef, useState } from 'react';
import { FPSCounter } from '../utils/fpsCounter';

const twoDigits = (v) => v.toString().padStart(2, '0');

export function Toolbar({ onLoadTasks, onScrollTest, onCrudTest, onUpdatesTest }) {
  const start = useRef(null);
  const [stats, setStats] = useState({ current: 0, min: 0, average: 0, memory: { used: 0 } });

  const fpsRef = useRef(null);
  const timerRef = useRef(0);
  let active = useRef(true);

  useEffect(() => {
    fpsRef.current = new FPSCounter({
      callback: (newStats) => {
        setStats(newStats);
      }
    });
    fpsRef.current.start();

    return () => {
      fpsRef.current?.stop();
    };
  }, []);

  const resetFPS = () => {
    active.current = true;
    timerRef.current = 0;
    fpsRef.current?.reset();
    setTimeout(() => {
      active.current = false;
    }, 2000);
  };

  const handleLoadTasks = (count) => {
    const config = {
      start: () => {
        start.current = performance.now();
      },
      end: () => {
        // do nothing
      }
    };
    onLoadTasks(count, 2, config);
  };

  const handleScrollTest = () => {
    resetFPS();
    start.current = performance.now();
    onScrollTest(() => {
      const elapsed = performance.now() - start.current;
      timerRef.current = elapsed;
    });
  };

  const handleCrudTest = () => {
    resetFPS();
    start.current = performance.now();
    onCrudTest(() => {
      const elapsed = performance.now() - start.current;
      timerRef.current = elapsed;
    });
  };

  const handleUpdatesTest = () => {
    resetFPS();
    onUpdatesTest();
  };


  useEffect(() => {
    window.addEventListener('render-metric', (e) => {
      if (!active.current) return;
      if (e.detail.label === "chart") {
        const elapsed = performance.now() - start.current;
        timerRef.current = elapsed;
      }
    });
  }, []);

  return (
    <div id="header">
      <button onClick={() => handleLoadTasks(1000)}>Load 1k</button>
      <button onClick={() => handleLoadTasks(5000)}>Load 5k</button>
      <button onClick={() => handleLoadTasks(10000)}>Load 10k</button>
      <button onClick={() => handleLoadTasks(50000)}>Load 50k</button>
      <button onClick={() => handleLoadTasks(100000)}>Load 100k</button>
      <div id="fps">
        FPS: {twoDigits(stats.current)} / {twoDigits(stats.average)} / {twoDigits(stats.min)} | Memory: {stats.memory?.used || 0}Mb
        <br />
        Time: {Math.round(timerRef.current)}ms
      </div>
      <div className="spacer"></div>
      <button onClick={resetFPS}>Reset FPS</button>
      <button onClick={handleScrollTest}>Test scroll</button>
      <button onClick={handleCrudTest}>Test crud</button>
      <button onClick={handleUpdatesTest}>Test updates</button>
    </div>
  );
}
