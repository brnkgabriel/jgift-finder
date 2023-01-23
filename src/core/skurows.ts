import { constants } from "./constants";
import { IRemoteData } from "./interfaces/config";
import { ICampaignCalendar } from "./interfaces/data";
import { IBuild, IGroup } from "./interfaces/others";
import { Util } from "./util";

export class SKURows extends Util {
  private skusEl;
  private createSKUs;
  private skuHTML;
  private row;
  private rows;

  constructor(remoteData: IRemoteData, fbox: any) {
    super(remoteData, fbox)

    this.skusEl = this.el(constants.SKUSELQUERY)
    this.createSKUs = (skus: ICampaignCalendar[]) => skus.map(this.skuHTML.bind(this)).join("")
    this.skuHTML = (sku: ICampaignCalendar) => this.html(sku)
    this.row = (time: number) => this.el(`${constants.SKUROWQUERY}[data-time="${time}"]`)
    this.rows = () => this.all(constants.SKUROWQUERY)

    fbox.pubsub.subscribe(constants.FOCUS, this.handleFocus.bind(this))
    fbox.pubsub.subscribe(constants.BUILD, this.handleDisplay.bind(this))
  }

  reset() {
    this.skusEl.innerHTML = ""
  }

  handleFocus(time: number) {
    const skuRows = this.rows()
    const currentRow = this.row(time)
    this.toggle(skuRows, currentRow, constants.ACTIVECLASS)
  }

  handleDisplay(data: IBuild) {
    this.reset()
    this.skusEl.innerHTML = data.groupedSKUs
    .map((skus, idx) => this.rowHTML(skus, idx)).join("")

    // first row
    const firstTime = this.all(constants.SKUROWQUERY)[0]
    .getAttribute(constants.DATATIME)

    this.handleFocus(Number(firstTime))

    this.fbox.pubsub.emit(constants.FOCUS, firstTime)
    this.show()
  }

  rowHTML(group: IGroup, idx: number) {
    const skusHTML = this.createSKUs(group.skus)
    return this.createRow(group, idx, skusHTML)
  }

  createRow(group: IGroup, idx: number, skusHTML: string) {

    const rowClass = idx === 0
    ? `${constants.SKUROWCLASS} active`
    : constants.SKUROWCLASS

    return `<div class="${rowClass}" data-time="${group.time}">${skusHTML}</div>`
  }

  html(sku: ICampaignCalendar) {
    const oldPrice = this.price(sku.barred_price)
    const newPrice = this.price(sku.price)
    const discount = this.discount(sku.barred_price, sku.price)
    const idName = sku.name + "-" + (+new Date())

    return `<a href="${sku.pdp}" target="_blank" class="-sku -posrel -${sku.status}" id="${this.id(idName,  '-')}"><div class="-img -posrel"><span class="-posabs -preloader -loading"></span><div class="-posabs -shadow"><span class="-posabs">sold out</span></div><img class="lazy-image loaded" data-src="${sku.image}" alt="sku_img"/></div><div class="-details -posabs"><div class="-name">${sku.name}</div><div class="-prices"><div class="-price -new">${newPrice}</div><div class="-price -old">${oldPrice}</div><div class="-discount">${discount}</div></div></div><div class="-cta -posabs">add to cart</div><div class="-tags -posabs">${this.badge(sku)}</div></a>`
  }
}