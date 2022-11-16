import UploadsHandler from './handler.js';
import routes from './routes.js';

export default {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {service, validator, albumsService}) => {
    const uploadsHandler = new UploadsHandler(service, validator, albumsService);
    server.route(routes(uploadsHandler));
  },
};
