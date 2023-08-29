import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  threads: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Thread" 
    }
  ],
  onboarded: { type: Boolean, default: false },
  members: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Community = mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;
