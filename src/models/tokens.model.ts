import { Document, Model, model, Schema } from 'mongoose';
import { SnowflakeID, SnowflakeSchemaID } from './id';

export enum TokenType {
  UserToken = 1,
};

export enum TokenScope {
  Identity = 'identity',
};

const TokenSchema = new Schema(
  {
    _id: { type: SnowflakeSchemaID },

    user_id: { type: SnowflakeSchemaID, required: true },

    type: {
      type: Number, required: true
    },

    access_token: { type: String, index: true, unique: true },

    scopes: [{ type: String }],

    valid_until: { type: Number, required: false }
  },
  { versionKey: false },
);

export interface IToken extends Document {
  _id: SnowflakeID;

  type: TokenType;

  user_id: string;

  access_token?: string;

  json(): JSON;
};

export interface IBasicToken extends IToken {
  name: string;

  type: TokenType.UserToken;

  user_id: string;

  access_token: string;
};

export interface ITokenStatics extends Model<IToken> {
  empty: never;
};

TokenSchema.methods.json = function () {
  const token = this as IToken;

  switch (token.type) {
    case TokenType.UserToken: {
      const user_token = token as IBasicToken;
      return {
        id: user_token._id,
        user_id: user_token.user_id,
        accessToken: user_token.access_token,
        type: user_token.type
      };
    }
  }

  throw Error(`Unresolved Switch Channel Type: ${token.type}`);
};

export const Token = model<IToken>(
  'Token',
  TokenSchema,
  'tokens',
);
