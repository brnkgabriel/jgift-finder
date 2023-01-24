import { config, constants, gfConfig } from "./core/constants";
import { Controller } from "./core/controller";
import { IRemoteConfig, IRemoteData } from "./core/interfaces/config";
import { ICampaignCalendar, MarketingTypes } from "./core/interfaces/data";
import { iRemoteData } from "./core/types/index";
import { Util } from "./core/util";

const wind = window as any
// Note: "about" in the line below is important to prevent fetch of config document
const fbox = wind.Featurebox({ config }, "about")
let controller: Controller

const databaseOperations = () => {
  const database = new fbox.Database(gfConfig)
  database.getAll(constants.GIFTFINDERCOLLECTION, constants.GIFTFINDERDOCSEVENT)
}

databaseOperations()

fbox.pubsub.subscribe(constants.GIFTFINDERDOCSEVENT, (data: any) => {
  let remoteData: iRemoteData = { superblocks: [] }
  
  const keys = Object.keys(data)
  keys.map(key => {
    switch (key) {
      case constants.ABOUT: remoteData.about = data[key].about
        break;
      case constants.CONFIG: remoteData.config = data[key]
        break;
      default: remoteData.superblocks?.push(data[key])
        break;
    }
  })
  new Controller(remoteData, fbox)
})



fbox.pubsub.subscribe(fbox.FETCHED_DATA, (data: any) => {
  // const remoteData:IRemoteData = data as IRemoteData
  // controller = new Controller(remoteData, fbox)
  // const calendar:any[] = controller.getData(constants.NAME)
  // const times: number[] = controller.times(calendar)
  // console.log("data is", data)
})