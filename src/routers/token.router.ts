import * as Router from 'koa-router';
import { BasicTokenValidator, CreateTokenValidator } from '../validators/token.validator';
import { Snowflakes } from '../utils/snowflakes';
import { Token } from '../models/tokens.model';
import * as crypto from 'crypto';
import * as cache from 'koa-cash';
import { Event, Events, EventType, makeEvent } from '../events/events';

const TokenRouter = new Router({
    prefix: '/tokens'
});

TokenRouter.get('/:token', async (ctx) => {
    const tokenQuery = BasicTokenValidator.parse(ctx.params);

    const token = await Token.findOne({ access_token: tokenQuery.token }).exec();

    if (!token) {
        ctx.throw(404);
    }

    ctx.body = token.json();
    ctx.response.status = 200;
});

TokenRouter.post('create_token', '/', async (ctx) => {
    const tokenBody = CreateTokenValidator.parse(ctx.request.body);

    const accessToken = crypto.randomBytes(64).toString('hex');

    const token = await new Token({
        _id: Snowflakes.next(),
        ...tokenBody,
        access_token: `${accessToken}`
    }).save();

    ctx.body = token.json();
    ctx.response.status = 201;

    setImmediate(async () => Events.send(makeEvent(EventType.TOKEN_CREATED, { id: token._id, user_id: token.user_id })))
});

export { TokenRouter };