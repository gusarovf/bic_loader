import fetch from "node-fetch"
import iconv from "iconv-lite"
import { parseXml } from "../utils"
import { BicRecord, BicXml } from "./types"
import { TransactReady } from "../database/utils"

export const getBic = async (sourceUrl: string): Promise<BicXml> =>
  fetch(sourceUrl)
    .then((res) => res.buffer())
    .then((buffer) => iconv.decode(buffer, "windows-1251"))
    .then((str) => parseXml(str))

export const validateBicRecord = (record: BicRecord): void => {
  if (!record) throw new Error("No record")

  const regNum = record?.RegNum[0]
  const bic = record?.Bic[0]
  const shortName = record?.ShortName[0]

  if (typeof shortName !== "string")
    throw new Error("Record shortName is of string type")

  if (!shortName.length) throw new Error("Record shortName is empty")

  if (typeof +regNum?._ !== "number")
    throw new Error("Record RegNum is not of number type")

  if (regNum?._?.length !== 13)
    throw new Error("Record RegNum is not 9 digits length")

  if (bic?.length !== 9) throw new Error("Record Bic is not 9 digits length")

  if (
    !new RegExp(
      /^(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}$/
    ).test(regNum?.$?.date || "")
  )
    throw new Error("Record date has wrong format")
}

export const prepareBic = (bic: BicXml, postfix: string, updateId: number): TransactReady => {
  // Prepare bics for PG copy transaction
  const cols = ["update_id","inner_id", "bic", "name", "register_code", "register_date"]

  return {
    tableName: "bic" + postfix,
    tableColumns: cols,
    values: bic.BicCode.Record.map((record: BicRecord) => {
      return [
        updateId,
        record?.$?.ID,
        record.Bic[0],
        record.ShortName[0],
        record.RegNum?.[0]?._,
        record.RegNum?.[0]?.$?.date,
      ]
    }),
  }
}
