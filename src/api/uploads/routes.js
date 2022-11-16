import path from 'path';
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const dirhere = __dirname;

const routes = (handler) => [
  {
    method: 'POST', 
    path: '/albums/{id}/covers',
    handler: handler.postAlbumsCoversHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

export default routes;
