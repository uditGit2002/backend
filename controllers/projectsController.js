const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");

// @desc Get all projects
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async (req, res) => {
  // Get all Projects from MongoDB
  const projects = await Project.find().lean();

  // If no projects
  if (!projects?.length) {
    return res.status(400).json({ message: "No Projects found" });
  }
  // Add UserName to each note before sending response
  const projectsWithUser = await Promise.all(
    projects.map(async (project) => {
      const user = await User.findById(project.user).lean().exec();
      return { ...project, username: user.username };
    })
  );
  res.json(projectsWithUser);
});

// @desc Create new project
// @route POST /projects
// @access Private

const createNewProject = asyncHandler(async (req, res) => {
  const { user, title, members } = req.body;
  // confirm data
  if (!user || !title | !members) {
    return res.status(400).json({ message: "All Fields are required" });
  }
  // check for duplicate title
  // need to think if want to apply or not
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate  Project title" });
  }
  const project = await Project.create({ user, title, members });
  if (project) {
    return res.status(201).json({ message: "New Project is created" });
  } else {
    return res.status(400).json({ message: "Invalid note data recieved" });
  }
});

// @desc Update a  Project
// @route PATCH /notes
// @access Private

const updateProject = asyncHandler(async (req, res) => {
  const { id, user, title, members, projectStatus } = req.body;
  if (
    !id ||
    !user ||
    !title ||
    !members ||
    typeof projectStatus !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // confirm project exists to update

  const project = await Project.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Project not found" });
  }

  // Check for duplicate title
  const duplicate = await Project.findOne({ title }).lean().exec();

  //Allow renamin of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Project title" });
  }

  project.user = user;
  project.title = title;
  project.members = members;
  project.projectStatus = projectStatus;
  const updatedProject = await project.save();
  res.json(`'${updatedProject.title}' updated`);
});

// @desc Delete a project
// @route DELETE /projects
// @access Private

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Node ID required" });
  }
  // confirm project  exists to delete
  const project = await Project.findById(id).exec();
  if (!project) {
    return res.status(400).json({ message: "project not found" });
  }
  const result = await project.deleteOne();
  const reply = `Project '${result.title}' with id ${result._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllProjects,
  createNewProject,
  updateProject,
  deleteProject,
};
