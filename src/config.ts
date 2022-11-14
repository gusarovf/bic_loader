export const cfg = {
  bicSource: {
    short: "http://www.cbr.ru/scripts/XML_bic.asp",
    extended: "http://cbr.ru/scripts/XML_bic2.asp",
  },
  postfixes: {
    primary: "_prim",
    secondary: "_secon",
  },
  updateDelay: process.env.UPDATE_DELAY_HOURS
    ? +process.env.UPDATE_DELAY_HOURS
    : 24, // Hours
  errRetryDelay: process.env.ERR_RETRY_DELAY_MSECS
    ? +process.env.ERR_RETRY_DELAY_MSECS
    : 180000, // MSecs
}

export const db = {
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/postgres",
}
