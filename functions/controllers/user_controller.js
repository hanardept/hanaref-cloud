const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AUTO_LOGOUT_TIME = 8; // in hours

module.exports = {
    // public routes:
    async createUser(req, res) {
        // check if username already registered:
        const usernameExistsInDB = await User.findOne({ username: req.body.username });
        if (usernameExistsInDB) return res.status(400).send("Username already registered!");

        // register new user with bcrypt-hashed password:
        const salty = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salty);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            privilege: req.body.privilege,
        });

        try {
            await user.save();
            res.status(200).send("User created!");
        } catch (error) {
            res.status(400).send(error);
        }
    },
    async authenticateUser(req, res) {
        try {
            // check if email registered:
            //console.log("333333");
            const user = await User.findOne({ username: req.body.username });
            //console.log("AAAA");
            if (!user) return res.status(400).send("username or password wrong!");

            // check password:
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            //console.log("BBBB");
            if (!validPassword) return res.status(400).send("username or password wrong!");

            // create JWT and send it:
            const jwtExpiryDate = new Date().getTime() + AUTO_LOGOUT_TIME * 60 * 60 * 1000;
            const token = jwt.sign({ _id: user._id, privilege: user.privilege }, process.env.JWT_TOKEN_SECRET, { expiresIn: `${AUTO_LOGOUT_TIME}h` });

            res.status(200).send({ authToken: token, frontEndPrivilege: user.privilege, jwtExpiryDate: jwtExpiryDate });
            // MAKE SURE TO CATCH the auth-token HEADER AND SAVE IN LOCAL STORAGE
        } catch (error) {
            res.status(400).send("MongoDB error - Unable to find user even though password is correct: ", error);
        }
    },

    // user-only routes:

    // NO NEED FOR LOGOUT ROUTE SINCE WE ONLY CLEAR THE HEADERS FROM LOCAL STORAGE

    async changePassword(req, res) {
        try {
            const salty = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salty);

            await User.findOneAndUpdate({ _id: req.userId }, { password: hashedPassword });

            res.status(200).send("Successfully changed password! Please log in again.");
        } catch (error) {
            res.status(400).send("Error changing password: ", error);
        }
    },
};
