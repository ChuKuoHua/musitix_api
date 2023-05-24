import mongoose, { Schema } from 'mongoose';

export interface Banner {
  title?: string;
  image: string;
  createdAt?: Date
}

const bannerSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
});

const Banner = mongoose.model<Banner>('banner', bannerSchema);

export default Banner;