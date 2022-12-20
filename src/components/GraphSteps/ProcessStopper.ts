export default class ProcessStopper {
  _abort = false;
  abort() {
    this._abort = true;
  }
  abortIfNeeded() {
    if (this._abort) {
      throw Error('Process stoped');
    }
  }
}
