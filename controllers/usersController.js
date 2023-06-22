//Data Models
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
// Handling task asynchronously
const asyncHandler = require("express-async-handler");
// For hashing Password
const bcrypt = require("bcrypt");
const { json } = require("express");

//@des Get All Users
// @route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});
//@des Create a new User
// @route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles, skills } = req.body;

  //Confirm data
  if (
    !username ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length ||
    !Array.isArray(skills) ||
    !skills.length
  ) {
    return res.status(400).json({ message: "All Fields are Required" });
  }
  // check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ messafge: "Duplicate username" });
  }

  // Hash Password
  const hasedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = { username, password: hasedPassword, roles, skills };

  // Create and store new User
  const user = await User.create(userObject);
  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recieved" });
  }
});

//@des Update User
// @route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password, skills } = req.body;
  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    !Array.isArray(skills) ||
    !skills.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not Found" });
  }
  // Check for Duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  //Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  user.username = username;
  user.roles = roles;
  user.skills = skills;
  user.active = active;

  if (password) {
    // hashing pasword
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});
//@des delete User
// @route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User id Required" });
  }

  const user = await User.findById(id).exec();
  //   const role = user.findOne({roles:'Project Leader'});
  //   if(!role?.length){

  const projects = await Project.findOne({ user: id }).lean().exec();
  if (projects?.length) {
    return res.status(400).json({ message: "User has assigned projects" });
  }

  //   }

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID${result._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
