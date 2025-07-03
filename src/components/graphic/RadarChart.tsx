"use client";

import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { localPoint } from "@visx/event";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";
import type { ModuloRelatorio } from "@/redux/features/questionnaireApiSlice";

const size = 700;
const center = size / 2;
const radius = center - 110;
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
  const userValues = data.dimensoes.map((d) => d.valorFinal);
  const mediaValues = data.dimensoes.map(
    d => data.media_dimensoes[d.dimensao.id.toString()] ?? 0
  );

  const maxValue = Math.max(...userValues.concat(mediaValues));
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

  const userPoints = userValues.map((v, i) => getPoint(i, v));
  const mediaPoints = mediaValues.map((v, i) => getPoint(i, v));

  const userPolygon = userPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const mediaPolygon = mediaPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip<{
    label: string;
    value: number;
    tipo: "usuario" | "media";
  }>();

  return (
    <div className="relative">
      <svg width={size} height={size}>
        <Group>
          {/* Grade circular */}
          {Array.from({ length: levels }).map((_, levelIdx) => {
            const r = ((levelIdx + 1) / levels) * radius;
            const isLast = levelIdx === levels - 1;

            return (
              <circle
                key={levelIdx}
                cx={center}
                cy={center}
                r={r}
                stroke="rgb(67, 145, 41)"
                strokeWidth={isLast ? 2.5 : 0.4}
                fill="none"
              />
            );
          })}

          {/* Linhas e rótulos */}
          {labels.map((label, i) => {
            const outer = getPoint(i, maxValue);
            return (
              <g key={i}>
                <line x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#d1d5db" />
                <text
                  x={outer.x}
                  y={outer.y}
                  dy={outer.y < center ? "-2em" : "3em"}
                  dx={outer.x < center ? "-2em" : "3em"}
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

          {/* Polígono da média */}
          <polygon
            points={mediaPolygon}
            fill="rgba(196, 0, 0, 0.3)"
            stroke="rgb(196, 0, 0)"
            strokeWidth={2}
          />

          {/* Polígono do usuário */}
          <polygon
            points={userPolygon}
            fill="rgba(5, 138, 255, 0.4)"
            stroke="#058AFF"
            strokeWidth={2}
          />

          {/* Pontos interativos */}
          {userPoints.map((p, i) => (
            <circle
              key={`user-${i}`}
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
                    value: userValues[i],
                    tipo: "usuario",
                  },
                  tooltipLeft: coords?.x,
                  tooltipTop: coords?.y,
                });
              }}
              onMouseLeave={hideTooltip}
            />
          ))}

          {mediaPoints.map((p, i) => (
            <circle
              key={`media-${i}`}
              cx={p.x}
              cy={p.y}
              r={6}
              fill="rgb(196, 0, 0)"
              stroke="#fff"
              strokeWidth={2}
              onMouseMove={(e) => {
                const coords = localPoint(e);
                showTooltip({
                  tooltipData: {
                    label: labels[i],
                    value: mediaValues[i],
                    tipo: "media",
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
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...tooltipStyles,
            backgroundColor: tooltipData.tipo === "usuario" ? "#058AFF" : "rgb(196, 0, 0)", // azul ou vermelho
          }}
        >
          <div>
            <strong>{tooltipData.label}</strong>
          </div>
          <div>
            {tooltipData.tipo === "usuario" ? "Seu valor" : "Média"}:{" "}
            {tooltipData.value.toFixed(2)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}