declare module "bpmn-js/lib/Viewer" {
  export default class BpmnViewer {
    constructor(options: { container: HTMLElement });
    importXML(xml: string): Promise<unknown>;
    get(service: "canvas"): { zoom(value: "fit-viewport" | number): void };
    destroy(): void;
  }
}
