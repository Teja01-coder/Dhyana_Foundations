const { Router } = require("express");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = Router();

const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  if (err.message === "Incorrect Email") {
    errors.email = "The email is not registered";
    return errors;
  }

  if (err.message === "Incorrect Password") {
    errors.password = "Incorrect Password";
    return errors;
  }

  if (err.message === "Wait for Admin Approval") {
    errors.email = "Wait for Admin Approval";
    return errors;
  }

  if (err.message === "You are not an Admin") {
    errors.email = "You are not an Admin";
    return errors;
  }

  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) =>
  jwt.sign({ id }, "dhyana foundation", {
    expiresIn: maxAge,
  });

const signup_get = (_, res) => {
  res.render("adminlogin");
};

const signup_post = async (req, res) => {
  const {
    name,
    address,
    city,
    age,
    phone,
    bloodGroup,
    healthRecord,
    introducedBy,
    introducerName,
    introducerRegistration,
    designation,
    qualification,
    session
  } = req.body;

  try {
    const user = await Student.create({
      name,
      address,
      city,
      age,
      phone,
      bloodGroup,
      healthRecord,
      introducedBy,
      introducerName,
      introducerRegistration,
      designation,
      qualification,
      session
    });

    res.status(201).json({ user: user._id });
  } catch (err) {
    console.log(err);
  }
};

const admin_get = (_, res) => {
  res.render("adminlogin");
};

const admin_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    if (user.isAdmin) {
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

      res.status(200).json({ user: user._id });
    } else {
      throw Error("You are not an Admin");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

//const approve_post = async (req, res) => {
//const { id } = req.body;

//try {
//const user = await User.findOneAndUpdate({ _id: id }, { isVerified: true });
//console.log(user);
//sendConfirmationmail(user.email, user.name);
//res.status(200).json({ user: user._id });
//} catch (err) {
//const errors = handleErrors(err);
//res.status(400).json({ errors });
//}
//};

//const reject_post = async (req, res) => {
//const { id } = req.body;

//try {
//const user = await User.deleteOne({ _id: id });
//console.log(user);
//res.status(200).json({ user: user._id });
//} catch (err) {
//const errors = handleErrors(err);
//res.status(400).json({ errors });
//}
//};

router.get("/register", signup_get);
router.post("/register", signup_post);
router.get("/admin", admin_get);
router.post("/admin", admin_post);
//router.post("/approve", approve_post);
//router.post("/reject", reject_post);

module.exports = router;