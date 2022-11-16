import pg from 'pg';
const { Pool } = pg;
import {nanoid} from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import {mapDBToModelSong} from '../../utils/song.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    await this._cacheService.delete(`songs:${id}`);
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
   

      let filteredSongs = await this._pool.query('SELECT id, title, performer FROM songs');

      if (title !== undefined) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1',
          values: [`%${title}%`],
        };
        filteredSongs = await this._pool.query(query);
      }

      if (performer !== undefined) {
        filteredSongs = await this._pool.query(`SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE '%${performer}%'`);
      }

     
      return filteredSongs.rows.map(mapDBToModelSong);
    
  }

  async getSongById(id) {
    try{
      result =  await this._cacheService.get(`songs:${id}`);

      return {
        source: 'cache',
        count: JSON.parse(result),
      };
    } catch(error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Song tidak ditemukan');
      }

      await this._cacheService.set(`songs:${id}`, JSON.stringify(result.rows.map(mapDBToModelSong)[0]))

      return result.rows.map(mapDBToModelSong)[0];
    }
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
    await this._cacheService.delete(`songs:${id}`);
    
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('song gagal dihapus. Id tidak ditemukan');
    }
    await this._cacheService.delete(`songs:${id}`);
  }
}

export default SongsService;
