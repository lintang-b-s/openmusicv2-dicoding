class Listener {
  constructor(SongsService, mailSender) {
    this._SongsService = SongsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const {playlistId, targetEmail} = JSON.parse(message.content.toString());
      console.log(`ini playlistid ${playlistId}`);
      console.log(`akan dikirim ke email: ${targetEmail}`)

      const songs = await this._SongsService.getSongs(playlistId);
      console.log(`ini songs ${songs.title}`);
      const playlists = await this._SongsService.getPlaylists(playlistId);
      console.log(`ini playlists ${playlists}`);
      console.log(`ini playlist: ${playlists.name}`)
      // console.log(`ini playlists nama: ${playlists.name}`);
      const playlistSongs = {
        playlist: {
          id: playlistId,
          name: playlists.name,
          songs,
        },
      };
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlistSongs));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

export default Listener;
