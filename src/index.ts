import { getBic, prepareBic, validateBicRecord } from "./source/cbr"
import { downTables, upHelpTables, upMainTables } from "./database"
import { insertUpdateRecord } from "./database/actions/inserts"
import { getLatestUpdate } from "./database/actions/selects"
import { hoursToMs, msToTimeString } from "./utils"
import { transact } from "./database/utils"
import { startKubeServer } from "./server"
import { cfg } from "./config"
import {
  updateUpdateRecord,
  updateUpdateTablesExist,
} from "./database/actions/updates"
import {
  buildHelpTablesIndexes,
  buildMainTablesIndexes,
} from "./database/actions/indexes"

const insertUpdate = async (postfix: string) => {
  const bics = await getBic(cfg.bicSource.extended)
  const totalRecords = bics?.BicCode?.Record?.length
  console.log("Found " + totalRecords + " new records.")

  validateBicRecord(bics?.BicCode?.Record[0])

  const newUpdate = await insertUpdateRecord(postfix, totalRecords)

  await downTables(postfix)
  await updateUpdateTablesExist(postfix, false)
  await upMainTables(postfix)

  const preparedBics = prepareBic(bics, postfix, newUpdate!.id)
  const result = await transact([preparedBics])

  if (result) {
    await updateUpdateRecord(newUpdate!.id, true, true)
    await buildMainTablesIndexes(postfix)
    console.log("Loading ended. \n")
  }
}

const loadUpdate = async (): Promise<void> => {
  process.on("uncaughtException", (e) => {
    console.log("Uncaught error:")
    throw e
  })

  console.log("Update initiated.")

  await upHelpTables()
  await buildHelpTablesIndexes()

  let latestUpdatePostfix = (await getLatestUpdate())?.tablesPostfix

  if (!latestUpdatePostfix) {
    const postfix = cfg.postfixes.primary
    await insertUpdate(postfix)

    return
  }

  const postfix =
    latestUpdatePostfix === cfg.postfixes.primary
      ? cfg.postfixes.secondary
      : cfg.postfixes.primary

  await insertUpdate(postfix)
}

const loopUpdate = (): void => {
  loadUpdate().then(nextLoop).catch(handleErr)
}

const nextLoop = (): void => {
  const repeatTime = hoursToMs(cfg.updateDelay)
  if (!repeatTime)
    throw new Error(`Cannot set repeat time. Repeat time val: ${repeatTime}`)

  setTimeout(loopUpdate, repeatTime)
}

const handleErr = (err: Error): void => {
  console.log(
    `Error caught. Try to repeat action in ${msToTimeString(
      +cfg.errRetryDelay
    )}.`
  )

  console.log(err)
  setTimeout(loopUpdate, +cfg.errRetryDelay)
}

startKubeServer()
loopUpdate()
