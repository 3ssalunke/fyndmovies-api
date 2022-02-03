import mongoose from "mongoose";

export const movieSchema = new mongoose.Schema({
  "99popularity": Number,
  director: String,
  imdb_score: Number,
  name: String,
  genre: [String],
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
