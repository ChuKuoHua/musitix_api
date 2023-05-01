import mongoose, { Schema, Document } from 'mongoose';

export interface SessionModel {
  session: string;
  expires?: Date;
}

const sessionSchema: Schema = new mongoose.Schema({
  session: {
    type: String
  },
  expires: {
    type: Date,
    default: Date.now,
    select: false
  },
});

const SessionController = mongoose.model<SessionModel>('session', sessionSchema);

export default SessionController;