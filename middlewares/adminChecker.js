export const adminChecker = async (req, res, next) => {
    if (["admin", "super"]?.includes(req?.user?.role)) {
        next()
    } else {
        return res.status(401).json({ msg: "Unauthorized" })
    }
}
