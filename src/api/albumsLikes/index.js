import AlbumLikesHandler from './handler.js';
import routes from './routes.js';

export default {
  name: 'album_likes',
  version: '1.0.0',
  register: async (server, {service, albumsService}) => {
    const albumLikesHandler = new AlbumLikesHandler(service, albumsService);
    server.route(routes(albumLikesHandler));
  },
};
