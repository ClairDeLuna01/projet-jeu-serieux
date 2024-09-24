import { Vector2 } from "@math.gl/core";

export function rotate_around_axis(
  point: Vector2,
  angle: number,
  axis: Vector2
): Vector2 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);

  const x = point.x - axis.x;
  const y = point.y - axis.y;

  const x_new = x * c - y * s;
  const y_new = x * s + y * c;

  return new Vector2([x_new + axis.x, y_new + axis.y]);
}
