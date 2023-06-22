const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    members: [
      {
        type: String,
        default: "member",
      },
    ],
    projectStatus: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
projectSchema.plugin(AutoIncrement, {
  inc_field: "projectID",
  id: "projectNum",
  start_seq: 500,
});
module.exports = mongoose.model("Project", projectSchema);
