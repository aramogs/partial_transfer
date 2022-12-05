const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')
const multer = require('multer')
const upload = multer()
//Routes

router.get('/', routesController.index_GET);
router.get('/login', middleware.loginVerify, routesController.login);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/mainMenu',middleware.verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);



// router.post('/postSeriales',middleware.verifyToken, routesController.postSerials_POST);

router.post('/verify_hashRedis', routesController.verify_hashRedis_POST);


router.get('/conteo_ciclico',middleware.verifyToken, routesController.conteo_ciclico_GET);
router.get('/conteo_ciclico/:storage_type',middleware.verifyToken, middleware.macFromIP, routesController.conteoC_GET);
router.post("/getBinStatusReport",middleware.verifyToken, middleware.macFromIP, routesController.getBinStatusReport_POST);
router.post("/postCycleSU",middleware.verifyToken, middleware.macFromIP, routesController.postCycleSU_POST);



// ##############Raw Material##################
router.get('/movimiento_parcial', middleware.verifyToken, routesController.movimiento_parcial_GET);
router.post("/getInfoMP",middleware.verifyToken, middleware.macFromIP, routesController.getInfoMP_POST);
router.post("/transferenciaMaterialMP", middleware.verifyToken, middleware.macFromIP, routesController.transferenciaMaterialMP_POST);
router.get('/transferMP',middleware.verifyToken, routesController.transferMP_GET);
router.get('/transferMP/:storage_type',middleware.verifyToken, middleware.macFromIP, routesController.transferMP_ST_GET);
router.post('/postSerialesMP',middleware.verifyToken, middleware.macFromIP, routesController.postSerialsMP_POST);
router.get('/transfer_MP_FIFO',middleware.verifyToken, routesController.transfer_MP_FIFO_GET);
router.get('/transfer_MP_FIFO/:storage_type',middleware.verifyToken, routesController.transferMP_FIFO_GET);
router.get('/consultaMP',middleware.verifyToken, routesController.consultaMP_GET);
router.get('/consultaMP/:storage_type',middleware.verifyToken, routesController.consultaMP_ST_GET);
router.post('/postSerialesMP_RAW',middleware.verifyToken,  middleware.macFromIP, routesController.postSerialsMP_RAW_POST);
router.post('/postSerialesMP1_RAW',middleware.verifyToken,  middleware.macFromIP, routesController.postSerialsMP1_RAW_POST);
router.post('/getRawFIFO', middleware.verifyToken,  middleware.macFromIP, routesController.getRawFIFO_POST);
router.post('/getRawFIFOSerial', middleware.verifyToken,  middleware.macFromIP, routesController.getRawFIFOSerial_POST);
router.post('/getRawFIFOMP1', middleware.verifyToken,  middleware.macFromIP, routesController.getRawFIFOMP1_POST);
router.get('/getRawListado', middleware.verifyToken, routesController.getRawListado_GET);
router.get('/getRawListadoProcesado', middleware.verifyToken, routesController.getRawListadoProcesado_GET);
router.post("/getUbicacionesMPSerial",middleware.verifyToken, middleware.macFromIP, routesController.getUbicacionesMPSerial_POST);
router.post("/getUbicacionesMPMaterial",middleware.verifyToken, middleware.macFromIP, routesController.getUbicacionesMPMaterial_POST);
router.get('/cargaListado', middleware.sspi, routesController.cargaListado_GET);
router.post('/getListado',routesController.getListado_POST);
router.get('/getTurnos',routesController.getTurnos_GET);
router.post('/verificarSAP/:id_carga', middleware.sspi, upload.single("excelFile"), middleware.macFromIP, routesController.verificarSAP_POST);
router.get('/editarListado/:fecha?', middleware.sspi, routesController.editarListado_GET);
router.post('/tablaListado', routesController.tablaListado_POST);
router.post('/idListadoInfo',routesController.idListadoInfo_POST);
router.post('/cancelarIdListado',routesController.cancelarIdListado_POST);
router.post('/editarIdListado',routesController.editarIdListado_POST);
router.post('/checkSap',routesController.checkSap_POST);
router.post('/reprintLabel',routesController.reprintLabel_POST);

// ##############Finish Goods##################
router.get('/consultaFG',middleware.verifyToken, routesController.consultaFG_GET);
router.get('/consultaFG2',middleware.verifyToken, routesController.consultaFG2_GET);
router.get('/transferFG',middleware.verifyToken, middleware.macFromIP, routesController.transferFG_GET);
router.get('/masterFG',middleware.verifyToken, routesController.masterFG_GET);

router.post("/getUbicacionesFG",middleware.verifyToken, middleware.macFromIP, routesController.getUbicacionesFG_POST);
router.post('/postSerialesRedisFG',middleware.verifyToken, middleware.macFromIP, routesController.postSerialsFG_POST);

// ##############Master GM##################
router.get('/master_fg_gm',middleware.verifyToken, routesController.master_FG_GM_GET);
router.post('/master_request_gm',middleware.verifyToken, middleware.macFromIP, routesController.master_request_GM_POST);
router.post('/master_request_gm_create',middleware.verifyToken, middleware.macFromIP, routesController.master_request_GM_CREATE_POST);

// ##############Extrusion##################
router.get('/consultaEXT',middleware.verifyToken, routesController.consultaEXT_GET);
router.get('/transferEXT',middleware.verifyToken, routesController.transferEXT_GET);
router.post("/getUbicacionesEXTMandrel",middleware.verifyToken, middleware.macFromIP, routesController.getUbicacionesEXTMandrel_POST);
router.post("/getUbicacionesEXTSerial",middleware.verifyToken, middleware.macFromIP, routesController.getUbicacionesEXTSerial_POST);
router.post('/postSerialesRedisEXT',middleware.verifyToken, middleware.macFromIP, routesController.postSerialsEXT_POST);

// ##############Vulcanized##################
// router.get('/consultaVUL',middleware.verifyToken, routesController.consultaVUL_GET);
// router.get('/transferVUL',middleware.verifyToken, middleware.macFromIP, routesController.transferVUL_GET);
router.post("/getUbicacionesVULMaterial",  routesController.getUbicacionesVULMaterial_POST);
router.post("/getUbicacionesVULMandrel",  routesController.getUbicacionesVULMandrel_POST);
router.post("/getUbicacionesVULSerial",  routesController.getUbicacionesVULSerial_POST);
router.post('/transferVUL_Confirmed', routesController.transferVUL_Confirmed);

router.post('/transferVulProd', routesController.transferVulProd_POST);
router.post('/transferProdVul', routesController.transferProdVul_POST);

router.post('/auditoriaVUL', routesController.auditoriaVUL_POST);


// ##############Sub Assembly##################
router.post('/transferSemProd', routesController.transferSemProd_POST);
router.post('/transferProdSem', routesController.transferProdSem_POST);
// // router.get('*', (req, res) => {
// //   res.redirect('http://tftdelsrv001:3000/not_found');
// // });




module.exports = router;