import * as schedule from "node-schedule";
import logs from "../middlewares/logger";

export default function (callback: VoidFunction) {
  schedule.scheduleJob("0 0 */2 * * *", async () => {
    /** 每两小时执行一次 */
    logs.conlog({
      msg:
        "每两小时执行一次 执行=======================>>>>>>>>>>>>>>>>>>>>开始",
    });
    callback && (await callback());
  });
}
