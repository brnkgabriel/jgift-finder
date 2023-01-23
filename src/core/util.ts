import { IDomain, IRemoteConfig } from "./interfaces/config";
import { IPastAndFutureTimes } from "./interfaces/others";
import { constants, fxn } from "./constants";
import { ICampaignCalendar } from "./interfaces/data";
import { iConfig, iDynamicObject, iRemoteData } from "./types/index";

// type TypeOrNull<T> = T | null;

export class Util {
  private remoteData:iRemoteData;
  private timeInterval:number = 0;
  private currency: string;
  private config: iConfig;
  private domain: string;
  protected el;
  protected all;
  private pad;
  private skuRow;
  // private skuRows;
  private tab;
  private live;
  private skuID;
  private capitalize;
  private digit;
  protected isATab;
  private midnight;
  protected fbox;

  constructor(remoteData: iRemoteData, fbox: any) {
    this.remoteData = remoteData
    this.currency = (this.remoteData.config as iConfig).currency
    this.config = this.remoteData.config as iConfig
    this.domain = this.remoteData.config?.domain as string
    this.fbox = fbox

    this.el = (query: string) => document.querySelector(fxn.idQuery(query)) as HTMLElement
    this.all = (query: string) => document.querySelectorAll(fxn.idQuery(query))
    this.pad = (time: number) => time.toString().length == 1 ? "0" + time : time
    this.skuRow = (time: number) => this.el(fxn.timeQuery(time))
    // this.skuRows = () => this.all(constants.SKUROWQUERY)
    this.tab = (time: number) => this.el(fxn.tabQuery(time))
    this.live = (list: HTMLElement[], action: "add" | "remove") => list.forEach(each => each.classList[action](constants.LIVECLASS))
    this.skuID = (sku: ICampaignCalendar) => sku.name + "-" + (+new Date(sku.time))
    this.capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)
    this.digit = (num: number, unit: string) => num !== 0 ? this.pad(num) + unit : ""
    this.isATab = (el: HTMLElement) => el.classList.contains(constants.TABCLASS) 
    this.midnight = (time: number | string) => +new Date(time).setHours(0, 0, 0, 0)
  }

  times(skus:ICampaignCalendar[]) {
    const times = skus.map(sku => this.midnight(sku.time))
    const uniqueTimes = Array.from(new Set(times))
    return uniqueTimes.sort((a, b) => a - b)
  }


  timeUnits(time: number) {
    const $date = new Date(time)
    const day = $date.getDay()
    const month = $date.getMonth()
    const date = $date.getDate()
    const hour = $date.getHours()
    const mins = $date.getMinutes()

    return { day, month, date, hour, mins }
  }

  twelveHrFormat(hour: number, mins: number) {
    if (hour === 12) return `${this.pad(hour)}:${this.pad(mins)}${constants.PM}`
    else if (hour > 12) return `${this.pad(hour - 12)}:${this.pad(mins)}${constants.PM}`
    else if (hour === 0) return `12:${this.pad(mins)}${constants.AM}`
    else return `${this.pad(hour)}:${this.pad(mins)}${constants.AM}`
  }
  
  dayDiff(time: number) {
    const timeDate = new Date(time).getDate()
    return new Date().getDate() - timeDate
  }

  sameMonth(time: number) {
    return new Date(time).getMonth() === new Date().getMonth()
  }

  date(time: number) {
    const dayDiff = this.dayDiff(time)
    if (dayDiff === 0 && this.sameMonth(time))
      return this.capitalize(constants.TODAY)
    else if (dayDiff === 1 && this.sameMonth(time))
      return this.capitalize(constants.YESTERDAY)
    else if (dayDiff === -1 && this.sameMonth(time))
      return this.capitalize(constants.TOMORROW)
    else return this.fullDate(time)
  }

  fullDate(time: number) {
    const date = new Date(time)
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const day = date.toLocaleDateString("en-US", { weekday: "short" })
    return `${day} ${month} ${date.getDate()}`
  }

  toggle(toRemove: NodeListOf<Element>, toAdd: HTMLElement, className: string) {
    toRemove.forEach(el => el.classList.remove(className))
    toAdd.classList.add(className)
  }

  price(raw: string) {
    const num = this.numFromStr(raw)
    return `${this.currency} ${Number(num).toLocaleString()}`
  }

  numFromStr(str: string) {
    const match = str.match(/\d/g)
    return match ? match.join("") : 0
  }

  formatPrice(price: string) {
    const formatted = this.config.currencyPosition === constants.PREFIX
    ? `${this.currency} ${Number(price).toLocaleString()}`
    : `${Number(price).toLocaleString()} ${this.config.currency}`

    return Number(price) === 0 ? constants.FREE : formatted
  }

  discount($old: string, $new: string) {
    const diff = Number($old) - Number($new)
    const ratio = diff * 100 / Number($old)
    return !isNaN(ratio) ? `-${Math.round(ratio)}%` : ""
  }

  // continue from replace pattern
  replacePattern(pattern: string | RegExp, str: string) {
    const re = new RegExp(pattern, "g")
    return str.replace(re, "-")
  }

  id(name: string, delim: string) {
    const replaceApostrophe = this.replacePattern("'", name)
    const replaceAmpersand = this.replacePattern("&", replaceApostrophe)
    const replacePercent = this.replacePattern("%", replaceAmpersand)
    return replacePercent.toLowerCase().split(" ").join(delim)
  }

  key(keyStr: string, obj: IRemoteConfig) {
    type KeyType = keyof typeof obj
    return keyStr as KeyType
  }


  timeFormat(time: number) {
    const tUnits = this.timeUnits(time)
    const t = this.twelveHrFormat(tUnits.hour, tUnits.mins)
    return `${this.date(time)}'s ${t} sale`
  }

  show() {
    let imageObserver = new this.fbox.ImageObserver()
    console.log("featurebox is", this.fbox)
    imageObserver = null
    return this
  }

  platform() {
    const isMobile = 'ontouchstart' in window
    const mBannerStr = constants.SHEETNAME + "_mobile_banner"
    const dBannerStr = constants.SHEETNAME + "_desktop_banner"
    const deeplinkStr = constants.SHEETNAME + "_deeplink"

    const mBanner = this.config.mobileAppBanner
    const dBanner = this.config.desktopBanner

    const banner = isMobile ? mBanner : dBanner
    
    return { banner }
  }
}