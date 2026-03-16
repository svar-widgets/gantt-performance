import { useEffect, useRef, useState } from 'react';
import { FPSCounter } from '../utils/fpsCounter';

const twoDigits = (v) => v.toString().padStart(2, '0');

export function Toolbar({ onLoadTasks, onScrollTest, onCrudTest, onUpdatesTest }) {
  const [stats, setStats] = useState({ current: 0, min: 0, average: 0, memory: { used: 0 } });
  const [timer, setTimer] = useState(0);
  const fpsRef = useRef(null);
  const timerRef = useRef(0);

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
    timerRef.current = 0;
    setTimer(0);
    fpsRef.current?.reset();
  };

  const handleLoadTasks = (count) => {
    let start;
    const config = {
      start: () => {
        start = performance.now();
      },
      end: () => {
        const elapsed = performance.now() - start;
        timerRef.current = elapsed;
        setTimer(elapsed);
        fpsRef.current?.start();
      }
    };
    onLoadTasks(count, 2, config);
  };

  const handleScrollTest = () => {
    resetFPS();
    const start = performance.now();
    onScrollTest(() => {
      const elapsed = performance.now() - start;
      timerRef.current = elapsed;
      setTimer(elapsed);
    });
  };

  const handleCrudTest = () => {
    resetFPS();
    const start = performance.now();
    onCrudTest(() => {
      const elapsed = performance.now() - start;
      timerRef.current = elapsed;
      setTimer(elapsed);
    });
  };

  const handleUpdatesTest = () => {
    resetFPS();
    onUpdatesTest();
  };

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
        Time: {Math.round(timer)}ms
      </div>
      <div className="spacer"></div>
      <button onClick={resetFPS}>Reset FPS</button>
      <button onClick={handleScrollTest}>Test scroll</button>
      <button onClick={handleCrudTest}>Test crud</button>
      <button onClick={handleUpdatesTest}>Test updates</button>
    </div>
  );
}
