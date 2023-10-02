import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Thread" 
    }
  ],
  likedThreads: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Thread" 
    }
  ],
  onboarded: { type: Boolean, default: false },
  communities: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Community" 
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
