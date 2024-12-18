const express = require("express");
const router = express.Router();
const ctrlLocations = require("../controllers/locations");
const ctrlOthers = require("../controllers/others");

router.get("/", ctrlLocations.homelist);
router.get("/location", ctrlLocations.locationInfo);
router.get("/location/:locationid", ctrlLocations.locationInfo);
router.get("/location/review/new", ctrlLocations.addReview);

// locations pages
router.get("/", ctrlLocations.homelist);
router.get("/location/:locationid", ctrlLocations.locationInfo);
router.route("/location/:locationid/review/new").get(ctrlLocations.addReview).post(ctrlLocations.doAddReview);

router.get("/about", ctrlOthers.about);

module.exports = router;
