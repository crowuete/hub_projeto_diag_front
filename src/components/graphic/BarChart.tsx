"use client";

import { useEffect, useRef, useState } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { ResultadoDimensao, useGetDimensoesQuery } from "@/redux/features/questionnaireApiSlice";

const prefersDark = typeof window !== "undefined" && window.matchMedia('(prefers-color-scheme: dark)').matches;

const margin = { top: 30, right: 40, bottom: 120, left: 40 };

const tooltipStyles = {
  ...defaultStyles,
  border: "2px solid #F2F2F2",
  borderRadius: 6,
  color: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
};

export default function BarChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const { data: availableData = [] } = useGetDimensoesQuery();

  const filteredData = (availableData as ResultadoDimensao[]).filter(
    (d): d is ResultadoDimensao =>
      !!d && typeof d.valorFinal === "number" && !!d.dimensao && typeof d.media === "number"
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let width = entry.contentRect.width;
        if (width < 350) {
          width = 350;
        }
        const aspectRatio = width < 500 ? 1.1 : 0.6; // mais altura em telas pequenas
        const height = width * aspectRatio;
        setDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => el && observer.unobserve(el);
  }, []);

  const { width, height } = dimensions;

  const xScale = scaleBand<string>({
    domain: filteredData.map((d) => d.dimensao),
    range: [margin.left, width - margin.right],
    padding: 0.3,
  });

  const xSubScale = scaleBand<string>({
    domain: ["usuario", "media"],
    range: [0, xScale.bandwidth()],
    padding: 0.1,
  });

  const maxY = Math.max(...filteredData.map((d) => Math.max(d.valorFinal, d.media ?? 0)));

  const yScale = scaleLinear({
    domain: [0, maxY + 10], // margem superior
    nice: true,
    range: [height - margin.bottom, margin.top],
  });

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip<{
      dimensao: string;
      tipo: string;
      valor: number;
    }>();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4" ref={containerRef}>
      <svg width={width} height={height}>
        <AxisBottom
          top={height - margin.bottom}
          scale={xScale}
          tickLabelProps={() => ({
            fill: prefersDark ? "#05AFF2" : "#05AFF2",
            fontSize: 13,
            fontWeight: "bold",
            textAnchor: "middle",
            angle: -45,
            dy: "3.5em",
            dx: "-1.5em",
          })}
        />
        <AxisLeft
          left={margin.left}
          scale={yScale}
          tickLabelProps={() => ({
            fill: prefersDark ? "#05AFF2" : "#05AFF2",
            fontSize: 13,
            fontWeight: "bold",
            textAnchor: "end",
            dx: "-0.3em",
            dy: "0.25em",
          })}
        />

        <Group>
          {filteredData.map((d, i) => {
            const groupX = xScale(d.dimensao) ?? 0;
            const bars = [
              {
                tipo: "usuario",
                valor: d.valorFinal,
                cor: prefersDark ? "#058AFF" : "#058AFF",
              },
              {
                tipo: "media",
                valor: d.media!,
                cor: "rgb(196, 0, 0)",
              },
            ];

            return (
              <Group key={i} left={groupX}>
                {bars.map((bar, j) => {
                  const barX = xSubScale(bar.tipo) ?? 0;
                  const barY = yScale(bar.valor);
                  const barHeight = yScale(0) - barY;
                  const barWidth = xSubScale.bandwidth();

                  return (
                    <rect
                      key={j}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={bar.cor}
                      onMouseMove={(e) => {
                        const coords = localPoint(e);
                        showTooltip({
                          tooltipData: {
                            dimensao: d.dimensao,
                            tipo: bar.tipo,
                            valor: bar.valor,
                          },
                          tooltipLeft: coords?.x,
                          tooltipTop: coords?.y,
                        });
                      }}
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </Group>
            );
          })}
        </Group>
      </svg>

      {tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...tooltipStyles,
            backgroundColor: tooltipData.tipo === "usuario" ? "#05AFF2" : "rgb(196, 0, 0)",
          }}
        >
          <div>
            <strong>{tooltipData.dimensao}</strong>
          </div>
          <div>
            {tooltipData.tipo === "usuario" ? "Seu valor" : "Média"}:{" "}
            {tooltipData.valor.toFixed(2)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
