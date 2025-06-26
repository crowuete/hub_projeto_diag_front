// components/BarChart.tsx
"use client";

import React, { useEffect, useState } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { motion } from "framer-motion";
import type { ResultadoDimensao } from "@/redux/features/questionnaireApiSlice";
import { useGetDimensoesQuery } from "@/redux/features/questionnaireApiSlice";

const width = 800;
const height = 400;
const margin = { top: 20, right: 40, bottom: 10, left: 60 };

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#058AFF",
  border: "2px solid #F2F2F2",
  borderRadius: 6,
  color: "white",
  padding: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
};


export default function BarChart() {
  const { data: availableData = [] } = useGetDimensoesQuery();
  const [rawData, setRawData] = useState<ResultadoDimensao[]>([]);

  useEffect(() => {
    if (availableData && Array.isArray(availableData)) {
      setRawData(availableData as ResultadoDimensao[]);
    }
  }, [availableData]);

  const filteredData = rawData.filter(
    (d): d is ResultadoDimensao =>
      !!d && typeof d.valorFinal === "number" && !!d.dimensao
  );

  const xScale = scaleBand<string>({
    domain: filteredData.map((d) => d.dimensao),
    range: [margin.left, width - margin.right],
    padding: 0.3,
  });

  const minY = 0;
  const maxY = Math.max(...filteredData.map((d) => d.valorFinal), 5);

  const yScale = scaleLinear({
    domain: [minY, maxY + 20],
    nice: true,
    range: [height - margin.bottom, margin.top],
  });

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<ResultadoDimensao>();

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <GridRows
          scale={yScale}
          width={width - margin.left - margin.right}
          left={margin.left}
          stroke="#e5e7eb"
        />
        <GridColumns
          scale={xScale}
          height={height - margin.top - margin.bottom}
          top={margin.top}
          stroke="#f3f4f6"
        />
        <AxisBottom
          top={height - margin.bottom}
          scale={xScale}
          label="DIMENSÕES"
          labelProps={{
            fontSize: 15,
            fontWeight: "bold",
            fill: "#058AFF",
            dy: "2em",
            textAnchor: "middle",
          }}
          tickLabelProps={() => ({
            fontSize: 12,
          })}
        />
        <AxisLeft
          left={margin.left}
          scale={yScale}
          label="VALOR FINAL"
          labelProps={{
            fontSize: 15,
            fontWeight: "bold",
            fill: "#058AFF",
            dx: "-2.5em",
            textAnchor: "middle",
          }}
          tickLabelProps={() => ({
            fill: "#00247c",
            fontSize: 13,
            fontWeight: "bold",
            textAnchor: "end",
            dx: "-0.3em",
            dy: "0.25em",
          })}
        />

        <Group>
          {filteredData.map((d, i) => {
            const barX = xScale(d.dimensao) ?? 0;
            const barWidth = xScale.bandwidth();

            const y0 = yScale(0); // base da barra (eixo X real)
            const y1 = yScale(d.valorFinal); // topo da barra
            const barHeight = y0 - y1; // cresce para cima
            const barY = y1; 

            return (
              <motion.rect
                key={i}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#058AFF"
                // initial={{ height: 0, y: y0}}
                // animate={{ height: barHeight, y: barY }}
                // transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                onMouseMove={(e) => {
                  const coords = localPoint(e);
                  showTooltip({
                    tooltipData: d,
                    tooltipLeft: coords?.x,
                    tooltipTop: coords?.y,
                  });
                }}
                onMouseLeave={hideTooltip}
              />
            );
          })}
        </Group>
      </svg>

      {tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <strong>Dimensão:</strong> {tooltipData.dimensao}
          </div>
          <div>
            <strong>Valor:</strong> {tooltipData.valorFinal}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
