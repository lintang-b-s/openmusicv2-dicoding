// require('dotenv').config();
import path  from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

 
  const __dirname = path.dirname(__filename);

  const dirhere = __dirname;
dotenv.config({
  path: path.resolve(dirhere, '../.env'),
});
import amqp  from 'amqplib';
import SongsService  from './SongsService.js';
import MailSender  from './MailSender.js';
import Listener  from './listener.js';

const init = async () => {
  const songsService = new SongsService();
  const mailSender = new MailSender();
  const listener = new Listener(songsService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  channel.consume('export:playlists', listener.listen, {noAck: true});
};

init();
