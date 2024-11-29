
const router = require("express").Router();
const {search
} = require("../controllers/searchController");

router.post("/getSearch", search);

module.exports = router;

