const authorizeUser = (requestRole) => {
    return (request, response, next) => {
        const { userId } = request.params;

        try {
            if (
                userId === parseInt(request.user_id) ||
                requestRole === "admin"
            ) {
                next();
            } else {
                response.status(403).send("Forbidden");
            }
        } catch (err) {
            response.status(500).send("Internal Server Error");
        }
    };
};

module.exports = authorizeUser;

