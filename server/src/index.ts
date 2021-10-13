import "reflect-metadata";
import { graphqlUploadExpress } from 'graphql-upload';
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Express from "express";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { router } from "./routers/indexRouter";
import { createConnection } from "typeorm";

dotenv.config();

(async () => {
  const app = Express();
  app.use(cookieParser("Authorization"));

  const apolloServer = new ApolloServer({
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/**/*.ts"],
    }),
    context: ({ req, res }) => ({ req, res }),
  });


  await createConnection().then(() =>
    console.log("> Connected to postgreSQL database")
  );

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
      exposedHeaders: ["Cookie"],
    })
  );

  app.use("/", router);


  await apolloServer.start();

  app.use(graphqlUploadExpress());

  apolloServer.applyMiddleware({
    app,
    cors: { credentials: true, origin: process.env.CLIENT_URL },
  });

  app.listen(4000, () => {
    console.log("> Server started on http://localhost:4000/graphql");
  });
})();
