import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { MoveRight } from "lucide-react";

export function BidirectionalEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    label,
    data,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isBelow = data?.labelSide === "below";
  const yShift = isBelow ? 14 : -14;

  const strokeColor = (style as any)?.stroke ?? "#374151";

  const angleDeg =
    (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ ...style, strokeWidth: 2 }} />

      <EdgeLabelRenderer>
        <div
          style={{
            left: labelX,
            top: labelY,
          }}
          className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 transform pointer-events-none"
        >
          <span className="inline-flex flex-col items-center justify-center p-0 bg-white rounded-lg shadow-sm">
            <MoveRight
              color={strokeColor}
              size={11}
              strokeWidth={1.8}
              style={{ transform: `rotate(${angleDeg}deg)` }}
            />
            <MoveRight
              color={strokeColor}
              size={11}
              strokeWidth={1.8}
              style={{ transform: `rotate(${angleDeg + 180}deg)` }}
            />
          </span>
        </div>

        <div
          style={{
            left: labelX,
            top: labelY,
            transform: `translate(-50%, calc(-50% + ${yShift}px))`,
          }}
          className="absolute pointer-events-auto"
        >
          <span
            className="px-1.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md shadow-sm whitespace-nowrap"
            title={String(label ?? "")}
          >
            {label}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
