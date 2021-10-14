import next from "next";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server: Application = express();

    server.use((bodyParser as any)());
    server.use(cors());

    server.get("*", (req: Request, res: Response) => {
      return handle(req, res as any);
    });

    server.listen(8000, (err?: any): void => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${8000}`);
    });
  })
  .catch((ex: any) => {
    console.error(ex.stack);
    process.exit(1);
  });
