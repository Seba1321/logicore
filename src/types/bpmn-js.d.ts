declare module "bpmn-js/lib/Viewer" {
  export default class BpmnViewer {
    constructor(options: { container: HTMLElement });
    importXML(xml: string): Promise<unknown>;
    get(service: "canvas"): { zoom(value: "fit-viewport" | number, center?: "auto" | { x: number; y: number }): void };
    destroy(): void;
  }
}
