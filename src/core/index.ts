import { DefaultOptons, Options, TrackerConfig, reportTrackerData } from "../types/index";
import { createHistoryEvent } from "../utils/pv";
export class Tracker {
  public data: Options;
  constructor(options: Options) {
    this.data = Object.assign(this.initDef(), options);
    this.installTracker();
  }
  private initDef(): DefaultOptons {
    window.history["pushState"] = createHistoryEvent("pushState");
    window.history["replaceState"] = createHistoryEvent("replaceState");
    return <DefaultOptons>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    };
  }

  private captureEvent<T>(eventList: string[], targetKey: string, data?: T) {
    eventList.forEach((event) => {
      window.addEventListener(event, () => {
        console.log(`监听到了${event}事件`);
        this.reportTracker({event,targetKey,data});
      });
    });
  }

  private installTracker() {

    if (this.data.historyTracker) {
     
      this.captureEvent(["pushState", "replaceState", "popState"], "history-track");
    }
    if (this.data.hashTracker) {
      this.captureEvent(["hashChange"], "hash-track");
    }
  }

  //自动上报
  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: new Date().getTime() });
    let headers = {
      type: "application/x-www-form-urlencoded",
    };
    const blob = new Blob([JSON.stringify(params)], headers);
    navigator.sendBeacon(this.data.requestUrl, blob);

    
  }

  //手动上报
  public sendTracker<T extends reportTrackerData>(data: T) {
    this.reportTracker(data);
  }

  public setUserId(uuid: DefaultOptons["uuid"]) {
    this.data.uuid = uuid;
  }
  public setExtra<T extends DefaultOptons["extra"]>(extra: T) {
    this.data.extra = extra;
  }
}


