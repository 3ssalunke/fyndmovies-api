import bcrypt from "bcryptjs";

const passwordCompare = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);

export default passwordCompare;
