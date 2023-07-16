import express from "express";
import User from "../Models/User.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
const router = express.Router();

//Register

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SERECT_KEY
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      res.status(401).json("Wrong Credentials");
    } else {
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SERECT_KEY
      );
      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

      if (originalPassword !== req.body.password) {
        res.status(401).json("Wrong Credentials");
      } else {
        const accessToken = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT,
          { expiresIn: "3d" }
        );

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
