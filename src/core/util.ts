import { IDomain, IRemoteConfig, IRemoteData } from "./interfaces/config";
import { IPastAndFutureTimes } from "./interfaces/others";
import { constants, fxn } from "./constants";
import { ICampaignCalendar } from "./interfaces/data";

// type TypeOrNull<T> = T | null;

export class Util {
  private remoteData:IRemoteData;
  private timeInterval:number = 0;
  private minutesDuration: number;
  private currency: string;
  private config: IRemoteConfig;
  private domain: IDomain;
  protected el;
  protected all;
  private pad;
  private endTime;
  private skuRow;
  // private skuRows;
  private tab;
  private live;
  private skuID;
  private capitalize;
  private oosByTime;
  private isItMyTime;
  private isPast;
  private isFuture;
  private digit;
  protected isATab;
  private midnight;
  protected fbox;

  constructor(remoteData: IRemoteData, fbox: any) {
    this.remoteData = remoteData
    this.minutesDuration = Number(this.remoteData.config.minute_duration_campaign_calendar)
    this.currency = this.remoteData.config.currency
    this.config = this.remoteData.config
    this.domain = this.remoteData.domain
    this.fbox = fbox

    this.el = (query: string) => document.querySelector(fxn.idQuery(query)) as HTMLElement
    this.all = (query: string) => document.querySelectorAll(fxn.idQuery(query))
    this.pad = (time: number) => time.toString().length == 1 ? "0" + time : time
    this.endTime = (time: number) => time + (this.minutesDuration * 60 * 1000)
    this.skuRow = (time: number) => this.el(fxn.timeQuery(time))
    // this.skuRows = () => this.all(constants.SKUROWQUERY)
    this.tab = (time: number) => this.el(fxn.tabQuery(time))
    this.live = (list: HTMLElement[], action: "add" | "remove") => list.forEach(each => each.classList[action](constants.LIVECLASS))
    this.skuID = (sku: ICampaignCalendar) => sku.name + "-" + (+new Date(sku.time))
    this.capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)
    this.oosByTime = (times: number[]) => times.map(time => this.skuRow(time)?.classList.add(constants.OOSCLASS))
    this.isItMyTime = (sku: ICampaignCalendar, time: number) => +new Date(sku.time) === time
    this.isPast = (time: number) => Date.now() > time && Date.now() > this.endTime(time)
    this.isFuture = (time: number, past: number[]) => past.indexOf(time) === -1
    this.digit = (num: number, unit: string) => num !== 0 ? this.pad(num) + unit : ""
    this.isATab = (el: HTMLElement) => el.classList.contains(constants.TABCLASS) 
    this.midnight = (time: number | string) => +new Date(time).setHours(0, 0, 0, 0)
  }

  getData(initiative: string) {
    const list = this.remoteData.json_list as ICampaignCalendar[]
    return list.filter((datum) => datum.initiative === initiative)
  }

  times(skus:ICampaignCalendar[]) {
    const times = skus.map(sku => this.midnight(sku.time))
    const uniqueTimes = Array.from(new Set(times))
    return uniqueTimes.sort((a, b) => a - b)
  }

  group(skuList: ICampaignCalendar[], times: number[]) {
    return times.map(time => {
      const skus = skuList.filter(sku => this.isItMyTime(sku, time))
      return { time, skus }
    })
  }

  pastAndFutureTimes(times: number[]) {
    const past = times.filter(this.isPast)
    const future = times.filter(time => this.isFuture(time, past))
    return { past, future }
  }

  additionalTimes(pastFutureTimes: IPastAndFutureTimes) {
    const future = pastFutureTimes.future
    const past = pastFutureTimes.past
    const addTimes = this.addition(future, past)
    return future.length < constants.TIMESLOTSTODISPLAY ? addTimes : []
  }

  addition(future: number[], past: number[]) {
    const additional = []
    const remaining = constants.TIMESLOTSTODISPLAY - future.length

    for (let i = remaining; i > -1; i--) {
      const endIdx = past.length - 1
      const idx = endIdx - i
      additional.push(past[idx])
    }
    return additional
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
    const formatted = this.config.currency_position === constants.PREFIX
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

  badge(sku: ICampaignCalendar) {
    const badgeId = this.id(sku.type, "_")
    const iconKey = this.key(`${badgeId}_icon`, this.config)
    const typeKey = this.key(sku.type, this.config)
    const badgeIcon = this.config[iconKey]

    const badgeText = sku.type === "Generic" ? "Limited Stock" : sku.type
    const badge = badgeIcon
    ? `<img class="lazy-image" data-src="${badgeIcon}" alt="sku_img"/>`
    : badgeText
    
    return badgeIcon
    ? `<div class="-tag -inlineblock -vamiddle -b-img -${this.id(sku.type, '-')}"><span class="-posabs -preloader -loading"></span>${badge}</div>`
    : `<div class="-tag -inlineblock -vamiddle -${this.id(sku.type, '-')}" style="background-color:${this.config[typeKey]}">${badge}</div>`
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

    const mBannerKey = this.key(mBannerStr, this.config)
    const dBannerKey = this.key(dBannerStr, this.config)
    const deeplinkKey = this.key(deeplinkStr, this.config)

    const mBanner = this.config[mBannerKey]
    const dBanner = this.config[dBannerKey]
    const deeplink = this.config[deeplinkKey]

    const banner = isMobile ? mBanner : dBanner
    const lvlink = isMobile ? deeplink : (`${this.domain.host}/${this.config.download_apps_page}`)
    
    return { banner, live_link: lvlink }
  }
}