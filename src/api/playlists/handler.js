import { verify } from '@hapi/jwt/lib/crypto.js';
import ClientError from '../../exceptions/ClientError.js';

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const {name} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({name, owner: credentialId});

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const {id: credentialId} = request.auth.credentials;
      // const collaborator = await this.service.verifyCollaborator(credentialId)

        const playlists = await this._service.getPlaylists(credentialId);
        return {
          status: 'success',
          data: {
            playlists,
          },
        };
   
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const {songId} = request.payload; //id lagu
      const {id} = request.params; //id playlist
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistCollaborator(id, credentialId);

      await this._service.verifySongExist(songId);
      await this._service.addSongsToPlaylist({id, songId});
      // memasukan aktivitas add song ke tabel playlist_activities
      const action = "add"
      const time = new Date().toJSON();
      console.log('time:', time)
      await this._service.addActivitiesToPlaylist({id, songId, credentialId, action, time});

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan pada playlist',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const {id} = request.params;
      const {id: credentialId} = request.auth.credentials;

   await this._service.verifyPlaylistCollaborator(id, credentialId);
    
      const playlist = await this._service.getPlaylistById(id);
      playlist.songs = await this._service.getSongsFromPlaylist(id);
      
        return {
          status: 'success',
          data: {
            playlist,
          },
        };
    
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistSongByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const {songId} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistCollaborator(id, credentialId);
      await this._service.deleteSongFromPlaylistById(id, songId);
      const action = "delete"
      const time = new Date().toJSON();
      await this._service.addActivitiesToPlaylist({id, songId, credentialId, action, time});


      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try{
      const {id} = request.params;
      
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistCollaborator(id, credentialId);

      const activities = await this._service.getActivities(id);

      return {
        status: 'success',
        data: {
          playlistId: id,
          activities: activities,

        },
      };


    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }


  async postCollaborationsHandler(request, h) {
    try{
      this._validator.validateCollaborationsPayload(request.payload);
      const {playlistId, userId} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      // status code =201. 
      // response success, data cllaborationId: collab_id
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      // await this._service.verifyPlaylistCollaborator(playlistId, credentialId);
      await this._service.verifyPlaylistExist(playlistId);
      await this._service.verifyUserExist(userId);

      const collab_id = await this._service.addCollaborations({playlistId, userId});

      const response = h.response({
        status: 'success',
        data: {
          collaborationId: collab_id,

        },
      });
    response.code(201);
    return response;

    }catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationsHandler(request, h) {
    try{
      const {playlistId, userId} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteCollaboration(playlistId, userId); //buat hapus kolaborasi


      return {
        status: 'success',
        message: 'Kolaborasi berhail dihapus',
      }
    }catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }


}

export default PlaylistsHandler;
