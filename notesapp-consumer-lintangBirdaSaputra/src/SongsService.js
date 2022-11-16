import pg from 'pg';
const {Pool} = pg;

class SongsService {
  constructor() {
    this._pool = new Pool({
      user: 'developer',
      host: 'localhost',
      database: 'openmusicv3',
      password: 'supersecretpassword',
      port: 5432,
    });
  }

  async getSongs(playlistId) {
    const query = {
   
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylists(playlistId) {
    const query = {
      text: `SELECT id,name FROM playlists WHERE id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

export default SongsService;
