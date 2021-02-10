import * as dotenv from 'dotenv';
dotenv.config();

import * as Koa from 'koa';
import * as koalogger from 'koa-logger';
import * as koabody from 'koa-body';
import * as Router from 'koa-router';
import * as removeTrailingSlashes from 'koa-remove-trailing-slashes';

import * as mongoose from 'mongoose';
import { Logger } from './utils/logger';
import stripAnsi = require('strip-ansi');
import { isHttpError } from 'http-errors';
import { ZodError } from 'zod';
import { TokenRouter } from './routers/token.router';
import * as koacash from 'koa-cash';

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const app = new Koa();

app.use(removeTrailingSlashes());

app.use(
  koalogger((str, args) => {
    const [method, path, response, time, size] = Object.values(args).slice(1);
    Logger.info(stripAnsi(str), { method, path, response, time, size });
  }),
);

app.use(koabody());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (isHttpError(e)) {
      ctx.body = { error: e['error'] };
      ctx.response.status = e.status;
      return;
    } else if (e instanceof ZodError) {
      ctx.body = { error: e },
        ctx.response.status = 400;
      return;
    }

    console.log(e);

    ctx.response.status = 500;
  }
})

const BaseRouter = new Router();

BaseRouter.use(TokenRouter.routes());

app.use(BaseRouter.routes());

app.listen(3000, () => console.log('listening on 3000'));
