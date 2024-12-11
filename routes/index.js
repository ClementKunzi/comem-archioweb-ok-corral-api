import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send(
    "API for project OK-Corral, a web project in the HEIG-VD COMEM ArchiOWeb Course"
  );
});

export default router;
