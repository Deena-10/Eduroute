const session = require('express-session');
const passport = require('passport');
require('./config/passport');

app.use(session({
    secret: '80e3ddbfcf0dbbf552c9fd8b874e3f54de2d03a7886275f7acf4dfebeea2c14d850a79091b56b63d6f7931a5cf266de007f79a6b6effed37a544b61f46934ab9',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
