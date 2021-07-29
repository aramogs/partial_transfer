const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')
const multer = require('multer')
const upload = multer()
//Routes

router.get('/', routesController.index_GET);
router.get('/login/', routesController.login);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/mainMenu',middleware.verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/consultaFG',middleware.verifyToken, routesController.consultaFG_GET);
router.get('/transferFG',middleware.verifyToken, routesController.transferFG_GET);
router.get('/masterFG',middleware.verifyToken, routesController.masterFG_GET);
router.get('/master_fg_gm',middleware.verifyToken, routesController.master_FG_GM_GET);
router.post('/master_request_gm',middleware.verifyToken, routesController.master_request_GM_POST);
router.post('/master_request_gm_create',middleware.verifyToken, routesController.master_request_GM_CREATE_POST);
router.post('/postSeriales',middleware.verifyToken, routesController.postSerials_POST);
router.get('/movimiento_parcial', middleware.verifyToken, routesController.movimiento_parcial_GET);
router.get('/transferMP',middleware.verifyToken, routesController.transferMP_GET);
router.post('/postSerialesMP',middleware.verifyToken, routesController.postSerialsMP_POST);
router.post("/getInfo",middleware.verifyToken, routesController.getInfo_POST);
router.post("/getUbicaciones",middleware.verifyToken, routesController.getUbicaciones_POST);
router.post("/transferenciaMaterial", middleware.verifyToken, routesController.transferenciaMaterial_POST);
router.get('/conteo_ciclico',middleware.verifyToken, routesController.conteo_ciclico_GET);
router.get('/conteo_ciclico/:storage_type',middleware.verifyToken, routesController.conteoC_GET);
router.post("/getBinStatusReport",middleware.verifyToken, routesController.getBinStatusReport_POST);
router.post("/postCycleSU",middleware.verifyToken, routesController.postCycleSU_POST);
router.get('/cargaListado', middleware.sspi, routesController.cargaListado_GET);
router.post('/getListado',routesController.getListado_POST);
router.get('/getTurnos',routesController.getTurnos_GET);
router.post('/verificarSAP/:id_carga', middleware.sspi, upload.single("excelFile"), routesController.verificarSAP_POST);
router.get('/editarProgramacion/:fecha?', middleware.sspi, routesController.editarProgramacion_GET);
router.post('/tablaProgramacion', routesController.tablaProgramacion_POST);

// // router.get('*', (req, res) => {
// //   res.redirect('http://tftdelsrv001:3000/not_found');
// // });




module.exports = router;