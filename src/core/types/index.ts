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
}

export interface iCategory {
  approved: string;
  image: string;
  name: string;
  price_point: string;
  sku_count: string;
  skus: iSKU[]
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
}

export interface iDocument {
  backgroundColor: string;
  categories: iCategory[];
  id: string;
  name: string;
  skus: iSKU[]
}