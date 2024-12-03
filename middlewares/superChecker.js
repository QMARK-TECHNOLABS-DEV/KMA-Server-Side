export const superChecker = async (req, res, next) => {
    if (req?.user?.role === "super") {
        next()
    } else {
        return res.status(401).json({ msg: "Unauthorized" })
    }
}
