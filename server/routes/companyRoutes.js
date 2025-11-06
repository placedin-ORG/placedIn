const express = require("express");
const router = express.Router();
const {
  getCompanyStats,
  getCompanyCharts,
} = require("../controllers/companyProfileController"); 
const { isAuth, authoriseRoles } = require("../middlewares/auth");

router.get(
  "/stats",
  isAuth,
  authoriseRoles("company", "admin"),
  getCompanyStats
);

router.get(
  "/charts",
  isAuth,
  authoriseRoles("company", "admin"),
  getCompanyCharts
);

module.exports = router;