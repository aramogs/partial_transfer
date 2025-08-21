const jwt = require('jsonwebtoken');
const nodeSSPI = require('node-sspi');
const middleware = {};

const macfromip = require('macfromip');

middleware.verifyToken = (req, res, next) => {
    if (!req.headers.cookie) {
        res.redirect("/login")
    } else {

        let cookies = (req.headers.cookie).split(";")
        let token_name
        let token_jwt

        cookies.forEach(cookie => {
            let Ttoken = (cookie.split("=")[0]).trim()
            let Tjwt = (cookie.split("=")[1]).trim()
            if (Ttoken == "accessToken") {
                token_name = Ttoken
                token_jwt = Tjwt
            }
        })


        if (token_name == "accessToken") {
            jwt.verify(token_jwt, 'tristone', (err, authData) => {
                if (err) {
                    res.render('login.ejs')

                } else {

                    res.clearCookie("accessToken");
                    res.cookie("accessToken", token_jwt, {
                        maxAge: 900000 /*10 Minutos*/,
                        httpOnly: false,
                        secure: false,
                        sameSite: 'lax',
                        path: '/',
                    })

                    res.locals.authData = authData
                    next()
                }
            })
        }
        else {
            res.render('login.ejs')
        }
    }
}

middleware.loginVerify = (req, res, next) => {
    if (!req.headers.cookie) {
        res.render('login.ejs')
    } else {

        let cookies = (req.headers.cookie).split(";")
        let token_name
        let token_jwt

        cookies.forEach(cookie => {
            let Ttoken = (cookie.split("=")[0]).trim()
            let Tjwt = (cookie.split("=")[1]).trim()
            if (Ttoken == "accessToken") {
                token_name = Ttoken
                token_jwt = Tjwt
            }
        })


        if (token_name == "accessToken") {
            jwt.verify(token_jwt, 'tristone', (err, authData) => {
                res.redirect("/mainMenu")
            })
        } else {
            res.render('login.ejs')
        }

    }
}

middleware.sspi = (req, res, next) => {
    let nodeSSPIObj = new nodeSSPI({
        retrieveGroups: true,

    });
    nodeSSPIObj.authenticate(req, res, function (err) {
        res.finished || next()
    });
}

function validMac(mac) {
    return /^[0-9a-f]{1,2}([.:-])[0-9a-f]{1,2}(?:\1[0-9a-f]{1,2}){4}$/.test(mac)
}

const regex = /::ffff:/gm;

middleware.macFromIP = (req, res, next) => {
    const regex = /::ffff:/gm;
    // Get IP address with better fallback logic
    let ip = null;
    // Try different sources in order of preference
    if (req.ip && req.ip !== '::1') {
        ip = req.ip;
    } else if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    } else if (req.headers['x-real-ip']) {
        ip = req.headers['x-real-ip'];
    } else if (req.connection.remoteAddress && req.connection.remoteAddress !== '::1') {
        ip = req.connection.remoteAddress;
    } else if (req.socket.remoteAddress && req.socket.remoteAddress !== '::1') {
        ip = req.socket.remoteAddress;
    } else if (req.connection.socket && req.connection.socket.remoteAddress && req.connection.socket.remoteAddress !== '::1') {
        ip = req.connection.socket.remoteAddress;
    }
    // Clean up the IP address
    if (ip && typeof ip === 'string') {
        ip = ip.replace(regex, "");
        if (ip === '::1') {
            ip = '127.0.0.1';
        }
    } else {
        ip = '127.0.0.1';
    }
    let localIp = (req.hostname || 'localhost').replace(regex, "");
    if (ip === "127.0.0.1" || ip === "::1" || ip === localIp) {
        res.locals.macIP = { "mac": "00-00-00-00-00-00", "ip": "127.0.0.1" }; 
        next();
    } else {
        macfromip.getMac(ip, (err, mac) => {
            if (err) {
                if (err === "The IP address cannot be self") {
                    res.locals.macIP = { "mac": "00-00-00-00-00-00", "ip": ip }; 
                    next();
                } else {
                    res.locals.macIP = { "mac": "00-00-00-00-00-00", "ip": ip }; 
                    next();
                }
            } else if (!validMac(mac)) {
                res.render('mac_invalida.ejs', { mac });
            } else {
                res.locals.macIP = { "mac": mac, "ip": ip }; 
                next();
            }
        });
    }
}

// Define an async wrapper for the getMac function
const getMacAsync = (ip) => {
    return new Promise((resolve, reject) => {
        macfromip.getMac(ip, (err, mac) => {
            if (err) {
                reject(err);
            } else {
                resolve(mac);
            }
        });
    });
};


module.exports = middleware;