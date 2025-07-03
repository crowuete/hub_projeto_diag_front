"use client";

import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Tooltip, useTooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import type { ResultadoDimensao } from "@/redux/features/questionnaireApiSlice";
import { useGetDimensoesQuery } from "@/redux/features/questionnaireApiSlice";

const width = 1000;
const height = 600;
const margin = { top: 30, right: 60, bottom: 120, left: 40 };

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#058AFF",
  border: "6px solid #F2F2F2",
  borderRadius: 6,
  color: "white",
  padding: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
};

export default function BarChart() {
  const { data: availableData = [] } = useGetDimensoesQuery();

  const filteredData = (availableData as ResultadoDimensao[]).filter(
  (d): d is ResultadoDimensao =>
    !!d &&
    typeof d.valorFinal === "number" &&
    !!d.dimensao &&
    typeof d.media === "number"
);

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

  const maxY = Math.max(
    ...filteredData.map((d) =>
      Math.max(d.valorFinal, d.media ?? 0)
    )
  );

  const yScale = scaleLinear({
    domain: [0, maxY + 20],
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
    <div className="relative">
      <svg width={width} height={height}>
        <GridRows
          scale={yScale}
          width={width - margin.left - margin.right}
          left={margin.left}
          stroke="rgb(222, 224, 226)"
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
          tickLabelProps={() => ({
            fill: "#00247c",
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
            const groupX = xScale(d.dimensao) ?? 0;

            const bars = [
              {
                tipo: "usuario",
                valor: d.valorFinal,
                cor: "#058AFF",
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
            backgroundColor: tooltipData.tipo === "usuario" ? "#058AFF" : "rgb(196, 0, 0)", // azul ou vermelho
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
