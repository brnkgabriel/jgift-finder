import { Api } from "./api";
import { constants } from "./constants";
import { iAbout, iCategory, iDynamicObject, iNames, iProductFloorOptions, iRemoteData, iSKU, iSuperblock } from "./types/index";
import { Util } from "./util";

export class Controller extends Util {
  private tandcs: iAbout[]
  private tandcsEl: HTMLElement
  private hiwCTA: HTMLElement
  private topBanner: HTMLElement
  private mainEl: HTMLElement
  private categories: iCategory[]
  private productMap?: iSKU[]
  private filters: string[]
  private flipper: HTMLElement
  private flipperBack: HTMLElement
  private superblockTitle: HTMLElement
  private switchBtn: HTMLElement
  private selection: HTMLElement
  private searchInput: HTMLInputElement
  private api: Api

  constructor(remoteData: iRemoteData, fbox: any) {
    super(remoteData, fbox)

    this.api = new Api(remoteData, fbox)
    this.tandcs = remoteData.about as iAbout[]
    this.categories = remoteData.categories as iCategory[]
    this.productMap = []
    this.filters = []

    this.tandcsEl = this.el(constants.TANDCSQUERY)
    this.hiwCTA = this.el(constants.HOWITWORKSQUERY)
    this.topBanner = this.el(constants.TOPBANNERQUERY)
    this.mainEl = this.el(constants.MAINELQUERY)
    this.flipper = this.el(constants.FLIPPERQUERY)
    this.flipperBack = this.el(constants.FLIPPERBACKQUERY)
    this.switchBtn = this.el(constants.SWITCHQUERY)
    this.selection = this.el(constants.SELECTIONQUERY)
    this.superblockTitle = this.el(constants.SUPERBLOCKTITLEQUERY)
    this.searchInput = this.el(constants.SEARCHINPUTQUERY) as HTMLInputElement

    this.hiwCTA.addEventListener(constants.CLICK, this.toggleBanner.bind(this))

    this.fbox.pubsub.subscribe(constants.RESET, this.init.bind(this))

    this.init()
      .setBanner()
      .displayTAndCs()
      .show()
      .listeners()
  }

  init() {
    const randomized = this.randomize(this.categories)
    this.mainEl.innerHTML = this.buildSuperblock(randomized)
    this.flipper = this.el(constants.FLIPPERQUERY)
    this.flipperBack = this.el(constants.FLIPPERBACKQUERY)
    this.switchBtn = this.el(constants.SWITCHQUERY)
    this.superblockTitle = this.el(constants.SUPERBLOCKTITLEQUERY)
    this.searchInput = this.el(constants.SEARCHINPUTQUERY) as HTMLInputElement

    this.switchBtn.addEventListener('click', () => {
      [this.selection, this.flipper].forEach((el: HTMLElement) => el.classList.toggle("-switch"))
      this.positionAndUpdateAfterFlip()
    })

    return this
  }

  positionAndUpdateAfterFlip(str?: string) {
    const showingSimilarProducts = this.flipper.classList.contains("-switch")
    this.superblockTitle.innerHTML = showingSimilarProducts ? `More ${str ?? ""}` : "Categories"
    this.flipper.scrollTop = 0
    this.flipper.scrollLeft = 0
  }

  listeners() {
    this.mainEl.addEventListener("click", this.handleClick.bind(this))
    this.topBanner.addEventListener("click", this.handleClick.bind(this))
  }

  handleClick(evt: Event) {
    const target: HTMLElement = evt.target as HTMLElement

    const type = target.getAttribute("data-type")

    switch (type) {
      case constants.CATTYPE:
        this.categoryBtnUpdate(target)
        break;
      case constants.DIRBTN:
        const direction = target.getAttribute("data-dir")
        const productfloor = target.parentElement
        const scrollale = this.el(".-product-scrollable", productfloor as HTMLElement).parentElement
        direction === constants.NEXT
          ? this.scrollTonext(scrollale as HTMLElement)
          : this.scrollToprev(scrollale as HTMLElement)
        break;
      case constants.COMPARE:
        this.updateSelection(target)
        break;
      case constants.SELECTIONBTN:
        this.btnFilterUpdate(target)
        break;
      case constants.SEARCHBTN:
        this.searchBtnFilterUpdate(target)
        break;
      default:
        break;
    }

  }

  categoryBtnUpdate(target: HTMLElement) {
    this.searchInput.value = ""
    const category = target.getAttribute("data-category")
    this.updateProductFloor(category as string)
  }

  btnFilterUpdate(target: HTMLElement) {
    const propName = target.getAttribute("data-name")
    const btn = target.parentElement
    btn?.classList.toggle("active")

    if (btn?.classList.contains("active")) {
      this.filters.unshift(propName as string)
    } else {
      let str = this.filters.join("-")
      str = str.replace(propName as string, "")
      const pieces = str.split("-").filter((word: string) => word !== "")
      this.filters = pieces
    }

    this.apiRequest()
  }

  searchBtnFilterUpdate(target: HTMLElement) {
    const parent = target.parentElement
    const searchValue = this.searchInput.value
    if (searchValue.length > 0) {
      this.updateFilters(searchValue)
      const catObj: iCategory = {
        approved: "true",
        image: "",
        plural_name: this.pluralize(searchValue),
        price_point: "top deals",
        singular_name: searchValue,
        sku_count: "0",
        skus: [],
        url: ""
      }

      parent?.classList.add(constants.SEARCHING)
      this.apiCall()
        .then((data: iSKU[]) => {
          parent?.classList.remove(constants.SEARCHING)
          this.productMap = data
          this.productFloorUiUpdate({
            catObj,
            desc: "top deals",
            name: searchValue,
            skus: data
          })
        }).catch(err => parent?.classList.remove(constants.SEARCHING))

    }
  }

  updateSelection(target: HTMLElement) {
    const selection = this.selectionObject(target)

    this.updateFilters(selection.singularName as string)
    this.updateSelectionUi(selection)
    this.flipAndPopulateSimilarProducts(selection)
  }

  updateFilters(name: string) {
    this.filters = [name]
  }

  updateSelectionUi(selection: iSKU) {
    const html = this.selectionHtml(selection)
    const back = this.el(".-back", this.selection)
    back.innerHTML = html
    this.show()
  }

  flipAndPopulateSimilarProducts(selection: iSKU) {
    this.flipSimilarProducts(selection)
    this.apiRequest()
  }

  apiRequest() {
    this.flipperBack.innerHTML = this.spinLoader()
    this.apiCall()
      .then(this.populateSimilarProducts.bind(this))
  }

  apiCall() {
    const url = this.catalog + this.filters.join("+")
    return this.api.products(url)
  }

  flipSimilarProducts(selection: iSKU) {
    const sfxn = this.selection.classList
    const fFxn = this.flipper.classList

    !sfxn.contains("-switch") && sfxn.add("-switch")
    !fFxn.contains("-switch") && fFxn.add("-switch")

    this.positionAndUpdateAfterFlip(selection.pluralName)
  }

  populateSimilarProducts(data: iSKU[]) {
    console.log("data", data)
    this.flipperBack.innerHTML = data.map(this.skuHtmlHorizontal.bind(this)).join("")
    this.show()
  }

  selectionObject(target: HTMLElement) {
    const singularName = (target.getAttribute("data-singular-name") as string).toLowerCase()
    const pluralName = (target.getAttribute("data-plural-name") as string).toLowerCase()
    const sku = target.getAttribute("data-sku")
    const skuObj = this.productMap?.find((product: iSKU) => product.sku === sku) as iSKU
    const names: iNames = { displayName: skuObj.displayName, singularName }
    skuObj.properties = this.productProperties(names)
    skuObj.singularName = singularName
    skuObj.pluralName = pluralName
    return skuObj
  }

  oldPriceAndDiscount(selection: iSKU) {
    return `<div class="-price -old">${selection.prices.oldPrice}</div><div class="-discount">${selection.prices.discount}</div>`
  }

  selectionHtml(selection: iSKU) {

    const btnHtml = selection.properties?.map(this.btnHtml.bind(this)).join("")

    const oldPriceAndDiscount = selection.prices.oldPrice ? this.oldPriceAndDiscount(selection) : ""

    return `<div class="-sku -posrel" data-sku="${selection.sku}"><a href="${selection.url}" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image" data-src="${selection.image}" alt="sku_img"></a><div class="-details"><div class="-detail-props"><div class="-name">${selection.displayName}</div><div class="-prices"><div class="-price -new">${selection.prices.price}</div>${oldPriceAndDiscount} </div></div><div class="-btns">${btnHtml}</div></div></div>`
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
    let superblockHtml = `<div class="-superblock" data-name="selection">`
    const title = `<div class="-title"><span class="-similar-products">Categories</span><button class="-switcher -cta">switch</button></div>`
    const freelinks = this.buildFreelinks(categories)
    const productFloor = this.buildProductFloor(categories[0])

    superblockHtml += title
    superblockHtml += freelinks
    superblockHtml += productFloor
    superblockHtml += '</div>'

    return superblockHtml
  }

  updateProductFloor(category: string) {
    const catObj = this.categories.find(cat => cat.plural_name === category)
    const skus = catObj?.skus
    this.productMap = catObj?.skus

    this.productFloorUiUpdate({
      catObj: catObj as iCategory,
      desc: this.formatPrice(catObj?.price_point as string),
      name: category,
      skus: skus as iSKU[]
    })
  }

  productFloorUiUpdate(options: iProductFloorOptions) {
    const { name, desc, catObj, skus } = options
    const productFloor = this.el(".-productfloor")
    const productFloorTitle = this.el(".-productfloor .-title")
    productFloorTitle.innerHTML = `<div class="-title-name">${name}</div><div class="-title-desc">${desc}</div>`
    const actual = this.el(".-skus.-actual", productFloor)
    const skusHtml = skus?.map((sku: iSKU) => this.skuHtml(sku, catObj as iCategory)).join("")
    actual.innerHTML = `<div class="-product-scrollable">${skusHtml}</div>`
    this.show()
  }

  spinLoader() {
    return '<div aria-label="spinloader" class="spin-loader"></div>'
  }

  buildFreelinks(categories: iCategory[]) {
    let catHtml = '<div class="-cats -posrel -single -flipper">'
    const freelinks = categories.map(category => this.catHtml(category))
      .join("")
    catHtml += categories.length > 0 ? `<div class="-scrollable -front">${freelinks}</div><div class="-back"></div>` : ""
    catHtml += '</div>'
    return catHtml
  }

  catHtml(category: iCategory) {
    return `<div class="-cat -posrel" data-category="${category.plural_name}" data-url="${category.url}" ><span class="-posabs -preloader -loading"></span><div class="-clickable -posabs" data-type="category" data-category="${category.plural_name}"></div><span class="-posabs -preloader -loading" data-type="category"></span><img class="lazy-image" data-src="${category.image}" alt="${category.plural_name}" /><div class="-posabs -name"><div class="-txt -posabs -name-el">${category.plural_name}</div><div class="-bg -posabs -name-el"></div></div><div class="-price-point">${this.formatPrice(category.price_point)}</div></div>`
  }

  buildProductFloor(category: iCategory) {
    const prevNextButtons = this.isMobile ? '' : '<div class="-control -prev -posabs" data-dir="prev" data-type="dir-btn"><span class="-posabs -preloader -loading"></span></div><div class="-control -next -posabs"  data-type="dir-btn" data-dir="next"><span class="-posabs -preloader -loading"></span></div>'

    let html = `<div class="-productfloor active -posrel" data-name="${category.plural_name}">${prevNextButtons}`

    html += `<div class="-head"><div class="-title"><div class="-title-name">${category.plural_name}</div><div class="-title-desc">top deals</div></div><div class="-search-form -posrel"><input type="text" class="-search-input" placeholder="Search for products" /><div class="-cta -search-btn -posabs"><div class="-search-btn-clickable -posabs" data-type="search-btn"></div><div class="search-icon"></div>${this.spinLoader()}</div></div></div>`

    const skus = category.skus.map((sku: iSKU) => this.skuHtml(sku, category)).join("")
    this.productMap = category.skus

    html += `<div class="-skus -actual"><div class="-product-scrollable">${skus}</div></div>`

    html += "</div>"
    return html
  }

  skuHtmlHorizontal(sku: iSKU) {

    const express = sku.isShopExpress ? '<div class="-express -list -posrel"><express></express></div>' : ''
    const officialStore = sku.badges?.main ? '<span class="-badge -main -official-store">Official Store</span>' : ''

    const rating = sku.rating ? `<div class="-product_rating"><div class="-stars -radio-el -posrel -inlineblock -vamiddle"><div class="-in" style="width:${this.rating(sku.rating.average)}"></div></div><div class="-count -inlineblock -vabaseline -posrel"><div class="-rt">(${sku.rating.totalRatings})</div></div></div>` : ''

    const oldPriceAndDiscount = sku.prices.oldPrice ? this.oldPriceAndDiscount(sku) : ""

    return `<div class="-sku -posrel -available" data-sku="${sku.sku}"><a href="${sku.url}" target="_blank" class="-img -posrel"><span class="-posabs -preloader -hide"></span><img class="lazy-image loaded" data-src="${sku.image}" alt="sku_img" /></a><div class="-details"><div class="-name">${sku.displayName}</div><div class="-features">${express} ${officialStore} ${rating} </div><div class="-prices"><div class="-price -new">${sku.prices.price}</div>${oldPriceAndDiscount} </div></div><a href="${sku.url}" target="_blank" class="-cta -buy -posabs">buy</a></div>`
  }

  skuHtml(skuObj: iSKU, category: iCategory) {
    const {
      sku, displayName,
      url, prices: { price, discount },
      image
    } = skuObj
    const discountHtml = discount ? `<div class="-discount">${discount}</div>` : ""

    return `
    <div data-sku="${sku}" class="-posrel -sku"><div class="-atc-compare"><a href="#initiative" class="-cta -compare" data-sku="${sku}" data-singular-name="${category.singular_name}" data-plural-name="${category.plural_name}" data-type="compare">Compare</a></div><a href="${url}" class="-img -posrel"><span class="-posabs -preloader -loading"></span><img class="lazy-image" data-src="${image}" alt="${displayName}" /></a><div class="-details"><div class="-name">${displayName}</div><div class="-prices"><div class="-newPrice">${price}</div>${discountHtml} </div><div class="-atc-compare"><a href="${url}" class="-cta -atc">Add to cart</a></div></div></div>
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