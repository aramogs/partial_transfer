const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const jwt = require('jsonwebtoken');

//Routes

router.get('/', routesController.index_GET);
router.get('/login/', routesController.login);
router.get('/mainMenu',verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/consultaFG',verifyToken, routesController.consultaFG_GET);
router.get('/transferFG',verifyToken, routesController.transferFG_GET);
router.get('/masterFG',verifyToken, routesController.masterFG_GET);
router.get('/master_fg_gm',verifyToken, routesController.master_FG_GM_GET);
router.post('/master_request_gm',verifyToken, routesController.master_request_GM_POST);
router.post('/master_request_gm_create',verifyToken, routesController.master_request_GM_CREATE_POST);
router.post('/postSeriales',verifyToken, routesController.postSerials_POST);
router.get('/movimiento_parcial', verifyToken, routesController.movimiento_parcial_GET);
router.get('/transferMP',verifyToken, routesController.transferMP_GET);
router.post('/postSerialesMP',verifyToken, routesController.postSerialsMP_POST);
router.post("/getInfo",verifyToken, routesController.getInfo_POST);
router.post("/getUbicaciones",verifyToken, routesController.getUbicaciones_POST);
router.post("/transferenciaMaterial", verifyToken, routesController.transferenciaMaterial_POST);
router.get('/conteo_ciclico',verifyToken, routesController.conteo_ciclico_GET);
router.get('/conteo_ciclico/:storage_type',verifyToken, routesController.conteoC_GET);
router.post("/getBinStatusReport",verifyToken, routesController.getBinStatusReport_POST);
router.post("/postCycleSU",verifyToken, routesController.postCycleSU_POST);

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