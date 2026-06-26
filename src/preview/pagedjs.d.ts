declare module 'pagedjs' {
  export interface PagedFlow {
    total: number;
    pages: unknown[];
  }
  export class Previewer {
    constructor();
    preview(content: string, stylesheets: string[], renderTo: HTMLElement): Promise<PagedFlow>;
  }
}
