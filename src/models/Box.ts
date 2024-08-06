export class Box {
  boxId: string;
  startDate: Date;

  constructor(boxId: string, startDate: string) {
    this.boxId = boxId;
    this.startDate = new Date(startDate);
  }
}
