const { Strategy, ExtractJwt } = require('passport-jwt')
const applyPassportStrategy = passport => {
    const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = 'abcdefghijklmnopqrstuvwxyz';
    passport.use(
        new Strategy(options, (payload, done) => {
            return done(null, {
                email: 'user.email',
                _id: 'user[underscoreId]'
            });
            // User.findOne({ email: payload.email }, (err, user) => {
            //     if (err) return done(err, false);
            //     if (user) {
            //         return done(null, {
            //             email: user.email,
            //             _id: user[underscoreId]
            //         });
            //     }
            //     return done(null, false);
            // });
        })
    );
};
module.exports = applyPassportStrategy