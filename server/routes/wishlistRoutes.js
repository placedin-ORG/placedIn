const router = require("express").Router();
const {
    addToWishlist,
    removeFromWishlist,
    getWishlistStatus,
    getWishlistedInternships,
} = require("../controllers/wishlistController");


router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);
router.get("/wishlist-status/:internshipId/:studentId", getWishlistStatus);
router.get("/:studentId", getWishlistedInternships);

module.exports = router;
