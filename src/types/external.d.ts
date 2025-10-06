declare module 'ink-table' {
  import type { FC } from 'react';
  type Props<T extends Record<string, unknown>> = {
    data: readonly T[];
    columns?: readonly (keyof T)[];
  };
  const Table: FC<Props<Record<string, unknown>>>;
  export default Table;
}

declare module 'ink-chart' {
  import type { FC } from 'react';
  type ChartData = { label: string; value: number }[];
  type Props = {
    data: ChartData;
    type?: 'bar' | 'line';
    width?: number;
    height?: number;
    color?: string;
  };
  const Chart: FC<Props>;
  export default Chart;
}
