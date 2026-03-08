import { BBox } from "../services/vision/Detector";

export function estimateDistanceMeters(bbox: BBox, imageWidth: number) {
  const ratio = bbox.width / imageWidth;
  const distance = 5 / Math.max(0.1, ratio);
  return distance;
}
