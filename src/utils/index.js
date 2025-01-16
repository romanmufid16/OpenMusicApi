const toAlbumResponse = ({ id, name, year, songs = [] }) => ({
  id,
  name,
  year,
  songs: songs.map(({ id, title, performer }) => ({
    id,
    title,
    performer,
  })),
});

const toSongResponse = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const toSongsResponses = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = { toAlbumResponse, toSongResponse, toSongsResponses };
