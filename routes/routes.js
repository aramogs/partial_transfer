const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const jwt = require('jsonwebtoken');

//Routes

router.get('/', routesController.index_GET);
router.get('/login/', routesController.login);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/movimiento_parcial', verifyToken, routesController.movimiento_parcial_GET);
router.post("/getInfo", routesController.getInfo_POST);
router.post("/transferenciaMaterial", routesController.transferenciaMaterial_POST);

// // router.get('*', (req, res) => {
// //   res.redirect('http://tftdelsrv001:3000/not_found');
// // });


function verifyToken(req, res, next) {
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
                if (err) {
                    res.render('login.ejs')

                } else {

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

module.exports = router;