import { constants } from "./constants";
import { IRemoteData } from "./interfaces/config";
import { ICampaignCalendar } from "./interfaces/data";
import { iAbout, iCategory, iDynamicObject, iRemoteData, iSKU, iSuperblock } from "./types/index";
import { Util } from "./util";

export class Controller extends Util {
  private tandcs: iAbout[]
  private tandcsEl: HTMLElement
  private hiwCTA: HTMLElement
  private topBanner: HTMLElement
  private mainEl: HTMLElement
  private superblocks: iSuperblock[]
  private superblockMap?: iSuperblock

  constructor(remoteData: iRemoteData, fbox: any) {
    super(remoteData, fbox)

    this.tandcs = remoteData.about as iAbout[]
    this.superblocks = remoteData.superblocks as iSuperblock[]
    this.superblockMap = undefined

    this.tandcsEl = this.el(constants.TANDCSQUERY)
    this.hiwCTA = this.el(constants.HOWITWORKSQUERY)
    this.topBanner = this.el(constants.TOPBANNERQUERY)
    this.mainEl = this.el(constants.MAINELQUERY)

    this.hiwCTA.addEventListener(constants.CLICK, this.toggleBanner.bind(this))

    this.fbox.pubsub.subscribe(constants.RESET, this.init.bind(this))

    this.init()
      .setBanner()
      .displayTAndCs()
      .show()
      .listeners()
  }

  init() {
    const randomized = [...this.superblocks].sort(() => Math.random() - 0.5)
    this.mainEl.innerHTML = randomized.map(this.buildSuperblock.bind(this)).join("")
    return this
  }

  listeners() {
    this.mainEl.addEventListener("click", this.handleClick.bind(this))
  }

  handleClick(evt: Event) {
    const target: HTMLElement = evt.target as HTMLElement

    const type = target.getAttribute("data-type")

    switch (type) {
      case constants.CATTYPE:
        const category = target.getAttribute("data-category")
        const superblock = target.getAttribute("data-superblock")
        this.superblockMap = this.superblocks.find(sb => sb.name === superblock) as iSuperblock
        this.updateProductFloor(category as string)
        break;
      case constants.DIRBTN:
        const direction = target.getAttribute("data-dir")
        const productfloor = target.parentElement
        const scrollale = this.el(".-product-scrollable", productfloor as HTMLElement).parentElement
        console.log("scrollable", scrollale, "direction", direction)
        direction === constants.NEXT
        ? this.scrollTonext(scrollale as HTMLElement)
        : this.scrollToprev(scrollale as HTMLElement)
        break;
      case constants.SEEALL:
        const url = target.getAttribute("data-href")
        location.href = url as string
      default:
        break;
    }

  }
  
  scrollTonext(scrollable: HTMLElement) {
    var start = scrollable.scrollLeft + 80, end = scrollable.scrollLeft + 300
    var delta = end - start;
    scrollable.scrollLeft = start + delta * 1;
  }

  scrollToprev(scrollable: HTMLElement) {
    var start = scrollable.scrollLeft - 80, end = scrollable.scrollLeft - 300
    var delta = end - start;
    scrollable.scrollLeft = start + delta * 1;
  } 

  buildSuperblock(superblock: iSuperblock) {
    let superblockHtml = `<div class="-superblock" data-name="${superblock.name}">`
    const title = `<div class="-title" style="background-color: ${superblock.lightShade};">${superblock.name}</div>`
    const freelinks = this.buildFreelinks(superblock.categories, superblock)
    const productFloor = this.buildProductFloor(superblock)

    superblockHtml += superblock.categories.length >= 1 ? title : ""
    superblockHtml += freelinks
    superblockHtml += productFloor
    superblockHtml += '</div>'
    
    return superblock.skus.length >= 7 ? superblockHtml : ""
  }

  updateProductFloor(category: string) {
    const superblockEl = this.el(`.-superblock[data-name="${this.superblockMap?.name}"]`)
    const productFloor = this.el(".-productfloor", superblockEl)
    const productFloorTitle = this.el(".-productfloor .-title", superblockEl)
    const productFloorSeeAll = this.el(".-see-all-clickable", superblockEl)

    const catObj = this.superblockMap?.categories.find(cat => cat.name === category)

    productFloorTitle.innerHTML = `<div class="-title-name">${category}</div><div class="-title-desc">${catObj?.price_point}</div>`
    
    productFloorSeeAll.setAttribute("data-href", catObj?.url as string)

    const actual = this.el(".-skus.-actual", productFloor)

    actual.innerHTML = `<div class="-product-scrollable">${catObj?.skus.slice(0,16).map(this.skuHtml.bind(this)).join("")}</div>`
    this.show()
  }

  buildFreelinks(categories: iCategory[], superblock: iSuperblock) {
    let catHtml = '<div class="-cats -posrel -single">'
    const freelinks = categories.map(category => this.catHtml(category, superblock))
    .join("")
    catHtml += categories.length > 0 ? `<div class="-scrollable">${freelinks}</div>` : ""
    catHtml += '</div>'
    return catHtml
  }

  catHtml(category: iCategory, superblock: iSuperblock) {
    this.superblockMap = superblock
    return `<div class="-cat -posrel" data-category="${category.name}" data-url="${category.url}" style="background-color: ${superblock.lightShade}"><span class="-posabs -preloader -loading"></span><div class="-clickable -posabs" data-type="category" data-superblock="${superblock.name}"  data-category="${category.name}"></div><span class="-posabs -preloader -loading" data-type="category"></span><img class="lazy-image" data-src="${category.image}" alt="${category.name}" /><div class="-posabs -name"><div class="-txt -posabs -name-el">${category.name}</div><div class="-bg -posabs -name-el" style="background-color:${superblock.darkShade}dd;color:white"></div></div><div class="-price-point">${this.formatPrice(category.price_point)}</div></div>`
  }

  buildProductFloor(superblock: iSuperblock) {
    const prevNextButtons = this.isMobile ? '' : '<div class="-control -prev -posabs" data-dir="prev" data-type="dir-btn"><span class="-posabs -preloader -loading"></span></div><div class="-control -next -posabs"  data-type="dir-btn" data-dir="next"><span class="-posabs -preloader -loading"></span></div>'

    let html = `<div class="-productfloor active -posrel" data-name="${superblock.name}">${prevNextButtons}`

    html += `<div class="-head" style="background-color:${superblock.lightShade}"><div class="-title"><div class="-title-name">${superblock.name}</div><div class="-title-desc">top deals</div></div><div class="-see-all"><span class="-see-all-clickable"  data-href="${superblock.url}" data-type="see all"></span><span class="-txt">See all</span><span class="-arrow" style="border: 2px solid black"></span></div></div>`

    html += `<div class="-skus -actual"><div class="-product-scrollable">${superblock.skus.slice(0,16).map(this.skuHtml.bind(this)).join("")}</div></div>`

    html += "</div>"
    return html
  }

  skuHtml(skuObj: iSKU) {
    const {
      sku, displayName,
      url, prices: { oldPrice, price, discount },
      image
    } = skuObj
    const discountHtml = discount ? `<div class="-discount -posabs">${discount}</div>` : ""
    const oldPriceHtml = discount ? `<div class="-oldPrice">${oldPrice}</div>` : ""

    return `
    <a href="${url}" data-sku="${sku}" class="-posrel -sku"><div class="-img -posrel"><span class="-posabs -preloader -loading"></span><img class="lazy-image" data-src="${image}" alt="${displayName}"/></div>${discountHtml} <div class="-details"><div class="-name">${displayName}</div><div class="-newPrice">${price}</div>${oldPriceHtml}</div></a>
    `
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

  tandcHTML(tandc: iAbout) {
    return `<div class="-rule_element"><div class="-vatop -num">${tandc.num}</div><div class="-vatop -desc"><div class="-question">${tandc.question}</div><div class="-answer">${tandc.answer}</div></div></div>`
  }
}