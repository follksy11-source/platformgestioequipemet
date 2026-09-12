const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentification requise"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Informations du JWT disponibles dans les controllers
        req.user = decoded;

        next();

    } catch (error) {
        console.error(error.message);

        return res.status(401).json({
            message: "Token invalide ou expiré"
        });
    }
};

module.exports = authenticate;
