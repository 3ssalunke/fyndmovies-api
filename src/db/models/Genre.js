import mongoose from "mongoose";

export const genreSchema = new mongoose.Schema({
  genres: [String],
});

const Genre = mongoose.model("Genre", genreSchema);
export default Genre;
