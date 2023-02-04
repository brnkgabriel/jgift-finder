export interface iAbout {
  answer: string;
  num: string;
  question: string;
}

export interface iConfig {
  countryLocale: string;
  desktopBanner: string;
  mobileAppBanner: string;
  mlp: string;
  currency: string;
  domain: string;
  currencyPosition: string;
}

export interface iCategory {
  approved: string;
  image: string;
  singular_name: string;
  plural_name: string;
  price_point: string;
  sku_count: string;
  skus: iSKU[],
  url: string;
}

export interface iPrice {
  discount?: string;
  oldPrice?: string;
  oldPriceEuro?: string;
  price?: string;
  priceEuro?: string;
  rawPrice?: string;
  taxEuro?: string;
}

export interface iSKU {
  displayName: string;
  image: string;
  prices: iPrice;
  sku: string;
  url: string;
  properties?: string[]
}

export interface iSuperblock {
  darkShade: string;
  lightShade: string;
  categories: iCategory[];
  id: string;
  name: string;
  url: string;
  skus: iSKU[]
}

export interface iDynamicObject {
  [key: string]: any;
}

export interface iRemoteData {
  about?: iAbout[];
  config?: iConfig;
  categories?: iCategory[]
}

export interface iCatMap {
  category: iCategory
}

export interface iNames {
  displayName: string;
  singularName: string;
}