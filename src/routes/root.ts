import { FastifyPluginAsync } from "fastify";
import getCityWeather from "../services/getCityWeather";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/:searchQuery", async function (request, reply) {
    const { searchQuery } = request.params as any;

    try {
      const weather = await getCityWeather(searchQuery);

      return {
        ...weather,
        next5DaysConditions: weather.next5DaysConditions.map(
          ({ hourly, ...rest }) => ({ ...rest })
        ),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "UNKOWN_CITY") {
        return reply.status(400).send({
          message: "Be sure to provide a valid query string",
          error: "Bad request",
          statusCode: 400,
        });
      }

      throw error;
    }
  });

  fastify.get("/:searchQuery/:date", async function (request, reply) {
    const { searchQuery, date } = request.params as any;

    try {
      const weather = await getCityWeather(searchQuery);

      return weather.next5DaysConditions.filter(
        (dayCondition) => dayCondition.date === date
      )[0];
    } catch (error) {
      if (error instanceof Error && error.message === "UNKOWN_CITY") {
        return reply.status(400).send({
          message: "Be sure to provide a valid query string",
          error: "Bad request",
          statusCode: 400,
        });
      }

      throw error;
    }
  });
};

export default root;
