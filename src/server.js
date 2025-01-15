require("dotenv").config();
const Hapi = require("@hapi/hapi");
const AlbumService = require("./services/postgres/AlbumService");
const ClientError = require("./exceptions/ClientError");
const albums = require("./api/albums");
const AlbumsValidator = require("./validator/albums");

const init = async () => {
  const albumService = new AlbumService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response instanceof Error) {
      const newResponse = h.response({
        status: "error",
        message: response.message,
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumService,
      validator: AlbumsValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
