import React from 'react';

const LOGO_GRID: ('red' | 'white' | 'outline')[][] = [
  ['red', 'red', 'red', 'outline'],
  ['red', 'white', 'white', 'white'],
  ['red', 'red', 'red', 'white'],
  ['red', 'white', 'white', 'white'],
  ['red', 'red', 'red', 'white'],
  ['outline', 'white', 'white', 'white'],
];

const RED = '#910B08';
const COLS = 4;
const ROWS = 6;
const CELL = 16;
const GAP = 2.5;

export function LogoIcon({ height = 56, outlineColor = '#000000' }: { height?: number; outlineColor?: string }) {
  const width = height * (COLS / ROWS);
  const vbW = COLS * CELL;
  const vbH = ROWS * CELL;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${vbW} ${vbH}`} className="shrink-0">
      {LOGO_GRID.map((row, r) =>
        row.map((type, c) => {
          const x = c * CELL + GAP / 2;
          const y = r * CELL + GAP / 2;
          const s = CELL - GAP;

          if (type === 'red') {
            return <rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} fill={RED} />;
          }
          if (type === 'white') {
            return <rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} fill="#FFFFFF" />;
          }
          return (
            <rect
              key={`${r}-${c}`}
              x={x + 1}
              y={y + 1}
              width={s - 2}
              height={s - 2}
              fill="none"
              stroke={outlineColor}
              strokeWidth={1.5}
            />
          );
        })
      )}
    </svg>
  );
}

export default LogoIcon;
