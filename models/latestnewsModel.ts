import mongoose, { Schema } from 'mongoose';

export interface LatestNews {
  title: string;
  content: string;
  updatedAt?: Date;
  messageTypes: string;
}

const latesnewsSchema: Schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  messageTypes: { type: String, required: true },
});

const LatestNews = mongoose.model<LatestNews>('latestnews', latesnewsSchema);

export default LatestNews;