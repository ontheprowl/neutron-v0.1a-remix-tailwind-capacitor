// db.ts
import type { Table } from 'dexie';
import Dexie from 'dexie';

export interface userImages {
  url:string,
  data:string
}

export class StaticAssetsCache extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  userImages!: Table<userImages>; 

  constructor() {
    super('static_assets_cache');
    this.version(1).stores({
      userImages: 'url, data' // Primary key and indexed props
    });
  }
}

export const db = new StaticAssetsCache();
