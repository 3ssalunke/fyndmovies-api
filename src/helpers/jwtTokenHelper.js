import jwt from "jsonwebtoken";

export const encode = (payload) => {
  //signing payload with jwt secret -> gives jwt token
  let token = jwt.sign({ data: payload }, process.env.JWT_SECRET, {
    issuer: "com.fyndmovie",
    expiresIn: "1h",
  });

  return token;
};

export const decode = (token) => {
  try {
    //verifying jwt token with secret -> gives original payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    //if token is invalid or expired
    console.log(error);
    return "invalid token";
  }
};
