export type BBox = { x: number; y: number; width: number; height: number };
export type DetectedObject = { class: string; score: number; bbox: BBox };

export class Detector {
  static async create() {
    return new Detector();
  }
  async detectFromBase64(base64: string) {
    return [];
  }
}
