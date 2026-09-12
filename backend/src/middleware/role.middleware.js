const authorize = (...rolesAutorises) => {
    return (req, res, next) => {

        // Vérifier que l'utilisateur est authentifié
        if (!req.user) {
            return res.status(401).json({
                message: "Authentification requise"
            });
        }

        // Vérifier le rôle
        if (!rolesAutorises.includes(req.user.role)) {
            return res.status(403).json({
                message: "Vous n'avez pas l'autorisation d'effectuer cette action"
            });
        }

        next();
    };
};

module.exports = authorize;
