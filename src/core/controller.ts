import { Api } from "./api";
import { constants } from "./constants";
import { iAbout, iCategory, iDynamicObject, iNames, iRemoteData, iSKU, iSuperblock } from "./types/index";
import { Util } from "./util";

export class Controller extends Util {
  private tandcs: iAbout[]
  private tandcsEl: HTMLElement
  private hiwCTA: HTMLElement
  private topBanner: HTMLElement
  private mainEl: HTMLElement
  private categories: iCategory[]
  private productMap?: iSKU[]
  private flipper: HTMLElement
  private switchBtn: HTMLElement
  private selection: HTMLElement
  private api: Api

  constructor(remoteData: iRemoteData, fbox: any) {
    super(remoteData, fbox)

    this.api = new Api(remoteData, fbox)
    this.tandcs = remoteData.about as iAbout[]
    this.categories = remoteData.categories as iCategory[]
    this.productMap = []

    this.tandcsEl = this.el(constants.TANDCSQUERY)
    this.hiwCTA = this.el(constants.HOWITWORKSQUERY)
    this.topBanner = this.el(constants.TOPBANNERQUERY)
    this.mainEl = this.el(constants.MAINELQUERY)
    this.flipper = this.el(constants.FLIPPERQUERY)
    this.switchBtn = this.el(constants.SWITCHQUERY)
    this.selection = this.el(constants.SELECTIONQUERY)

    this.hiwCTA.addEventListener(constants.CLICK, this.toggleBanner.bind(this))

    this.fbox.pubsub.subscribe(constants.RESET, this.init.bind(this))

    this.init()
      .setBanner()
      .displayTAndCs()
      .show()
      .listeners()
  }

  init() {
    console.log("this.categories", this.categories)
    // const randomized = [...this.categories].sort(() => Math.random() - 0.5)
    // this.mainEl.innerHTML = randomized.map(this.buildSuperblock.bind(this)).join("")
    this.mainEl.innerHTML = this.buildSuperblock(this.categories)
    this.flipper = this.el(constants.FLIPPERQUERY)
    this.switchBtn = this.el(constants.SWITCHQUERY)

    this.switchBtn.addEventListener('click', () => {
      this.flipper.scrollTop = 0
      this.flipper.scrollLeft = 0
      this.flipper.classList.toggle("-switch")
    })

    return this
  }

  async retrieve () {
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
        break;
      case constants.COMPARE:
        this.updateSelection(target)
        break;
      default:
        break;
    }

  }

  updateSelection(target: HTMLElement) {
    const selection = this.selectionObject(target)
    const html = this.selectionHtml(selection)

    const back = this.el(".-back", this.selection)
    back.innerHTML = html

    this.show()
    
    const sfxn = this.selection.classList
    const fFxn = this.flipper.classList

    !sfxn.contains("-switch") && sfxn.add("-switch")
    !fFxn.contains("-switch") && fFxn.add("-switch")

    const url = this.catalog + selection.singularName
    this.api.products(url)
    .then(data => console.log("data is", data))
  }

  selectionObject(target: HTMLElement) {
    const singularName = (target.getAttribute("data-singular-name") as string).toLowerCase()
    const sku = target.getAttribute("data-sku")
    const skuObj = this.productMap?.find((product: iSKU) => product.sku === sku) as iSKU
    const names: iNames = { displayName: skuObj.displayName, singularName }
    skuObj.properties = this.productProperties(names)
    skuObj.singularName = singularName
    return skuObj
  }

  selectionHtml (selection: iSKU) {

    const btnHtml = selection.properties?.map(this.btnHtml.bind(this)).join("")
    
    return `<div class="-sku -posrel" data-sku="${selection.sku}"><a href="${selection.url}" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image" data-src="${selection.image}" alt="sku_img"></a><div class="-details"><div class="-detail-props"><div class="-name">${selection.displayName}</div><div class="-prices"><div class="-price -new">${selection.prices.price}</div><div class="-price -old">${selection.prices.oldPrice}</div><div class="-discount">${selection.prices.discount}</div></div></div><div class="-btns">${btnHtml}</div></div></div>`
  }

  btnHtml(name: string) {
    return `<div class="-btn -cta -posrel"><div class="-btn-clickable -posabs" data-name="${name}" data-type="selection-btn"></div><div class="-txt">${name}</div></div>`
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

  buildSuperblock(categories: iCategory[]) {
    let superblockHtml = `<div class="-superblock" data-name="bestsellers">`
    const title = `<div class="-title"><span>bestsellers</span><button class="-switcher">switch</button></div>`
    const freelinks = this.buildFreelinks(categories)
    const productFloor = this.buildProductFloor(categories[0])

    superblockHtml += title
    superblockHtml += freelinks
    superblockHtml += productFloor
    superblockHtml += '</div>'
    
    return superblockHtml
  }

  updateProductFloor(category: string) {
    const productFloor = this.el(".-productfloor")
    const productFloorTitle = this.el(".-productfloor .-title")
    const productFloorSeeAll = this.el(".-see-all-clickable")

    const catObj = this.categories.find(cat => cat.plural_name === category)

    productFloorTitle.innerHTML = `<div class="-title-name">${category}</div><div class="-title-desc">${this.formatPrice(catObj?.price_point as string)}</div>`
    
    productFloorSeeAll.setAttribute("data-href", catObj?.url as string)

    const actual = this.el(".-skus.-actual", productFloor)

    const skus = catObj?.skus.slice(0,16).map((sku: iSKU) => this.skuHtml(sku, catObj)).join("")
    this.productMap = catObj?.skus

    actual.innerHTML = `<div class="-product-scrollable">${skus}</div>`
    this.show()
  }

  buildFreelinks(categories: iCategory[]) {
    let catHtml = '<div class="-cats -posrel -single -flipper">'
    const freelinks = categories.map(category => this.catHtml(category))
    .join("")
    catHtml += categories.length > 0 ? `<div class="-scrollable -front">${freelinks}</div><div class="-back"><div class="-sku -posrel -available" data-sku="FL585EA0I41P9NAFAMZ"><a href="https://www.jumia.com.ng/floveme-power-banks-20000-mah-utra-slim-portable-fast-charger-71912403.html" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image loaded" data-src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054" alt="sku_img" src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054"></a><div class="-details"><div class="-name">Floveme Power Banks 20000 MAh Utra Slim Portable Fast Charger</div><div class="-prices"><div class="-price -new">₦ 8,690</div><div class="-price -old">₦ 15,686</div><div class="-discount">-45%</div></div></div></div><div class="-sku -posrel -available" data-sku="FL585EA0I41P9NAFAMZ"><a href="https://www.jumia.com.ng/floveme-power-banks-20000-mah-utra-slim-portable-fast-charger-71912403.html" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image loaded" data-src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054" alt="sku_img" src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054"></a><div class="-details"><div class="-name">Floveme Power Banks 20000 MAh Utra Slim Portable Fast Charger</div><div class="-prices"><div class="-price -new">₦ 8,690</div><div class="-price -old">₦ 15,686</div><div class="-discount">-45%</div></div></div></div><div class="-sku -posrel -available" data-sku="FL585EA0I41P9NAFAMZ"><a href="https://www.jumia.com.ng/floveme-power-banks-20000-mah-utra-slim-portable-fast-charger-71912403.html" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image loaded" data-src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054" alt="sku_img" src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/30/421917/1.jpg?6054"></a><div class="-details"><div class="-name">Floveme Power Banks 20000 MAh Utra Slim Portable Fast Charger</div><div class="-prices"><div class="-price -new">₦ 8,690</div><div class="-price -old">₦ 15,686</div><div class="-discount">-45%</div></div></div></div></div>` : ""
    catHtml += '</div>'
    return catHtml
  }

  catHtml(category: iCategory) {
    return `<div class="-cat -posrel" data-category="${category.plural_name}" data-url="${category.url}" ><span class="-posabs -preloader -loading"></span><div class="-clickable -posabs" data-type="category" data-category="${category.plural_name}"></div><span class="-posabs -preloader -loading" data-type="category"></span><img class="lazy-image" data-src="${category.image}" alt="${category.plural_name}" /><div class="-posabs -name"><div class="-txt -posabs -name-el">${category.plural_name}</div><div class="-bg -posabs -name-el"></div></div><div class="-price-point">${this.formatPrice(category.price_point)}</div></div>`
  }

  buildProductFloor(category: iCategory) {
    const prevNextButtons = this.isMobile ? '' : '<div class="-control -prev -posabs" data-dir="prev" data-type="dir-btn"><span class="-posabs -preloader -loading"></span></div><div class="-control -next -posabs"  data-type="dir-btn" data-dir="next"><span class="-posabs -preloader -loading"></span></div>'

    let html = `<div class="-productfloor active -posrel" data-name="${category.plural_name}">${prevNextButtons}`

    html += `<div class="-head"><div class="-title"><div class="-title-name">${category.plural_name}</div><div class="-title-desc">top deals</div></div><div class="-see-all"><span class="-see-all-clickable"  data-href="${category.url}" data-type="see all"></span><span class="-txt">See all</span><span class="-arrow" style="border: 2px solid black"></span></div></div>`

    const skus = category.skus.slice(0,16).map((sku: iSKU) => this.skuHtml(sku, category)).join("")
    this.productMap = category.skus

    html += `<div class="-skus -actual"><div class="-product-scrollable">${skus}</div></div>`

    html += "</div>"
    return html
  }

  skuHtml(skuObj: iSKU, category: iCategory) {
    const {
      sku, displayName,
      url, prices: { price, discount },
      image
    } = skuObj
    const discountHtml = discount ? `<div class="-discount -posabs">${discount}</div>` : ""

    return `
    <div data-sku="${sku}" class="-posrel -sku"><a href="${url}" class="-img -posrel"><span class="-posabs -preloader -loading"></span><img class="lazy-image" data-src="${image}" alt="${displayName}" /></a>${discountHtml} <div class="-details"><div class="-name">${displayName}</div><div class="-newPrice">${price}</div><div class="-atc-compare"><a href="${url}" class="-cta -atc">Add to cart</a><a href="#initiative" class="-cta -compare" data-sku="${sku}" data-singular-name="${category.singular_name}" data-type="compare">Compare</a></div></div></div>
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