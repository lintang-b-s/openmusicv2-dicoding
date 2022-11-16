import pg from 'pg';
const { Pool } = pg;
import {nanoid} from 'nanoid';

import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlists.id,playlists.name,users.username FROM playlists INNER JOIN users ON playlists.owner=users.id WHERE playlists.id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyPlaylistCollaborator(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.id = $1 ',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    // console.log('playlist user_id: ',playlist.user_id )
    // console.log('playlist owner: ',playlist.owner )
    // console.log('playlist owner: ', owner )
    if (playlist.owner == owner || playlist.user_id == owner) {
     
    } else {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini karenaa anda bukan owner playlist ini atau anda bukan collaborator playlist ini');
    }

  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.id = $1 ',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    // console.log('playlist user_id: ',playlist.user_id )
    // console.log('playlist owner: ',playlist.owner )
    // console.log('playlist owner: ', owner )
    console.log('owner: ', owner)
    if (playlist.owner !== owner ) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini karenaa anda bukan owner playlist ini atau anda bukan collaborator playlist ini');
    }

  }


  async verifyUserExist(id) {
    const query = {
      text:  `SELECT * FROM users WHERE id=$1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistExist(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async addSongsToPlaylist({id: playlistId, songId}) {
    const id = `playlistsongs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke Playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
          INNER JOIN songs ON playlist_songs.song_id = songs.id
          WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus pada Playlist');
    }
  }

  async verifySongExist(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async addActivitiesToPlaylist({id: playlistId, songId, credentialId, action, time}){
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, credentialId, action, time],
    };


    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke Playlist');
    }
  }


  async getActivities(playlistId) {
    // params: hanya playlistId
    const query = {
      text: `SELECT playlist_id, users.username, songs.title, action, time FROM playlist_song_activities
            INNER JOIN songs ON playlist_song_activities.song_id = songs.id INNER JOIN users ON playlist_song_activities.user_id = users.id WHERE playlist_id = $1`,
      values: [playlistId]
    };

    const result = await this._pool.query(query);
    return result.rows;

    // cara nampiliin activitis sbeagai aray nnti di handler data playlist id dari getplaylistbyid
    // terus buat nampilin acitivtiesnya dari getActiviteies ini

  }


  async addCollaborations({playlistId, userId}) {
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES( $1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Collaborations gagal ditambahkan');
    } 

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE user_id = $2 AND playlist_id = $1 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Collaborations gagal dihapus');
    } 
  }

  

}

export default PlaylistsService;
