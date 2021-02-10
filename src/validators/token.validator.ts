import { TokenScope, TokenType } from '../models/tokens.model';
import * as Zod from 'zod';

export const BasicTokenValidator = Zod.object({
    token: Zod.string()
});

export const CreateTokenValidator = Zod.object({
    user_id: Zod.string(),
    type: Zod.nativeEnum(TokenType),
    scopes: Zod.array(Zod.nativeEnum(TokenScope)).optional(),
    valid_until: Zod.number().nonnegative().optional()
});