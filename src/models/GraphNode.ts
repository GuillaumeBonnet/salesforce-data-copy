import { SobjectData, Edge } from "./types";
export class GraphNode {
  constructor(
    public sourceData: SobjectData,
    public targetData: SobjectData,
    public parentNodes: Array<Edge>,
    public state:
      | "NONE"
      | "PREPARING_UPSERT"
      | "UPSERTED"
      | "ERROR"
      | "SKIPPED",
    public isInitialRecord: boolean = false
  ) {}

  public get sourceId() {
    return this.sourceData["Id"];
  }
  get targetId() {
    if (!this.targetData) {
      return "";
    }
    return this.targetData["Id"];
  }
  set targetId(value: string) {
    if (!this.targetData) {
      throw Error(
        "Can't set targetId because targetData has not been intialized."
      );
    }
    this.targetData["Id"] = value;
  }
  get type() {
    return this.sourceData.attributes.type;
  }
}
