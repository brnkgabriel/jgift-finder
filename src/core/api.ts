import { iRemoteData } from "./types/index";
import { Util } from "./util";

export class Api extends Util{
  constructor(remoteData: iRemoteData, fbox: any) {
    super(remoteData, fbox)
  }

  
  mobile(raw_products: string) {
    var start = raw_products.indexOf('"products":')
    var products = '{' + raw_products.substring(start, raw_products.length)
    var l_idx = products.indexOf(',"head"')
    return products.substring(0, l_idx - 1) + '}'
  }

  async products(url: string) {
    const response = await fetch(url)
    const text = await response.text()
    // const startIdx = text.indexOf('"products":[{')
    // const productsStr = '{' + text.substring(startIdx, text.length)
    // const closingBraces = this.braceIndices(productsStr, this.escapeStr("}]"))
    // const endIdx = closingBraces[closingBraces.length - 1]
    // const products = productsStr.substring(0, endIdx + 2) + '}'
    const products = this.mobile(text)
    let skus: any[] = []
    try {
      localStorage.setItem("apiProducts", products)
      const parsed = JSON.parse(products).products
      skus = parsed
    } catch (error) {
      console.info(error)
      skus = []
    }
    return skus
  }
  
  escapeStr(str: string) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }

  braceIndices(str: string, brace: string) {
    var regex = new RegExp(brace, "gi"), result, indices = []
    while ((result = regex.exec(str))) {
      indices.push(result.index)
    }
    return indices
  }
}