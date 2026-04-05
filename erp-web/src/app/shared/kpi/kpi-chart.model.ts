/** Configuración de mini gráfica en tarjetas KPI (admin / trabajador). */
export type KpiMiniChartConfig =
  | { kind: 'bars'; values: number[] }
  | { kind: 'donut'; donut: { pct: number; color: string }[] }
  | { kind: 'area'; values: number[] };
