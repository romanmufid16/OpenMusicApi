const toAlbumResponse = ({ id, name, year }) => ({
  id,
  name,
  year,
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

module.exports = { toAlbumResponse, toSongResponse };
