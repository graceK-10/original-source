// server/routes/instapay.js
import express from "express";
import { handleInstapayNotify, handleInstapayReturn } from "../controllers/instapayController.js";

const router = express.Router();

// Accept both urlencoded and json just in case
router.post("/notify",
  express.urlencoded({ extended: true }),
  express.json(),
  handleInstapayNotify
);

router.get("/return", handleInstapayReturn);

export default router;
