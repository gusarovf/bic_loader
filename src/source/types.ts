export interface BicXml {
  BicCode: {
    $: {
      name: string
    }
    Record: BicRecord[]
  }
}

export interface BicRecord {
  $: {
    ID: string
    DU: string
  }
  ShortName: string[]
  Bic: string[]
  RegNum: {
    _: string
    $: {
      date: string
    }
  }[]
}
