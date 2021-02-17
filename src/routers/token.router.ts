import * as Router from 'koa-router';
import { BasicTokenValidator, CreateTokenValidator } from '../validators/token.validator';
import { Snowflakes } from '../utils/snowflakes';
import { Token } from '../models/tokens.model';
import * as crypto from 'crypto';
import * as cache from 'koa-cash';
import { Event, Events, EventType, makeEvent } from '../events/events';

const TokenRouter = new Router({
});

TokenRouter.get('/:token', async (ctx) => {
    const tokenQuery = BasicTokenValidator.parse(ctx.params);

    const token = await Token.findOne({ access_token: tokenQuery.token }).exec();

    if (!token) {
        ctx.throw(301);
    }

    ctx.body = token.json();
    ctx.response.status = 200;
});

TokenRouter.all(/.*/g, async (ctx) => {
    console.log('h', ctx.request.headers.authorization);
    const access_token = ctx.request.headers.authorization;

    const token = await Token.findOne({ access_token }).exec();

    if (!token) {
        ctx.throw(401);
    }

    ctx.set('x-user-id', token.user_id);
    ctx.set('x-token-type', token.type.toString());
    ctx.set('x-token-id', token._id.toString());

    // ctx.body = token.json();
    ctx.response.status = 200;
});

// TokenRouter.all()


// This should be a different service
// TokenRouter.post('create_token', '/', async (ctx) => {
//     const tokenBody = CreateTokenValidator.parse(ctx.request.body);

//     const accessToken = crypto.randomBytes(64).toString('hex');

//     const token = await new Token({
//         _id: Snowflakes.next(),
//         ...tokenBody,
//         access_token: `${accessToken}`
//     }).save();

//     ctx.body = token.json();
//     ctx.response.status = 201;

//     setImmediate(async () => Events.send(makeEvent(EventType.TOKEN_CREATED, { id: token._id, user_id: token.user_id })))
// });

export { TokenRouter };