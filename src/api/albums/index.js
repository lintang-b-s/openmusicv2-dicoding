import routes from './routes.js';
import AlbumsHandler from './handler.js';

export default {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {service, validator}) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};
