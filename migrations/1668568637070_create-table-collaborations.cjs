/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            notNull: true,
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        }
    });

    pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlist.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
    pgm.addConstraint('collaborations', 'fk_collaborations.user_id_user.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

};

exports.down = (pgm) => {
    pgm.dropConstraint('collaborations', 'fk_collaborations.playlist_id_playlist.id');
    pgm.dropConstraint('collaborations', 'fk_collaborations.user_id_user.id');

    pgm.dropTable('collaborations')
}




