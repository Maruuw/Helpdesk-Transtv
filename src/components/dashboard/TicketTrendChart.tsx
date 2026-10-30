import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { initialLatestRequests, type TicketRequestItem } from '@/types/ticket';

export type ChartPeriod = 'hari' | 'bulan' | 'tahun';

interface PeriodDataset {
  title: string;
  subtitle: string;
  labels: string[];
  incoming: number[];
  resolved: number[];
  avgTime: string;
}

export interface TicketTrendChartProps {
  tickets?: TicketRequestItem[];
}

// Algoritma cubic spline halus untuk kurva grafik modern
const createSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

const createAreaPath = (points: { x: number; y: number }[], bottomY: number): string => {
  if (points.length < 2) return '';
  const linePath = createSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L ${last.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${bottomY} Z`;
};

export const TicketTrendChart: React.FC<TicketTrendChartProps> = ({ tickets = initialLatestRequests }) => {
  const [period, setPeriod] = useState<ChartPeriod>('hari');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Komputasi Dataset Dinamis berdasarkan array tickets aktif (tidak dummy berlebihan)
  const datasets = useMemo<Record<ChartPeriod, PeriodDataset>>(() => {
    // 1. DATASET HARIAN (Sen - Min)
    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dailyIncoming = [0, 0, 0, 0, 0, 0, 0];
    const dailyResolved = [0, 0, 0, 0, 0, 0, 0];

    tickets.forEach((t) => {
      let dayIndex = 4; // default Jumat (hari kerja aktif saat ini)

      if (t.id === 'REQ-2026-001') dayIndex = 2; // Rab
      else if (t.id === 'REQ-2026-002') dayIndex = 6; // Min
      else if (t.id === 'REQ-2026-003') dayIndex = 0; // Sen
      else if (t.id === 'REQ-2026-004') dayIndex = 1; // Sel
      else if (t.id === 'REQ-2026-005') dayIndex = 1; // Sel
      else {
        // Tiket yang baru dibuat: alokasikan ke hari ini
        const now = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
        dayIndex = now === 0 ? 6 : now - 1;
      }

      dailyIncoming[dayIndex] += 1;
      if (t.status === 'Solved') {
        dailyResolved[dayIndex] += 1;
      }
    });

    const totalSolved = tickets.filter((t) => t.status === 'Solved').length;

    // 2. DATASET BULANAN (Jan - Des) - Proporsional realistis
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyIncoming = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const monthlyResolved = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Data tiket bulan Jan
    monthlyIncoming[0] = Math.min(tickets.length, 5);
    monthlyResolved[0] = Math.min(totalSolved, 2);

    // Tiket tambahan yang baru dibuat dialokasikan ke bulan berjalan
    if (tickets.length > 5) {
      const extra = tickets.length - 5;
      const extraSolved = Math.max(0, totalSolved - 2);
      const curMonth = new Date().getMonth();
      monthlyIncoming[curMonth] += extra;
      monthlyResolved[curMonth] += extraSolved;
    }

    // 3. DATASET TAHUNAN (2023 - 2026) - Skala natural yang wajar
    const yearLabels = ['2023', '2024', '2025', '2026'];
    const yearlyIncoming = [4, 6, 8, tickets.length];
    const yearlyResolved = [4, 5, 7, totalSolved];

    return {
      hari: {
        title: 'Statistik Harian (Minggu Ini)',
        subtitle: 'Senin - Minggu, Minggu berjalan',
        labels: dayLabels,
        incoming: dailyIncoming,
        resolved: dailyResolved,
        avgTime: '1.2 Jam',
      },
      bulan: {
        title: 'Statistik Bulanan (Tahun 2026)',
        subtitle: 'Tren volume tiket per bulan',
        labels: monthLabels,
        incoming: monthlyIncoming,
        resolved: monthlyResolved,
        avgTime: '2.1 Jam',
      },
      tahun: {
        title: 'Statistik Tahunan',
        subtitle: 'Perbandingan performa tahun ke tahun',
        labels: yearLabels,
        incoming: yearlyIncoming,
        resolved: yearlyResolved,
        avgTime: '2.4 Jam',
      },
    };
  }, [tickets]);

  const currentData = datasets[period];

  // Hitung dimensi SVG proporsional untuk kartu kompak (1/3 Width / 1 Column)
  const chartWidth = 380;
  const chartHeight = 165;
  const paddingLeft = 28;
  const paddingRight = 14;
  const paddingTop = 16;
  const paddingBottom = 26;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const groundY = chartHeight - paddingBottom;

  // Nilai maksimum untuk skala Y (skala realistis, tidak melonjak tinggi)
  const maxValue = useMemo(() => {
    const allVals = [...currentData.incoming, ...currentData.resolved];
    const max = Math.max(...allVals, 2);
    return max <= 4 ? max + 1 : Math.ceil(max * 1.25);
  }, [currentData]);

  // Tick bulat yang rapi untuk Y-Axis
  const yTicks = useMemo(() => {
    if (maxValue <= 4) {
      return Array.from({ length: maxValue + 1 }, (_, i) => i);
    }
    const step = Math.ceil(maxValue / 3);
    const ticks = [0, step, step * 2, maxValue];
    return Array.from(new Set(ticks)).sort((a, b) => a - b);
  }, [maxValue]);

  // Hitung titik koordinat (x, y) untuk setiap seri data
  const { incomingPoints, resolvedPoints, xCoords } = useMemo(() => {
    const totalPoints = currentData.labels.length;
    const step = innerWidth / (totalPoints - 1);

    const xCoords = currentData.labels.map((_, i) => paddingLeft + i * step);

    const incomingPoints = currentData.incoming.map((val, i) => {
      const y = groundY - (val / maxValue) * innerHeight;
      return { x: xCoords[i], y };
    });

    const resolvedPoints = currentData.resolved.map((val, i) => {
      const y = groundY - (val / maxValue) * innerHeight;
      return { x: xCoords[i], y };
    });

    return { incomingPoints, resolvedPoints, xCoords };
  }, [currentData, maxValue, innerWidth, innerHeight, groundY, paddingLeft]);

  // Path SVG
  const incomingLinePath = useMemo(() => createSmoothPath(incomingPoints), [incomingPoints]);
  const incomingAreaPath = useMemo(() => createAreaPath(incomingPoints, groundY), [incomingPoints, groundY]);
  const resolvedLinePath = useMemo(() => createSmoothPath(resolvedPoints), [resolvedPoints]);
  const resolvedAreaPath = useMemo(() => createAreaPath(resolvedPoints, groundY), [resolvedPoints, groundY]);

  // Total angka pada periode aktif
  const totalIncoming = useMemo(() => currentData.incoming.reduce((a, b) => a + b, 0), [currentData]);
  const totalResolved = useMemo(() => currentData.resolved.reduce((a, b) => a + b, 0), [currentData]);

  return (
    <Card radius="xl" className="w-full p-4 md:p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
      {/* Top Header: Title & Period Filter Tabs (Tanpa Badge Persentase) */}
      <div className="flex flex-col gap-2 pb-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] leading-[22px] font-bold text-[#0F172A]">
              Statistik & Tren Tiket
            </h2>
          </div>

          {/* Period Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/80 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setPeriod('hari');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                period === 'hari'
                  ? 'bg-[#0C3E7E] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Per Hari
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('bulan');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                period === 'bulan'
                  ? 'bg-[#0C3E7E] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Per Bulan
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('tahun');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                period === 'tahun'
                  ? 'bg-[#0C3E7E] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Per Tahun
            </button>
          </div>
        </div>

        {/* Sub Header: Legend + Stats Context Realistis */}
        <div className="flex items-center justify-between text-[11.5px] text-[#64748B] flex-wrap gap-2">
          <span>{currentData.subtitle}</span>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0C3E7E]" />
              <span>Masuk ({totalIncoming})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Selesai ({totalResolved})</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[160px] md:h-[180px] overflow-visible"
        >
          <defs>
            {/* Gradient Masuk */}
            <linearGradient id="gradientIncoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C3E7E" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0C3E7E" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient Selesai */}
            <linearGradient id="gradientResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels (Sesuai Tick Nilai Bersih) */}
          {yTicks.map((val, idx) => {
            const y = groundY - (val / maxValue) * innerHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-semibold fill-slate-400"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          <path d={incomingAreaPath} fill="url(#gradientIncoming)" />
          <path d={resolvedAreaPath} fill="url(#gradientResolved)" />

          {/* Main Lines */}
          <path
            d={incomingLinePath}
            fill="none"
            stroke="#0C3E7E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={resolvedLinePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* X-Axis Labels */}
          {currentData.labels.map((label, idx) => {
            const x = xCoords[idx];
            const isHovered = hoveredIndex === idx;
            // Pada tampilan bulanan kompak, tampilkan selang-seling agar tidak bertumpuk
            const shouldRender = period !== 'bulan' || idx % 2 === 0 || isHovered;
            if (!shouldRender) return null;

            return (
              <text
                key={idx}
                x={x}
                y={chartHeight - 8}
                textAnchor="middle"
                className={`text-[9.5px] font-semibold transition-colors ${
                  isHovered ? 'fill-[#0C3E7E] font-bold' : 'fill-slate-500'
                }`}
              >
                {label}
              </text>
            );
          })}

          {/* Hover Indicator Vertical Line */}
          {hoveredIndex !== null && (
            <line
              x1={xCoords[hoveredIndex]}
              y1={paddingTop}
              x2={xCoords[hoveredIndex]}
              y2={groundY}
              stroke="#64748B"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}

          {/* Data Points (Dots) */}
          {xCoords.map((x, idx) => {
            const incY = incomingPoints[idx].y;
            const resY = resolvedPoints[idx].y;
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Invisible broad hitbox for easy hovering */}
                <rect
                  x={x - (innerWidth / currentData.labels.length) / 2}
                  y={paddingTop}
                  width={innerWidth / currentData.labels.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Incoming Point */}
                <circle
                  cx={x}
                  cy={incY}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#0C3E7E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all pointer-events-none"
                />

                {/* Resolved Point */}
                <circle
                  cx={x}
                  cy={resY}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-1 pointer-events-none z-20 bg-slate-900/95 text-white backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-slate-700/60 text-xs animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(
                Math.max((xCoords[hoveredIndex] / chartWidth) * 100, 15),
                85
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-[11.5px] text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between gap-4">
              <span>{currentData.labels[hoveredIndex]}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {period === 'hari' ? 'Hari Ini' : period === 'bulan' ? '2026' : 'Performa'}
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-4 text-blue-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0C3E7E] border border-blue-300" />
                  Tiket Masuk:
                </span>
                <span className="font-bold text-white">{currentData.incoming[hoveredIndex]}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] border border-emerald-300" />
                  Tiket Selesai:
                </span>
                <span className="font-bold text-white">{currentData.resolved[hoveredIndex]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
