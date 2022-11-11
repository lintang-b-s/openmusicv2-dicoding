import ClientError from "../../exceptions/ClientError.js";

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try{
    this._validator.validateCollabPayload(request.payload);
    const {id: credentialId} = request.auth.credentials; //mengambil usercredentialid dari server.auth.credentials di server.js
    const {playlistId, userId} = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId); 

    // verifikasi data user dan playlist dulu
    await this._collaborationsService.verifyExistingUser(userId);
    await this._collaborationsService.verifyExistingPlaylist(playlistId);

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi sukses di post',
      data: {
        collaborationId,
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

  async deleteCollaborationHandler(request,h) {
    try{
    this._validator.validateCollabPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi sukses di delete',
    };
  }
  catch (error) {
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

export default CollaborationsHandler;
