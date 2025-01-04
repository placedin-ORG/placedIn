
const router = require("express").Router();
const {search,internSearch,jobSearch
} = require("../controllers/searchController");

router.post("/getSearch", search);
router.post("/internship/getSearch",internSearch)
router.post("/job/getSearch",jobSearch);
module.exports = router;

