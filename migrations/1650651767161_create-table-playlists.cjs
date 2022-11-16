/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
    },
  });

  // membuat user baru.
  pgm.sql('INSERT INTO users(id, username, password, fullname) VALUES (\'old_playlists\', \'old_playlists\', \'old_playlists\', \'old playlists\')');

  // mengubah nilai owner pada song yang owner-nya bernilai NULL
  pgm.sql('UPDATE playlists SET owner = \'old_playlists\' WHERE owner = NULL');

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_playlists.owner_users.id pada tabel playlists
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');

  // mengubah nilai owner old_playlists pada song menjadi NULL
  pgm.sql('UPDATE playlists SET owner = NULL WHERE owner = \'old_playlists\'');

  // menghapus user baru.
  pgm.sql('DELETE FROM users WHERE id = \'old_playlists\'');

  pgm.dropTable('playlists');
};
