import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import authRoute from "./routes/auth.js";
import productRoute from "./routes/product.js";
import cartRoute from "./routes/cart.js";
import orderRoute from "./routes/order.js";
import Stripe from "stripe";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("connected to mongoDB"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/checkout/payment", async (req, res) => {
  const charge = await stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
        console.log(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log("server on");
});
