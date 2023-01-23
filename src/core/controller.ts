import { constants } from "./constants";
import { IRemoteData } from "./interfaces/config";
import { ICampaignCalendar } from "./interfaces/data";
import { SKURows } from "./skurows";
import { Tabs } from "./tabs";
import { Util } from "./util";

export class Controller extends Util {
  private data: ICampaignCalendar[]
  private tandcs: ICampaignCalendar[]
  private tandcsEl: HTMLElement
  private hiwCTA: HTMLElement
  private topBanner: HTMLElement
  private tabs: Tabs
  private skuRows: SKURows

  constructor(remoteData: IRemoteData, fbox: any) {
    super(remoteData, fbox)

    this.data = this.getData(constants.INITIATIVE)
    this.tandcs = this.getData(constants.TANDCS)

    this.tandcsEl = this.el(constants.TANDCSQUERY)
    this.hiwCTA = this.el(constants.HOWITWORKSQUERY)
    this.topBanner = this.el(constants.TOPBANNERQUERY)

    this.hiwCTA.addEventListener(constants.CLICK, this.toggleBanner.bind(this))

    this.tabs = new Tabs(remoteData, fbox)
    this.skuRows = new SKURows(remoteData, fbox)

    this.fbox.pubsub.subscribe(constants.RESET, this.init.bind(this))

    this.init()
    .setBanner()
    .displayTAndCs()
    .show()
    
  }

  init() {
    const allTimes = this.times(this.data)
    const pastFuture = this.pastAndFutureTimes(allTimes)
    const additionalTimes = this.additionalTimes(pastFuture)
    .filter(time => time !== undefined)
    const reorderedTimes = pastFuture.future.concat(additionalTimes)
    const groupedSKUs = this.group(this.data, reorderedTimes)
    this.fbox.pubsub.emit(constants.BUILD, { reorderedTimes, groupedSKUs })

    return this
  }

  toggleBanner() {
    this.topBanner.classList.toggle(constants.SHOWCLASS)
    const hiwText = this.hiwCTA.querySelector(constants.TXTCLASS) as HTMLElement
    hiwText.textContent = hiwText?.textContent === constants.TERMSANDCONDIIONS
    ? constants.CLOSE : constants.TERMSANDCONDIIONS
  }

  setBanner() {
    const bannerImage = this.el(constants.BANNERQUERY)
    bannerImage.setAttribute(constants.DATASRC, this.platform().banner)
    return this
  }

  displayTAndCs() {
    this.tandcsEl.innerHTML = this.tandcs.map(this.tandcHTML.bind(this)).join("")
    return this
  }

  tandcHTML(tandc: ICampaignCalendar) {
    return `<div class="-rule_element"><div class="-inlineblock -vatop -num">${tandc.sku}.</div><div class="-inlineblock -vatop -desc">${tandc.name}</div></div>`
  }
}