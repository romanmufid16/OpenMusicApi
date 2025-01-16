const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { toSongResponse, toSongsResponses } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    if (albumId) {
      const albumQuery = {
        text: "SELECT id FROM albums WHERE id = $1",
        values: [albumId],
      };

      const albumResult = await this._pool.query(albumQuery);

      if (!albumResult.rows.length) {
        throw new NotFoundError("Album tidak ditemukan");
      }
    }

    const query = {
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration || null,
        albumId || null,
        created_at,
        updated_at,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let query = "SELECT * FROM songs";
    const params = [];

    if (title || performer) {
      const conditions = [];
      if (title) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${title}%`);
      }
      if (performer) {
        conditions.push(`performer ILIKE $${params.length + 1}`);
        params.push(`%${performer}%`);
      }
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await this._pool.query(query, params);
    return result.rows.map(toSongsResponses);
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    return result.rows.map(toSongResponse)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updated_at = new Date().toISOString();

    if (albumId) {
      const albumQuery = {
        text: "SELECT id FROM albums WHERE id = $1",
        values: [albumId],
      };

      const albumResult = await this._pool.query(albumQuery);

      if (!albumResult.rows.length) {
        throw new NotFoundError("Album tidak ditemukan");
      }
    }

    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, "albumId"=$6, updated_at=$7 WHERE id=$8 RETURNING id',
      values: [
        title,
        year,
        genre,
        performer,
        duration || null,
        albumId || null,
        updated_at,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus lagu. Id tidak ditemukan");
    }
  }
}

module.exports = SongService;
