declare module "bpmn-js/lib/Viewer" {
  export default class BpmnViewer {
    constructor(options: { container: HTMLElement });
    importXML(xml: string): Promise<unknown>;
    get(service: "canvas"): { zoom(value: "fit-viewport" | number, center?: "auto" | { x: number; y: number }): void };
    destroy(): void;
  }
}

declare module "bpmn-js/lib/NavigatedViewer" {
  interface BpmnCanvas {
    zoom(value?: "fit-viewport" | number, center?: "auto" | { x: number; y: number }): number;
  }
  interface BpmnElement {
    type: string;
    businessObject?: { $type?: string };
  }
  interface BpmnElementRegistry {
    getAll(): BpmnElement[];
  }
  export default class NavigatedViewer {
    constructor(options: { container: HTMLElement });
    importXML(xml: string): Promise<unknown>;
    get(service: "canvas"): BpmnCanvas;
    get(service: "elementRegistry"): BpmnElementRegistry;
    destroy(): void;
  }
}
