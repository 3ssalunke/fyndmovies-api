import Movie from "../db/models/Movie";
import Admin from "../db/models/Admin";
import hashPassword from "../helpers/hashPassword";
import passwordCompare from "../helpers/passwordCompare";
import { encode } from "../helpers/jwtTokenHelper";
import validate from "../helpers/tokenValidator";
import Genre from "../db/models/Genre";

const setUpRoutes = (app) => {
  //api status check endpoint
  app.get("/check", (_, res) => {
    return res.json({ status: "SUCCESS", message: "service is up" });
  });

  //movies endpoints
  app.get("/movies", async (req, res, next) => {
    try {
      //   throw new Error("test");
      const limit = 30; //limit of movies per page
      const searchtext = req.query.search; //optional searchtext if coming on query params
      const page = req.query.page || 0; //optional pagenumber
      const re = new RegExp(searchtext, "i"); //regular expressoion
      const findQuery = searchtext ? { $text: { $search: re } } : {}; //find query based on search query is prsent or not
      const movies = await Movie.find(findQuery)
        .sort({ imdb_score: -1 })
        .skip(page * limit) //for pagination
        .limit(limit);

      return res.json({ status: "SUCCESS", result: { movies } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //CRUD endpoints for admin
  //create movie
  app.post("/admin/movie", validate, async (req, res, next) => {
    //check for all required fields, In future we can use joi like library for verifying post body
    if (
      !req.body["99popularity"] ||
      !req.body.name ||
      !req.body.imdb_score ||
      !req.body.director ||
      !req.body.genre
    ) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "all fields required" });
    }
    try {
      const newMovie = await Movie.create({
        "99popularity": req.body["99popularity"],
        name: req.body.name,
        imdb_score: req.body.imdb_score,
        director: req.body.director,
        genre: req.body.genre,
      });
      //if new genre is added then adding it to genres collection
      const { genres } = await Genre.findOne({}).select({ _id: 0 });
      await Genre.findOneAndUpdate(
        {},
        { genres: [...new Set([...genres, ...req.body.genre])] }
      );
      return res.json({ status: "SUCCESS", result: { id: newMovie._id } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //update movie data
  app.put("/admin/movie/:id", validate, async (req, res, next) => {
    //check if at least one field is present, In future we can use joi for verifying post body
    if (
      (!req.body["99popularity"] &&
        !req.body.imdb_score &&
        !req.body.director &&
        !req.body.genre) ||
      Object.keys(req.body).includes("name") //checking if name is included in post body
    ) {
      return res.status(400).json({
        status: "FAILURE",
        message:
          "at least one field is required except name(name can not be changed)",
      });
    }
    try {
      const { id } = req.params;
      //find the movie and update
      const updatedMovie = await Movie.findByIdAndUpdate(id, { ...req.body });
      if (!updatedMovie)
        return res
          .status(400)
          .json({ status: "FAILURE", message: "movie id does not exist" });
      if (req.body.genre) {
        //if on body new genre is added then adding it to genres collection
        const { genres } = await Genre.findOne({}).select({ _id: 0 });
        await Genre.findOneAndUpdate(
          {},
          { genres: [...new Set([...genres, ...req.body.genre])] }
        );
      }
      return res.json({ status: "SUCCESS", result: { id } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //delete movie
  app.delete("/admin/movie/:id", validate, async (req, res, next) => {
    try {
      const { id } = req.params;
      //delete movie
      const { deletedCount } = await Movie.deleteOne({ _id: id });
      //check if movie with id deleted or not, if count is zero ie no id with that movie
      if (!deletedCount)
        return res
          .status(400)
          .json({ status: "FAILURE", message: "movie id does not exist" });
      return res.json({ status: "SUCCESS", result: { id } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //list all genres
  app.get("/admin/genres", validate, async (req, res, next) => {
    try {
      const genres = await Genre.findOne({}).select({ _id: 0 });
      return res.json({ status: "SUCCESS", result: { genres } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //admin auth endpoints
  //admin signup
  app.post("/admin/signup", async (req, res, next) => {
    // check for all requires fields, In future we can use joi for verifying post body
    if (!req.body.email || !req.body.password || !req.body.username) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "all fields required" });
    }
    try {
      // find admin
      const adminExists = await Admin.findOne({ email: req.body.email });
      //if admin exists
      if (adminExists)
        return res.status(403).json({
          status: "FAILURE",
          message: "email is taken",
        });
      //create new admin
      const { email, username } = await Admin.create({
        email: req.body.email,
        password: hashPassword(req.body.password),
        username: req.body.username,
      });
      //success message
      return res.json({
        status: "SUCCESS",
        result: {
          email,
          username,
        },
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

  //Admin signin
  app.post("/admin/signin", async (req, res, next) => {
    // check for all required fields, In future we can use joi for verifying post body
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "all fields required" });
    }
    try {
      // find admin
      const admin = await Admin.findOne({ email: req.body.email });
      //if admin does not exist
      if (!admin)
        return res
          .status(401)
          .json({ status: "FAILURE", message: "invalid email or password" });
      //comparing password
      if (!passwordCompare(req.body.password, admin.password)) {
        return res
          .status(401)
          .json({ status: "FAILURE", message: "invalid email or password" });
      }
      //if password matches
      const authToken = encode(admin.email);
      //success message
      return res.json({
        status: "SUCCESS",
        result: { username: admin.username, authToken },
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
};

export default setUpRoutes;
