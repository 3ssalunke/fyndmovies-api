import mongoose from "mongoose";

export const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
