import mongoose, { Schema } from 'mongoose';

export interface Banner {
  activity_id: string;
  activity_title: string;
  image: string;
  createdAt?: Date
}

const bannerSchema: Schema = new mongoose.Schema({
  activity_id: { type: String, required: true },
  activity_title: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
});

const Banner = mongoose.model<Banner>('banner', bannerSchema);

export default Banner;