import pg from 'pg';
const { Pool } = pg;
import {nanoid} from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import {mapDBToModel} from '../../utils/index.js';
import {mapDBToModelSong} from '../../utils/song.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbums({name, year}) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Albums gagal ditambahkan');
    }


    await this._cacheService.delete(`albums:${id}`);
    return result.rows[0].id;
  }

  async getAlbumsById(id) {
    try{
      result = await this._cacheService.get(`albums:${id}`);
      
      return {
        source: 'cache',
        count: JSON.parse(result),
      };
    } catch (error){

    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    console.log(`ini hasil query : ${result}`);

    if (!result.rows.length) {
      throw new NotFoundError('Albums tidak ditemukan');
    }

    await this._cacheService.set(`albums:${id}`, JSON.stringify(result.rows.map(mapDBToModel)[0]))

    return result.rows.map(mapDBToModel)[0];
  }
  }



  async editAlbumsById(id, {name, year}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
    }
    await this._cacheService.delete(`albums:${id}`);
  }

  async deleteAlbumsById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Albums gagal dihapus. Id tidak ditemukan');
    }
    await this._cacheService.delete(`albums:${id}`);
  }

  async getSongsInAlbum(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSong);
  }

  async addCoverAlbumById(id, cover) {
    const query = {
      text: `UPDATE albums SET "coverUrl" = $2 WHERE id = $1 RETURNING id`,
      values: [id, cover],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover. Id tidak ditemukan');
    }
  }
}

export default AlbumsService;
