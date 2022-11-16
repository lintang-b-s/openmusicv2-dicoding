import ClientError from '../../exceptions/ClientError.js';

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumsHandler = this.postAlbumsHandler.bind(this);
    this.getAlbumsByIdHandler = this.getAlbumsByIdHandler.bind(this);
    this.putAlbumsByIdHandler = this.putAlbumsByIdHandler.bind(this);
    this.deleteAlbumsByIdHandler = this.deleteAlbumsByIdHandler.bind(this);
  }

  async postAlbumsHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const {name, year} = request.payload;

      const albumsId = await this._service.addAlbums({name, year});

      const response = h.response({
        status: 'success',
        message: 'Albums berhasil ditambahkan',
        data: {
          albumId: albumsId,
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

  async getAlbumsByIdHandler(request, h) {
    try {
      const {id} = request.params;
      const album = await this._service.getAlbumsById(id);
      const songs = await this._service.getSongsInAlbum(id);
      const getDetailAlbumWichContainsSongs = {...album, songs};

      const response  = h.response({
        status: 'success',
        data: {
          album: getDetailAlbumWichContainsSongs,
        },
      });
      response.header('X-Data-Source', album.source);
      response.code(200);
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

  async putAlbumsByIdHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const {id} = request.params;
      await this._service.editAlbumsById(id, request.payload);
      return {
        status: 'success',
        message: 'Albums berhasil diperbarui',
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

  async deleteAlbumsByIdHandler(request, h) {
    try {
      const {id} = request.params;
      await this._service.deleteAlbumsById(id);
      return {
        status: 'success',
        message: 'Albums berhasil dihapus',
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
}

export default AlbumsHandler;
