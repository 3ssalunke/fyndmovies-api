import { decode } from "./jwtTokenHelper";

const validate = (req, res, next) => {
  //check for authorization header
  const authHeader = req.headers.authorization?.split(" ")[1];
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "FAILURE", message: "authorization header required" });
  }
  //decoding token
  const decodedToken = decode(authHeader);
  //if token is not valid
  if (decodedToken === "" || decodedToken === "invalid token") {
    return res
      .status(403)
      .json({ status: "FAILURE", message: "invalid token or token expired" });
  }
  next();
};

export default validate;
