"use client";

import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { localPoint } from "@visx/event";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";
import type { ModuloRelatorio } from "@/redux/features/questionnaireApiSlice";

const size = 500;
const center = size / 2;
const radius = center - 60;
const levels = 5;

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#058AFF",
  border: "2px solid #F2F2F2",
  borderRadius: 6,
  color: "white",
  padding: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
};

type RadarChartProps = {
  data: ModuloRelatorio;
};

export default function RadarChart({ data }: RadarChartProps) {
   const labels = data.dimensoes.map((d) => d.dimensao.titulo);
  const values = data.dimensoes.map((d) => d.valorFinal);

  const maxValue = Math.max(...values);
  const rScale = scaleLinear({
    domain: [0, maxValue],
    range: [0, radius],
  });

  const angleSlice = (2 * Math.PI) / labels.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = rScale(value);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = values.map((v, i) => getPoint(i, v));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip<{
    label: string;
    value: number;
  }>();

  return (
    <div className="relative">
      <svg width={size} height={size}>
        <Group>
          {/* Grade circular */}
          {Array.from({ length: levels }).map((_, levelIdx) => {
            const levelRadius = ((levelIdx + 1) / levels) * radius;
            return (
              <circle
                key={levelIdx}
                cx={center}
                cy={center}
                r={levelRadius}
                stroke="#e5e7eb"
                fill="none"
              />
            );
          })}

          {/* Linhas dos eixos e rótulos */}
          {labels.map((label, i) => {
            const outer = getPoint(i, maxValue);
            return (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#d1d5db"
                />
                <text
                  x={outer.x}
                  y={outer.y}
                  dy={outer.y < center ? "-0.5em" : "1em"}
                  dx={outer.x < center ? "-0.5em" : "0.5em"}
                  fontSize={13}
                  fontWeight="bold"
                  fill="#00247c"
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Polígono dos dados */}
          <polygon
            points={polygonPoints}
            fill="#058AFF55"
            stroke="#058AFF"
            strokeWidth={2}
          />

          {/* Pontos interativos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={6}
              fill="#058AFF"
              stroke="#fff"
              strokeWidth={2}
              onMouseMove={(e) => {
                const coords = localPoint(e);
                showTooltip({
                  tooltipData: {
                    label: labels[i],
                    value: values[i],
                  },
                  tooltipLeft: coords?.x,
                  tooltipTop: coords?.y,
                });
              }}
              onMouseLeave={hideTooltip}
            />
          ))}
        </Group>
      </svg>

      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <strong>{tooltipData.label}</strong>
          </div>
          <div>
            Valor: {tooltipData.value.toFixed(2)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}