const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ProfileLinkSchema = new mongoose.Schema(
  {
    profileName: {
      type: String,
      trim: true,
    },
    profileUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (url) {
          return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,4}\/?/.test(url);
        },
        message: "Invalid URL format",
      },
    },
  },
  { _id: false }
);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    password: { type: String, required: true },
    bio:{type:String},
    avatar: {
      type: String,
      default: "/images/avatar.png",
    },
    domain: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
    profileLinks: [ProfileLinkSchema],
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token

adminSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
