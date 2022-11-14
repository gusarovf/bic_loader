export const nonPfxTbls = {
  updateTbl: "updates",
}

export const mainPfxTbls = {
  bic: "bic",
}

export const bic = (postfix: string): string =>
  `CREATE TABLE IF NOT EXISTS ${mainPfxTbls.bic}${postfix}
    (
     id SERIAL PRIMARY KEY,
     update_id INTEGER NOT NULL,
     inner_id INTEGER NOT NULL,
     bic VARCHAR(9),
     name VARCHAR(500),
     register_code VARCHAR(30),
     register_date VARCHAR(30),
     FOREIGN KEY (update_id) REFERENCES ${nonPfxTbls.updateTbl} (id) ON DELETE CASCADE ON UPDATE CASCADE
    ); 
  `
export const updates = (): string =>
  `CREATE TABLE IF NOT EXISTS ${nonPfxTbls.updateTbl}
    (
        id SERIAL PRIMARY KEY,
        tables_postfix VARCHAR(20) NOT NULL,
        is_loaded SMALLINT DEFAULT 0,
        are_tables_exist SMALLINT DEFAULT 1,
        total_records INTEGER NOT NULL,
        loaded_at TIMESTAMP DEFAULT NOW()
    );`
