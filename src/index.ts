import { config, constants } from "./core/constants";
import { Controller } from "./core/controller";
import { IRemoteConfig, IRemoteData } from "./core/interfaces/config";
import { ICampaignCalendar, MarketingTypes } from "./core/interfaces/data";
import { Util } from "./core/util";

const wind = window as any
const fbox = wind.Featurebox({ config })
let controller: Controller

fbox.pubsub.subscribe(fbox.FETCHED_DATA, (data: any) => {
  const remoteData:IRemoteData = data as IRemoteData
  controller = new Controller(remoteData, fbox)
  const calendar:any[] = controller.getData(constants.NAME)
  const times: number[] = controller.times(calendar)
  console.log("data is", data)
})