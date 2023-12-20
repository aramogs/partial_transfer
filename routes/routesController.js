const controller = {};
//Require RabbitMQ
var amqp = require('amqplib/callback_api');
// Require Jason Web Token
const jwt = require('jsonwebtoken');
//Require ExcelJs
const Excel = require('exceljs');
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');
//Require Redis
const redis = require('redis');
//Require Axios
const axios = require('axios');
const { json } = require('body-parser');



controller.index_GET = (req, res) => {
    user = req.connection.user
    res.render('index.ejs', {
        user
    });
}

controller.login = (req, res) => {
    res.render('login.ejs', {
    });
}

controller.accesoDenegado_GET = (req, res) => {
    user = req.connection.user
    res.render('acceso_denegado.ejs', {
        user
    });
}

controller.mainMenu_GET = (req, res) => {

    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('main_menu.ejs', {
        user_id,
        user_name
    })
}

controller.userAccess_POST = (req, res) => {
    let user_id = req.body.user
    funcion.getUsers(user_id)
        .then((result) => {
            if (result.length == 1) {
                emp_nombre = result[0].emp_name

                accessToken(user_id, emp_nombre)
                    .then((result) => {
                        cookieSet(req, res, result)
                    })
                    .catch((err) => { res.json(err); })

            } else {
                res.json("unathorized")
            }
        })
        .catch((err) => { res.json(err) })
}





function accessToken(user_id, user_name) {
    return new Promise((resolve, reject) => {
        const id = { id: `${user_id}`, username: `${user_name}` }
        jwt.sign({ id }, `tristone`, { /*expiresIn: '1h'*/ }, (err, token) => {
            resolve(token)
            reject(err)
        })
    })
}


function cookieSet(req, res, result) {

    let minutes = 15;
    const time = minutes * 60 * 1000;

    res.cookie('accessToken', result,
        {
            maxAge: time,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
    res.json(result)

}

function acceso(req) {
    let acceso = []
    let userGroups = req.connection.userGroups

    return new Promise((resolve, reject) => {
        userGroups.forEach(element => {
            if (element.toString() === 'TFT\\TFT.DEL.PAGES_PT_Pedido') {
                acceso.push(element.toString())
            }
        });
        acceso.length == 0 ? reject("noAccess") : resolve(acceso)
    })

}

controller.consultaFG_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_fg.ejs', {
        user_id,
        user_name
    })
}

controller.consultaFG2_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_fg2.ejs', {
        user_id,
        user_name
    })
}

controller.transferFG_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    let estacion = req.res.locals.macIP.mac
    res.render('transfer_fg.ejs', {
        user_id,
        user_name,
        estacion
    })
}

controller.masterFG_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('master_fg.ejs', {
        user_id,
        user_name
    })
}

controller.master_FG_GM_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('master_fg_gm.ejs', {
        user_id,
        user_name
    })
}

controller.master_PALLET_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('master_pallet.ejs', {
        user_id,
        user_name
    })
}

controller.movimiento_parcial_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('movimiento_parcial.ejs', {
        user_id,
        user_name
    })
}

controller.transferMP_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transfer_mp_st.ejs', {
        user_id,
        user_name
    })
}

controller.transferMP_ST_GET = (req, res) => {
    let storage_type = req.params.storage_type
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    let estacion = req.res.locals.macIP.mac

    res.render('transfer_mp.ejs', {
        user_id,
        user_name,
        storage_type,
        estacion
    })


}

controller.transfer_MP_FIFO_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('movimiento_fifo_st.ejs', {
        user_id,
        user_name
    })
}

controller.consultaEXT_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_ext.ejs', {
        user_id,
        user_name
    })
}

controller.transferEXT_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transfer_ext.ejs', {
        user_id,
        user_name
    })
}

controller.conteo_ciclico_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('conteo_ciclico_st.ejs', {
        user_id,
        user_name
    })
}

controller.conteoC_GET = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let storage_type = req.params.storage_type
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('conteoC.ejs', {
        user_id,
        user_name,
        storage_type,
        estacion
    })
}

controller.master_request_GM_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}",  
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_fg_gm")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.master_request_GM_CREATE_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let lower_gr_date = req.body.lower_gr_date
    let single_container = req.body.single_container


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}",  
            "user_id":"${user_id}",
            "lower_gr_date":"${lower_gr_date}",
            "single_container":"${single_container}"
        }`

    amqpRequest(send, "rpc_fg_gm")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}


controller.postSerialsFG_POST = async (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let storage_bin = req.body.storage_bin.toUpperCase()

    let serials_array = serial.split(",")
    let promises = [];
    let errorsArray = [];


    const result_getStorageLocation = await funcion.getStorageLocation(estacion);
    const binExists = await funcion.sapRFC_SbinOnStypeExists("FG", storage_bin)

    if (binExists.length === 0) {
        res.json([{ "key": `Storage Bin ${storage_bin} not found in Storage Type FG`, "abapMsgV1": "ALL" }]);
    } else {
        const innerPromises = serials_array.map(async (serial_) => {
            const result_consultaStorageUnit = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial_, 20));
            if (result_consultaStorageUnit.length === 0) {
                errorsArray.push({ "key": `Check SU ${serial_}`, "abapMsgV1": `${serial_}` });
            } else if (result_consultaStorageUnit[0].LGORT !== result_getStorageLocation[0].storage_location) {
                errorsArray.push({ "key": `HU is in a different storage location`, "abapMsgV1": `${serial_}` });
            } else {
                promises.push(await funcion.sapRFC_transferFG(serial_, storage_bin))
            }
        });
        await Promise.all(innerPromises);
        await Promise.all(promises);
        const newArray = promises.concat(errorsArray);
        res.json(newArray);
    }
}

controller.getBinStatusReportFG_POST = async (req, res) => {
    const estacion = req.res.locals.macIP.mac
    const storage_bin = req.body.storage_bin;
    const storage_type = req.body.storage_type;

    try {
        const result = await funcion.sapRFC_SbinOnStypeExists(storage_type, storage_bin);
        if (result.length === 0) {
            return res.json({ key: `Storage Bin "${storage_bin}" does not exist at Storage Type "${storage_type}"` });
        } else {
            const resultSL = await funcion.getStorageLocation(estacion);

            if (resultSL.length === 0) {
                return res.json({ key: `Storage Location not set for device "${estacion}"` });
            }

            const storageLocation = resultSL[0].storage_location;
            const storageBinInfo = await funcion.sapRFC_consultaStorageBin(storageLocation, storage_type, storage_bin);

            const info_list = storageBinInfo.map(element => ({
                storage_unit: parseInt(element.LENUM)
            }));

            return res.json({ info_list, error: "N/A" });
        }
    } catch (err) {
        return res.json({ error: "An error occurred" });
    }
};


controller.verify_hashRedis_POST = (req, res) => {

    let estacion_hash = (req.body.estacion).replace(/:/g, "-")
    async function getStatus() {
        const redis_client = redis.createClient({ host: `${process.env.DB_REDIS_SERVER}` });
        redis_client.on('error', err => (console.error("error", err)))
        redis_client.get(estacion_hash, function (err, reply) { res.json(reply) });
        redis_client.quit()

    }
    getStatus()
}

controller.postSerialsMP_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const serial = req.body.serial;
        const proceso = req.body.proceso;
        const storage_bin = req.body.storage_bin;
        const storage_type = req.body.storage_type;
        const user_id = req.res.locals.authData.id.id;

        const serials_array = serial.split(",");
        const promises = serials_array.map(async (serial_) => {
            try {
                return await funcion.sapRFC_transferMP(serial_, storage_type, storage_bin, user_id, estacion);
            } catch (err) {
                return err;
            }
        });

        const results = await Promise.all(promises);
        res.json(results);
    } catch (error) {
        res.json(error);
    }
};


controller.getUbicacionesMPSerial_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const serial = req.body.serial;
        const storage_type = req.body.storage_type;


        const serialResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        if (serialResult.length === 0) {
            return res.json({ key: "Check Serial Number" });
        }
        if (serialResult[0].LGORT !== storage_location) {
            return res.json({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        }
        if (serialResult[0].LGTYP.trim("") !== storage_type) {
            return res.json({ key: "Storage Types do not match", abapMsgV1: `${serial}` });
        }

        const storageUnit = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const materialInfo = await funcion.sapRFC_consultaMaterial_ST(storageUnit[0].MATNR, storage_location, storage_type);

        res.json(materialInfo)

    } catch (error) {
        res.json(error);
    }
}


controller.getUbicacionesMPMaterial_POST = async (req, res) => {
    try {
        const material = req.body.material;
        const storage_type = req.body.storage_type;
        const estacion = req.res.locals.macIP.mac;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        const resultado = await funcion.sapRFC_consultaMaterial_ST(material, storage_location, storage_type);

        res.json(resultado);
    } catch (error) {
        res.json(error);
    }
}


controller.getUbicacionesFG_POST = async (req, res) => {
    let estacion = req.res.locals.macIP.mac
    const serial = req.body.serial;
    try {

        const storageLocation = await funcion.getStorageLocation(estacion);
        const serialResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storage_location = storageLocation[0].storage_location;
        if (serialResult.length === 0) {
            return res.json({ key: "Check Serial Number" });
        } else if (serialResult[0].LGORT !== storage_location) {
            return res.json({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            const materialResult = await funcion.sapRFC_consultaMaterial(serialResult[0].MATNR, storage_location);
            return res.json(materialResult);
        }
    } catch (err) {
        return res.json(err);
    }
};


controller.getInfoMP_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const serial = req.body.serial;
        const proceso = req.body.proceso;
        const user_id = req.res.locals.authData.id.id;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storageUnitResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storage_location = storageLocation[0].storage_location;

        if (storageUnitResult.length === 0) {
            const response = {
                serial,
                material: null,
                material_description: null,
                material_w: null,
                cantidad: null,
                certificate_number: "",
                error: `Storage Unit: ${serial} Not Found`
            };
            res.json(response);
        } else if (storageUnitResult[0].LGORT !== storage_location) {
            const response = {
                serial,
                material: null,
                material_description: null,
                material_w: null,
                cantidad: null,
                certificate_number: "",
                error: `Storage Locations do not match`
            };
            res.json(response);
        } else {
            const storageUnit = storageUnitResult[0];
            const certificate_number = (storageUnit.ZEUGN || "").trim();
            const material_number = (storageUnit.MATNR || "").trim();
            const stock_quantity = (storageUnit.VERME || "").trim();
            const storage_type = (storageUnit.LGTYP || "").trim();

            if (storage_type !== "MP") {
                const response = {
                    serial,
                    material: material_number,
                    material_description: "",
                    material_w: "",
                    cantidad: Number(stock_quantity),
                    certificate_number,
                    error: `Storage Unit: ${serial} From Storage Type: ${storage_type} Not Permitted`
                };
                res.json(response);
            } else {
                const materialInfo = await funcion.sapRFC_ConsultaMaterialMM03(material_number);
                const material_description = materialInfo.MATERIAL_GENERAL_DATA.MATL_DESC || "";
                const material_w = materialInfo.MATERIAL_GENERAL_DATA.GROSS_WT || "";

                const response = {
                    serial,
                    material: material_number,
                    material_description,
                    material_w,
                    cantidad: Number(stock_quantity),
                    certificate_number,
                    error: ""
                };
                res.json(response);
            }
        }
    } catch (error) {
        res.json({ error });
    }
};




controller.transferenciaMaterialMP_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const serial = req.body.serial;
        const material = req.body.material;
        const cantidad = req.body.cantidad;
        const proceso = req.body.proceso;
        const material_description = req.body.material_description;
        const certificate_number = req.body.certificate_number;
        const cantidad_restante = req.body.cantidad_restante;
        const user_id = req.body.user_id;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        if (storage_location == "0011") {
            from_storage_type = "MP"
            to_storage_type = "102"
            to_storage_bin = "104"
        }
        if (storage_location == "0001") {
            from_storage_type = "MP"
            to_storage_type = "100"
            to_storage_bin = "102"
        }


        const result = await funcion.sapRFC_partialTransferStorageUnit(material, cantidad, storage_location, from_storage_type, serial, to_storage_type, to_storage_bin);
        const transfer_order = result.E_TANUM;

        const response = {
            serial,
            material,
            cantidad,
            result: transfer_order,
            error: "N/A"
        };

        const printerResult = await funcion.getPrinter(estacion);
        const printer = printerResult[0].impre;

        const dataTRA = { labels: "1", printer, cantidad: cantidad_restante, descripcion: material_description, lote: certificate_number, material, serial };
        const dataTRAB = { labels: "1", printer, cantidad, descripcion: material_description, lote: certificate_number, material, serial };

        await funcion.printLabelTRA(dataTRAB, "TRAB");
        if (cantidad_restante > 0) {
            await funcion.printLabelTRA(dataTRA, "TRA");
        }

        await funcion.insertPartialTransfer(user_id, material, serial, estacion, transfer_order);

        res.json(response);
    } catch (error) {
        res.json(error);
    }
};


controller.getBinStatusReport_POST = async (req, res) => {
    const estacion = req.res.locals.macIP.mac
    const storage_bin = req.body.storage_bin;
    const storage_type = req.body.storage_type;

    try {
        const result = await funcion.sapRFC_SbinOnStypeExists(storage_type, storage_bin);
        if (result.length === 0) {
            return res.json({ key: `Storage Bin "${storage_bin}" does not exist at Storage Type "${storage_type}"` });
        } else {
            const resultSL = await funcion.getStorageLocation(estacion);

            if (resultSL.length === 0) {
                return res.json({ key: `Storage Location not set for device "${estacion}"` });
            }

            const storageLocation = resultSL[0].storage_location;
            const storageBinInfo = await funcion.sapRFC_consultaStorageBin(storageLocation, storage_type, storage_bin);

            const info_list = storageBinInfo.map(element => ({
                storage_unit: parseInt(element.LENUM)
            }));

            return res.json({ info_list, error: "N/A" });
        }
    } catch (err) {
        return res.json({ error: "An error occurred" });
    }
};

controller.getBinStatusReportEXT_POST = async (req, res) => {
    const estacion = req.body.estacion;
    const storage_bin = req.body.storage_bin;
    const storage_type = req.body.storage_type;

    try {
        const result = await funcion.sapRFC_SbinOnStypeExists(storage_type, storage_bin);
        if (result.length === 0) {
            return res.json({ key: `Storage Bin "${storage_bin}" does not exist at Storage Type "${storage_type}"` });
        } else {
            const resultSL = await funcion.getStorageLocation(estacion);

            if (resultSL.length === 0) {
                return res.json({ key: `Storage Location not set for device "${estacion}"` });
            }

            const storageLocation = resultSL[0].storage_location;
            const storageBinInfo = await funcion.sapRFC_consultaStorageBin(storageLocation, storage_type, storage_bin);

            const info_list = storageBinInfo.map(element => ({
                storage_unit: parseInt(element.LENUM)
            }));

            return res.json({ info_list, error: "N/A" });
        }
    } catch (err) {
        return res.json({ error: "An error occurred" });
    }
};


controller.getBinStatusReportVUL_POST = async (req, res) => {
    const estacion = req.body.estacion;
    const storage_bin = req.body.storage_bin;
    const storage_type = req.body.storage_type;

    try {
        const storageBinExists = await funcion.sapRFC_SbinOnStypeExists(storage_type, storage_bin);
        if (storageBinExists.length === 0) {
            res.json({ "key": `Storage Bin "${storage_bin}" does not exist at Storage Type "${storage_type}"` });
        } else {
            const resultSL = await funcion.getStorageLocation(estacion);

            if (resultSL.length === 0) {
                return res.json({ "key": `Storage Location not set for device "${estacion}"` });
            }
            const storageLocation = resultSL[0].storage_location;
            const result = await funcion.sapRFC_consultaStorageBin(storageLocation, storage_type, storage_bin);
            const info_list = result.map(element => { return { "storage_unit": parseInt(element.LENUM) }; });
            res.json({ "info_list": info_list, "error": "N/A" });


        }
    } catch (err) {
        res.json({ "error": "An error occurred" });
    }
};


controller.postCycleSU_POST = async (req, res) => {
    let storage_bin = req.body.storage_bin
    let user_id = req.body.user_id
    let storage_type = req.body.storage_type
    let listed_storage_units = req.body.listed_storage_units
    let unlisted_storage_units = req.body.unlisted_storage_units
    let not_found_storage_units = req.body.not_found_storage_units
    let st = ""
    let sb = ""
    let listed_storage_units_promises = []
    let unlisted_storage_units_promises = []
    let not_found_storage_units_promises = []
    let estacion = req.res.locals.macIP.mac

    switch (storage_type) {
        case "FG":
            st = "901"
            sb = "CICLICOFG"
            break;
        case "MP1":
            st = storage_type
            sb = "CICLICRAW1"
            break;
        case "MP":
            st = storage_type
            sb = "CICLICORAW"
            break;
        case "EXT":
            st = storage_type
            sb = "CICLICOEXT"
            break;
        case "VUL":
            st = storage_type
            sb = "CICLICOVUL"
            break;
        default:
            res.json(JSON.stringify({ "key": `Storage Type: "${storage_type}" not configured for Cycle Control` }))
            break;
    }

    const resultSL = await funcion.getStorageLocation(estacion);

    if (resultSL.length === 0) {
        return res.json({ key: `Storage Location not set for device "${estacion}"` });
    }

    let storage_location = resultSL[0].storage_location


    if (listed_storage_units.length > 0) {
        listed_storage_units.forEach(element => {
            listed_storage_units_promises.push(funcion.dBinsert_cycle_Listed_storage_units(storage_type, storage_bin.toUpperCase(), [element], user_id)
                .catch((err) => { return err }))
        })
    }

    if (not_found_storage_units.length > 0) {
        not_found_storage_units.forEach(element => {
            not_found_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, st, sb)
                .catch((err) => { return err }))
        })

    }

    if (unlisted_storage_units.length > 0) {
        unlisted_storage_units.forEach(element => {
            unlisted_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, storage_type, storage_bin)
                .catch((err) => { return err }))
        })
    }


    if (listed_storage_units.length == 0 && unlisted_storage_units.length == 0 && not_found_storage_units.length == 0) {
        funcion.dBinsert_cycle_result(storage_type, storage_bin, "", user_id, "OK-BIN", "")
    }

    const lsup = Promise.all(listed_storage_units_promises)
    const nfsup = Promise.all(not_found_storage_units_promises)
    const usup = Promise.all(unlisted_storage_units_promises)
    let response_list = []
    Promise.all([lsup, nfsup, usup])
        .then(result => {
            let lsup_result = result[0]
            let nfsup_result = result[1]
            let usup_result = result[2]

            nfsup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "NOSCAN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "NOSCAN", element.E_TANUM)
                }

            })

            usup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "WRONGBIN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "WRONGBIN", element.E_TANUM)
                }
            })

            res.json(response_list)
        })
        .catch(err => { })
}

controller.verificarAcreditacionFG_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    let estacion = req.res.locals.macIP.mac
    res.render('verificarAcreditacionFG.ejs', {
        user_id,
        user_name,
        estacion
    })
}

controller.postSerialesAcreditacionFG_POST = async (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial

    let serials_array = serial.split(",");
    const result_getStorageLocation = await funcion.getStorageLocation(estacion);
    const newArray = [];

    for (let i = 0; i < serials_array.length; i++) {
        let resultBackflush = await funcion.backflushFG(serials_array[i]);
        newArray.push(resultBackflush)
    }
    res.json(newArray);
}


controller.postCycleSUEXT_POST = async (req, res) => {

    let storage_bin = req.body.storage_bin
    let user_id = req.body.user_id
    let storage_type = req.body.storage_type
    let listed_storage_units = req.body.listed_storage_units == '' ? [] : req.body.listed_storage_units.split(",")
    let unlisted_storage_units = req.body.unlisted_storage_units == '' ? [] : req.body.unlisted_storage_units.split(",")
    let not_found_storage_units = req.body.not_found_storage_units == '' ? [] : req.body.not_found_storage_units.split(",")
    let st = ""
    let sb = ""
    let listed_storage_units_promises = []
    let unlisted_storage_units_promises = []
    let not_found_storage_units_promises = []
    let estacion = req.body.estacion

    switch (storage_type) {
        case "EXT":
            st = storage_type
            sb = "CICLICOEXT"
            break;
        default:
            res.json(JSON.stringify({ "key": `Storage Type: "${storage_type}" not configured for Cycle Control` }))
            break;
    }

    const resultSL = await funcion.getStorageLocation(estacion);

    if (resultSL.length === 0) {
        return res.json({ key: `Storage Location not set for device "${estacion}"` });
    }

    let storage_location = resultSL[0].storage_location


    if (listed_storage_units.length > 0) {
        listed_storage_units.forEach(element => {
            listed_storage_units_promises.push(funcion.dBinsert_cycle_Listed_storage_units(storage_type, storage_bin.toUpperCase(), [element], user_id)
                .catch((err) => { return err }))
        })
    }

    if (not_found_storage_units.length > 0) {
        not_found_storage_units.forEach(element => {
            not_found_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, st, sb)
                .catch((err) => { return err }))
        })

    }

    if (unlisted_storage_units.length > 0) {
        unlisted_storage_units.forEach(element => {
            unlisted_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, storage_type, storage_bin)
                .catch((err) => { return err }))
        })
    }


    if (listed_storage_units.length == 0 && unlisted_storage_units.length == 0 && not_found_storage_units.length == 0) {
        funcion.dBinsert_cycle_result(storage_type, storage_bin, "", user_id, "OK-BIN", "")
    }

    const lsup = Promise.all(listed_storage_units_promises)
    const nfsup = Promise.all(not_found_storage_units_promises)
    const usup = Promise.all(unlisted_storage_units_promises)
    let response_list = []
    Promise.all([lsup, nfsup, usup])
        .then(result => {
            let lsup_result = result[0]
            let nfsup_result = result[1]
            let usup_result = result[2]

            nfsup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "NOSCAN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "NOSCAN", element.E_TANUM)
                }

            })

            usup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "WRONGBIN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "WRONGBIN", element.E_TANUM)
                }
            })

            res.json(response_list)
        })
        .catch(err => { })
}

controller.handlingEXT_POST = async (req, res) => {
    console.log(req.body);
    try {
        let station = req.body.station
        let plan_id = req.body.plan_id
        let serial_num = req.body.serial_num
        let process = req.body.process
        let material = req.body.material
        let cantidad = req.body.cantidad
        let capacidad = req.body.capcacidad
        let numero_etiquetas = req.body.numero_etiquetas
        let line = req.body.line
        let impresoType = req.body.impresoType
        let operator_name = req.body.operator_name
        let operator_id = req.body.operator_id
        let processedResults = [];

        const resultSL = await funcion.getStorageLocation(station);
        if (resultSL.length === 0) { return res.json({ "key": `Storage Location not set for device "${station}"` }) }
        const storageLocation = resultSL[0].storage_location;


        for (let i = 0; i < numero_etiquetas; i++) {
            const resultHU = await funcion.sapRFC_HUEXT(storageLocation, material, cantidad)


            const labelData = await funcion.getPrinter(station);
            const materialResult = await funcion.materialEXT(material);

            const data = {
                printer: labelData[0].impre,
                no_sap: materialResult[0].no_sap,
                description: materialResult[0].description,
                cust_part: materialResult[0].cust_part,
                platform: materialResult[0].platform,
                rack: materialResult[0].rack,
                family: materialResult[0].family,
                length: materialResult[0].length,
                line: line,
                emp_num: operator_name,
                quant: cantidad,
                serial: parseInt(resultHU.HUKEY)
            };

            let printedLabel = await funcion.printLabel_EXT(data, "EXT")

            if (printedLabel.status === 200) {
                let result_update_plan_ext = await funcion.update_plan_ext(plan_id)
                let result_update_print_ext = await funcion.update_print_ext(parseInt(resultHU.HUKEY), plan_id, material, operator_id, cantidad, impresoType)
            } else {
                return res.json({ "key": `Testr` })
            }

            processedResults.push(resultHU);


        }

        res.json(processedResults)

    } catch (err) {
        res.json(err)
    }
}

controller.postCycleSUVUL_POST = async (req, res) => {
    let storage_bin = req.body.storage_bin
    let user_id = req.body.user_id
    let storage_type = req.body.storage_type
    let listed_storage_units = req.body.listed_storage_units == '' ? [] : req.body.listed_storage_units.split(",")
    let unlisted_storage_units = req.body.unlisted_storage_units == '' ? [] : req.body.unlisted_storage_units.split(",")
    let not_found_storage_units = req.body.not_found_storage_units == '' ? [] : req.body.not_found_storage_units.split(",")
    let st = ""
    let sb = ""
    let listed_storage_units_promises = []
    let unlisted_storage_units_promises = []
    let not_found_storage_units_promises = []
    let estacion = req.body.estacion

    switch (storage_type) {
        case "VUL":
            st = storage_type
            sb = "CICLICOVUL"
            break;
        default:
            res.json(JSON.stringify({ "key": `Storage Type: "${storage_type}" not configured for Cycle Control` }))
            break;
    }

    const resultSL = await funcion.getStorageLocation(estacion);

    if (resultSL.length === 0) {
        return res.json({ key: `Storage Location not set for device "${estacion}"` });
    }

    let storage_location = resultSL[0].storage_location


    if (listed_storage_units.length > 0) {
        listed_storage_units.forEach(element => {
            listed_storage_units_promises.push(funcion.dBinsert_cycle_Listed_storage_units(storage_type, storage_bin.toUpperCase(), [element], user_id)
                .catch((err) => { return err }))
        })
    }

    if (not_found_storage_units.length > 0) {
        not_found_storage_units.forEach(element => {
            not_found_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, st, sb)
                .catch((err) => { return err }))
        })

    }

    if (unlisted_storage_units.length > 0) {
        unlisted_storage_units.forEach(element => {
            unlisted_storage_units_promises.push(funcion.sapRFC_transferSlocCheck(element, storage_location, storage_type, storage_bin)
                .catch((err) => { return err }))
        })
    }


    if (listed_storage_units.length == 0 && unlisted_storage_units.length == 0 && not_found_storage_units.length == 0) {
        funcion.dBinsert_cycle_result(storage_type, storage_bin, "", user_id, "OK-BIN", "")
    }

    const lsup = Promise.all(listed_storage_units_promises)
    const nfsup = Promise.all(not_found_storage_units_promises)
    const usup = Promise.all(unlisted_storage_units_promises)
    let response_list = []
    Promise.all([lsup, nfsup, usup])
        .then(result => {
            let lsup_result = result[0]
            let nfsup_result = result[1]
            let usup_result = result[2]

            nfsup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "NOSCAN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "NOSCAN", element.E_TANUM)
                }

            })

            usup_result.forEach(element => {
                if (element.key) {
                    response_list.push({ "serial_num": parseInt(element.abapMsgV1), "result": "N/A", "error": element.key })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, element.abapMsgV1, user_id, "WRONGBIN-ERROR", element.key)
                } else {
                    response_list.push({ "serial_num": parseInt(element.I_LENUM), "result": element.E_TANUM, "error": "N/A" })
                    funcion.dBinsert_cycle_result(storage_type, storage_bin, parseInt(element.I_LENUM), user_id, "WRONGBIN", element.E_TANUM)
                }
            })

            res.json(response_list)
        })
        .catch(err => { })
}


controller.handlingVUL_POST = async (req, res) => {

    console.log(req.body);
    try {
        let station = req.body.station
        let material = req.body.material
        let cantidad = req.body.qty
        let subline = req.body.subline
        let P_material
        let _material


        const resultSL = await funcion.getStorageLocation(station);
        if (resultSL.length === 0) { return res.json({ "key": `Storage Location not set for device "${station}"` }) }
        const storageLocation = resultSL[0].storage_location;

        if (material.charAt(0) !== 'P') {
            P_material = 'P' + material;
            _material = material
        } else {
            P_material = material
            _material = material.substring(1)
        }

        const resultHU = await funcion.sapRFC_HUVUL(storageLocation, _material, cantidad)
        if (!resultHU.HUKEY) { return res.json({ "key": `Handling unit not created ` }) }
m
        const result_printVul = await funcion.printLabel_VUL(station, P_material, _material, cantidad, subline, resultHU.HUKEY)
        if (result_printVul.status !== 200) { return res.json({ "key": `Label print error check Bartender Server` }) }

        res.json(resultHU)

    } catch (err) {
        return res.json(err)
    }
}



controller.postVUL_POST = async (req, res) => {
    console.log(req.body);
    try {

        let station = req.body.station
        let serial_num = req.body.serial_num
        let material = req.body.material
        let cantidad = req.body.cantidad
        let P_material
        let _material


        if (material.charAt(0) !== 'P') {
            P_material = 'P' + material;
            _material = material
        } else {
            P_material = material
            _material = material.substring(1)
        }

        const resultSL = await funcion.getStorageLocation(station);
        if (resultSL.length === 0) { return res.json({ "key": `Storage Location not set for device "${station}"` }) }
        const storage_location = resultSL[0].storage_location;

        let resultBackflush = await funcion.backflushFG(serial_num);
        if (resultBackflush.E_RETURN.TYPE !== "S") {
            if (!resultBackflush.E_RETURN.MESSAGE.toLowerCase().includes('already posted')) {
                return res.json({ "key": `${resultBackflush.E_RETURN.MESSAGE}` })
            }
        }
        let resultTBNUM = await funcion.sapRFC_TBNUM(_material, cantidad)
        let resultTransfer = await funcion.sapRFC_transferVul_TR(serial_num, cantidad, "VUL", "TEMPB_VUL", resultTBNUM[0].TBNUM);


        res.json(resultTransfer);
    } catch (err) {
        res.json(err)
    }
}

controller.reprintLabelVUL_POST = async (req, res) => {

    try {
        let station = req.body.station
        let material = req.body.material
        let cantidad = req.body.cantidad
        let subline = req.body.subline
        let serial_num = req.body.serial_num
        let P_material
        let _material

        const resultSL = await funcion.getStorageLocation(station);
        if (resultSL.length === 0) { return res.json({ "key": `Storage Location not set for device "${station}"` }) }
        const storageLocation = resultSL[0].storage_location;

        if (material.charAt(0) !== 'P') {
            P_material = 'P' + material;
            _material = material
        } else {
            P_material = material
            _material = material.substring(1)
        }

        const result_printVul = await funcion.printLabel_VUL(station, P_material, _material, cantidad, subline, serial_num)
        if (result_printVul.status !== 200) { return res.json({ "key": `Label print error check Bartender Server` }) }

        res.json(result_printVul)

    } catch (err) {
        return res.json(err)
    }
}

controller.cargaListado_GET = (req, res) => {
    let user = req.connection.user
    let destino = req.params.destino
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_PT_Pedido") access = "ok"
            });
            if (access == "ok" && destino == "DEL" || destino == "DELX") {
                res.render("cargaListado.ejs", { user, destino })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}


controller.getTurnos_GET = (req, res) => {
    funcion.getTurnos()
        .then((result) => {

            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

controller.getListado_POST = (req, res) => {
    let fecha = req.body.fecha
    funcion.getListado(fecha)
        .then((result) => {

            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

const arreglosExcel = (bufferExcel) => {
    return new Promise((resolve, reject) => {

        // let numeros_actuales = numeros_sap.map(({ no_sap }) => no_sap)

        let arreglo = [];
        let titulos = [];
        let titulos2 = [];
        let valores = [];

        let count = 0;

        const wb = new Excel.Workbook();


        wb.xlsx.load(bufferExcel)
            .then(() => {
                worksheet = wb.worksheets[0]
                worksheet.eachRow(function (row, rowNumber) {
                    val = row.values
                    for (let i = 0; i < val.length; i++) {
                        if (val[i] === undefined) {
                            val[i] = " "
                        }
                    }
                    arreglo.push(val)
                });
            })
            .then(() => {

                for (let i = 0; i < arreglo.length; i++) {
                    arreglo[i].shift()
                }
                for (let i = 0; i < arreglo[0].length; i++) {
                    titulos.push(`\`${arreglo[0][i]}\``)
                    titulos2.push((arreglo[0][i]).toLowerCase())
                }
                for (let i = 1; i < arreglo.length; i++) {
                    valores.push(arreglo[i])
                    // if (!numeros_actuales.includes(arreglo[i][0])) reject("Verificar numeros SAP")

                }

            })
            .then(() => {
                for (let i = 0; i < titulos2.length; i++) {
                    if ((titulos2[i]).toLowerCase().includes("numero_sap") || (titulos2[i]).toLowerCase().includes("contenedores")) {
                        count++
                    }
                }
                if (2 == count) {

                    resolve([titulos, valores])
                } else {
                    reject("Verificar archivo de Excel")
                }
            })

    })
}

controller.verificarSAP_POST = async (req, res) => {
    try {
        const body = JSON.parse(req.body.data);

        const destino = req.params.id_carga;
        const turno = body.turno;
        const fecha = body.fecha
        const bufferExcel = req.file.buffer;
        const excel = await arreglosExcel(bufferExcel);
        const titulos = excel[0];
        const valoresArray = excel[1];
        let user = (req.res.socket.user).substring(4)

        const materialDescriptionPromises = valoresArray.map(async (element) => {
            const result = await funcion.sapRFC_materialDescription(element[0]);
            const materialDescription = result.MATERIAL_GENERAL_DATA.MATL_DESC;

            response = [
                element[0],
                materialDescription,
                element[1],
                user,
                fecha,
                turno,
                "Pendiente",
                destino
            ]
            return response
        });
        const extendedValores = await Promise.all(materialDescriptionPromises);
        funcion.insertRawDelivery(extendedValores)
        res.json(extendedValores);
    } catch (err) {
        res.json({ "message": err });
    }
};


controller.editarListado_GET = (req, res) => {

    user = req.connection.user
    destino = req.params.destino
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_PT_Pedido") access = "ok"
            });
            if (access == "ok") {
                res.render("editarListado.ejs", { user, destino })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}

controller.tablaListado_POST = (req, res) => {

    let fecha = req.body.fecha
    funcion.getListadoFecha(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { })

}

controller.idListadoInfo_POST = (req, res) => {

    let id = req.body.id
    funcion.getInfoIdListado(id)
        .then((result) => { res.json(result) })
        .catch((err) => { })


}

controller.cancelarIdListado_POST = (req, res) => {

    let idListado = req.body.id
    let motivo = req.body.motivo

    funcion.cancelarIdListado(idListado, motivo)
        .then((result) => { res.json(result) })
        .catch((err) => { })


}

controller.editarIdListado_POST = (req, res) => {

    let id = req.body.id
    let contenedores = req.body.contenedores
    funcion.editarIdListado(id, contenedores)
        .then((result) => { res.json(result) })
        .catch((err) => { })


}

controller.checkSap_POST = (req, res) => {

    let sap = req.body.sap

    funcion.checkSap(sap)
        .then((result) => { res.json(result) })
        .catch((err) => { })

}

controller.transferMP_FIFO_GET = (req, res) => {
    let storage_type = req.params.storage_type
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username

    if (storage_type === "MP") {
        res.render('transfer_mp_FIFO.ejs', {
            user_id,
            user_name,
            storage_type
        })
    } else if (storage_type === "MP1") {
        let destino = req.params.destino
        res.render('transfer_mp_FIFO_V.ejs', {
            user_id,
            user_name,
            storage_type,
            destino
        })
    }

}

controller.getRawFIFO_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const material = req.body.material;
        const storage_type = req.body.storage_type;


        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        const result = await funcion.sapRFC_consultaMaterial_ST(material, storage_location, storage_type);

        res.json(result);
    } catch (error) {

        res.json(error);
    }
};


controller.getRawFIFOSerial_POST = async (req, res) => {
    try {
        const serial = req.body.serial;
        const storage_type = req.body.storage_type
        const estacion = req.res.locals.macIP.mac;

        const serialResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        if (serialResult.length === 0) {
            return res.json({ key: "Check Serial Number" });
        }
        if (serialResult[0].LGORT !== storage_location) {
            return res.json({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        }
        if (serialResult[0].LGTYP.trim("").trim("") !== storage_type) {
            return res.json({ key: "Storage Types do not match", abapMsgV1: `${serial}` });
        }

        const materialInfo = await funcion.sapRFC_consultaMaterial_ST(serialResult[0].MATNR, "0011", storage_type);
        res.json(materialInfo);
    } catch (error) {

        res.json(error);
    }
};


controller.getRawFIFOMP1_POST = async (req, res) => {
    try {
        const estacion = req.res.locals.macIP.mac;
        const material = req.body.material;
        const storage_type = req.body.storage_type;
        const raw_id = req.body.raw_id;

        const count_res = await funcion.getRawMovements(raw_id);

        const [sapResult, countResult] = await Promise.all([funcion.sapRFC_consultaMaterial_ST(material, "0011", storage_type), count_res]);
        res.json([sapResult, countResult]);
    } catch (err) {
        res.send({ message: err });
    }
};


controller.postSerialsMP_RAW_POST = async (req, res) => {
    try {
        let estacion = req.res.locals.macIP.mac;
        let serial = req.body.serial;
        let storage_type = req.body.storage_type;
        let user_id = req.res.locals.authData.id.id;
        let raw_id = req.body.raw_id;
        let serials_obsoletos = req.body.serials_obsoletos;

        let serials_array = JSON.parse(`[${serial}]`)
        let serials_obsoletos_array = serials_obsoletos.split(",");
        let promises = [];
        let promises_obsoletos = [];
        let to_storage_type = "";
        let to_storage_bin = "";

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;
        const res_std_pack = await funcion.mpStdQuant(serials_array[0].part_number, "mp")
        const std_pack = res_std_pack.length > 0 ? res_std_pack[0].std_pack : 0;


        if (storage_location == "0011") {
            to_storage_type = "102"
            to_storage_bin = "104"
        }
        if (storage_location == "0001") {
            to_storage_type = "100"
            to_storage_bin = "102"
        }


        for (const serial_ of serials_array) {
            try {
                const result = await funcion.sapRFC_transferMP_BetweenStorageTypes(
                    funcion.addLeadingZeros(serial_.serial, 20),
                    to_storage_type,
                    to_storage_bin,
                    user_id,
                    raw_id
                );
                promises.push(result);
            } catch (err) {
                promises.push(err);
            }
        }

        res.json(promises);

        const result_printer = await funcion.getPrinter(estacion);

        if (std_pack == 0) {
            for (const element of promises) {

                let dataTRAB = {
                    "labels": `1`,
                    "printer": `${result_printer[0].impre}`,
                    "cantidad": `${parseInt(parseFloat(element.T_LTAP_VB[0].VISTA))}`,
                    "descripcion": `${element.T_LTAP_VB[0].MAKTX}`,
                    "lote": `${element.T_LTAP_VB[0].ZEUGN}`,
                    "material": `${element.T_LTAP_VB[0].MATNR}`,
                    "serial": `${(element.T_LTAP_VB[0].VLENR).replace(/^0+/gm, "")}`
                };
                await funcion.printLabelTRA(dataTRAB, "TRAB");

            }
        } else {

            for (const element of promises) {

                for (let i = 0; i < Math.ceil(element.T_LTAP_VB[0].VISTA / std_pack); i++) {
                    let dataTRAB = {
                        "labels": `1`,
                        "printer": `${result_printer[0].impre}`,
                        "cantidad": `${std_pack}`,
                        "descripcion": `${element.T_LTAP_VB[0].MAKTX}`,
                        "lote": `${element.T_LTAP_VB[0].ZEUGN}`,
                        "material": `${element.T_LTAP_VB[0].MATNR}`,
                        "serial": `${(element.T_LTAP_VB[0].VLENR).replace(/^0+/gm, "")}`
                    };
                    await funcion.printLabelTRA(dataTRAB, "TRAB");
                }

            }
        }




        if (serials_obsoletos_array[0] !== "") {
            for (const serial_ of serials_obsoletos_array) {
                try {
                    const result = await funcion.sapRFC_transferMP_Obsoletos(
                        funcion.addLeadingZeros(serial_, 20),
                        storage_type,
                        "CICLICORAW",
                        user_id,
                        raw_id
                    );
                } catch (err) {
                    // Handle the error if needed
                }
            }
        }
    } catch (err) {
        res.json(err);
    }
};


controller.postSerialsMP1_RAW_POST = async (req, res) => {
    const estacion = req.res.locals.macIP.mac;
    const serial = req.body.serial;
    const storage_type = req.body.storage_type;
    const user_id = req.res.locals.authData.id.id;
    const raw_id = req.body.raw_id;
    const shift = req.body.shift;
    const clear = req.body.clear;
    const serials_obsoletos = req.body.serials_obsoletos;
    let destino = req.body.destino;
    let storage_bin = "";

    try {
        if (clear !== "null") {
            await funcion.updateProcesado(raw_id);
        }

        if (shift === "T1") storage_bin = "ITVINDEL1";
        else if (shift === "T2") storage_bin = "ITVINDEL2";
        else if (shift === "T3") storage_bin = "ITVINDEL3";

        const serials_array = serial.split(",");
        const serials_obsoletos_array = serials_obsoletos.split(",");
        const promises = [];
        const promises_obsoletos = [];

        if (destino === "DEL") {
            for (const serial_ of serials_array) {
                try {
                    const result = await funcion.sapRFC_transferMP1_DEL(serial_, "MP", storage_bin, user_id, raw_id);
                    promises.push(result);
                } catch (err) {
                    promises.push(err);
                }
            }
        } else if (destino === "DELX") {
            for (const serial_ of serials_array) {
                try {
                    const resultMaterial = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial_, 20));
                    const result = await funcion.sapRFC_transferMP1_DELX(serial_, "MP", storage_bin, resultMaterial[0].MATNR, resultMaterial[0].GESME, user_id, raw_id);
                    promises.push(result);
                } catch (err) {
                    promises.push(err);
                }
            }
        }

        const result = await Promise.all(promises);
        res.json(result);

        if (serials_obsoletos_array[0] !== "") {
            for (const serial_ of serials_obsoletos_array) {
                try {
                    await funcion.sapRFC_transferMP_Obsoletos(funcion.addLeadingZeros(serial_, 20), storage_type, "CICLICRAW1", user_id, raw_id);
                } catch (err) {
                    // Handle the error if needed
                }
            }
        }
    } catch (err) {
        res.json({ message: err.message });
    }
};




controller.getRawListado_GET = async (req, res) => {
    try {
        const result = await funcion.getListadoPendiente();
        res.json(result);
    } catch (err) {

    }
};


controller.getRawListadoProcesado_GET = async (req, res) => {
    try {
        const result = await funcion.getListadoProcesado();
        res.json(result);
    } catch (err) {

        res.json({ error: 'An error occurred while fetching the list.' });
    }
};


controller.reprintLabel_POST = (req, res) => {

    let data = { "labels": `${req.body.labels}`, "printer": `${req.body.printer}`, "cantidad": `${req.body.quantity}`, "descripcion": `${req.body.material_description}`, "lote": `${req.body.certificate_number}`, "material": `${req.body.material}`, serial: `${req.body.serial_num}` };
    axios({
        method: 'POST',
        url: "http://10.56.99.30:8086/Integration/TRAB/Execute/",
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
    // .then((result) => { res.json(result) })
    // .catch((err) => { })

}

function amqpRequest(send, queue) {
    return new Promise((resolve, reject) => {
        var args = process.argv.slice(2);
        if (args.length == 0) {
            // console.error("Usage: rpc_client.js num");
            // process.exit(1);
        }

        amqp.connect(`amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_SERVER}`, function (error0, connection) {
            if (error0) {
                // throw error0;
                reject(error0)
            }
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    // throw error1;
                    reject(error1)
                }
                channel.assertQueue('', {
                    exclusive: true
                }, function (error2, q) {
                    if (error2) {
                        // throw error2;
                        reject(error2)
                    }
                    var correlationId = send.estacion;
                    console.log(' [x] Requesting: ', send);

                    channel.consume(q.queue, function (msg) {
                        if (msg.properties.correlationId == correlationId) {
                            console.log(' [x] Response:   ', msg.content.toString());
                            resolve(msg.content.toString())
                            setTimeout(function () {
                                connection.close();
                                // process.exit(0)
                            }, 500);

                        }
                    }, {
                        noAck: true
                    });

                    channel.sendToQueue(queue, Buffer.from(send.toString()), {
                        correlationId: correlationId,
                        replyTo: q.queue
                    });
                });
            });
        });
    })
}

controller.consultaMP_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_mp_st.ejs', {
        user_id,
        user_name
    })
}

controller.consultaMP_ST_GET = (req, res) => {
    let storage_type = req.params.storage_type
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_mp.ejs', {
        user_id,
        user_name,
        storage_type
    })
}

controller.consultaVUL_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consulta_vul.ejs', {
        user_id,
        user_name
    })
}

controller.transferVUL_GET = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transfer_vul.ejs', {
        user_id,
        user_name,
        estacion
    })
}


controller.transferVUL_Confirmed = async (req, res) => {
    let estacion = req.body.station
    let serial = req.body.serial
    let storage_bin = req.body.storage_bin.toUpperCase()
    let max_storage_unit_bin = 5

    let serials_array = serial.split(",")
    let promises = [];
    let errorsArray = [];


    const result_getStorageLocation = await funcion.getStorageLocation(estacion);
    const binExists = await funcion.sapRFC_SbinOnStypeExists("VUL", storage_bin)

    if (binExists.length === 0) {
        res.json([{ "key": `Storage Bin ${storage_bin} not found in Storage Type VUL`, "abapMsgV1": "ALL" }]);
    } else {
        const innerPromises = serials_array.map(async (serial_) => {
            const result_consultaStorageUnit = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial_, 20));
            if (result_consultaStorageUnit.length === 0) {
                errorsArray.push({ "key": `Check SU ${serial_}`, "abapMsgV1": `${serial_}` });
            } else if (result_consultaStorageUnit[0].LGORT !== result_getStorageLocation[0].storage_location) {
                errorsArray.push({ "key": `SU ${serial_} is in a different storage location`, "abapMsgV1": `${serial_}` });
            } else {
                promises.push(await funcion.sapRFC_transferVul(serial_, storage_bin))
            }
        });
        await Promise.all(innerPromises);
        await Promise.all(promises);
        const newArray = promises.concat(errorsArray);
        res.json(newArray);
    }
}



controller.getUbicacionesVULSerial_POST = async (req, res) => {
    const estacion = req.body.estacion;
    const serial = req.body.serial;
    const proceso = req.body.proceso;
    const user_id = req.body;
    try {

        const storageLocation = await funcion.getStorageLocation(estacion);
        const serialResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storage_location = storageLocation[0].storage_location;
        if (serialResult.length === 0) {
            return res.json({ key: "Check Serial Number" });
        } else if (serialResult[0].LGORT !== storage_location) {
            return res.json({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            const materialResult = await funcion.sapRFC_consultaMaterial(serialResult[0].MATNR, storage_location);
            return res.json(materialResult);
        }
    } catch (err) {
        return res.json(err);
    }
};

controller.getUbicacionesVULMaterial_POST = async (req, res) => {
    try {
        const estacion = req.body.estacion
        const material = req.body.material;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        const resultado = await funcion.sapRFC_consultaMaterial_ST(material, storage_location, "VUL");
        res.json(resultado);
    } catch (err) {
        res.json(err);
    }
};


controller.getUbicacionesVULMandrel_POST = async (req, res) => {
    try {
        const estacion = req.body.estacion;
        const mandrel = req.body.mandrel;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        const result = await funcion.sapFromMandrel(mandrel, "vulc");

        if (result.length === 0) {
            res.json({ "key": "Check Mandrel Number" });
        } else {
            const noSap = result[0].no_sap.substring(1);
            const materialResult = await funcion.sapRFC_consultaMaterial_ST(noSap, storage_location, "VUL");
            res.json(materialResult);
        }
    } catch (err) {
        res.json(err);
    }
};


controller.getUbicacionesEXTMandrel_POST = async (req, res) => {
    try {
        const estacion = req.body.station;
        const mandrel = req.body.mandrel;
        const proceso = req.body.proceso;
        const user_id = req.body;

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        const result = await funcion.sapFromMandrel(mandrel, "extr");

        if (result.length === 0) {
            return res.json({ key: "Check Mandrel Number" });
        } else {
            const materialResult = await funcion.sapRFC_consultaMaterial_ST(result[0].no_sap, storage_location, "EXT");
            return res.json(materialResult);
        }
    } catch (err) {
        return res.json(err);
    }
};



controller.getUbicacionesEXTSerial_POST = async (req, res) => {
    const estacion = req.body.station;
    const serial = req.body.serial;
    const proceso = req.body.proceso;
    const user_id = req.body;
    try {
        const storageLocation = await funcion.getStorageLocation(estacion);
        const serialResult = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const storage_location = storageLocation[0].storage_location;
        if (serialResult.length === 0) {
            return res.json({ key: "Check Serial Number" });
        } else if (serialResult[0].LGORT !== storage_location) {

            return res.json({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            const materialResult = await funcion.sapRFC_consultaMaterial(serialResult[0].MATNR, storage_location);
            return res.json(materialResult);
        }
    } catch (err) {
        return res.json(err);
    }
};



controller.postSerialsEXT_POST = async (req, res) => {
    let estacion = req.body.station
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let storage_bin = req.body.storage_bin.toUpperCase()
    let user_id = req.body
    let max_storage_unit_bin = 5

    let serials_array = serial.split(",")
    let promises = [];
    let errorsArray = [];


    const result_getStorageLocation = await funcion.getStorageLocation(estacion);
    const binExists = await funcion.sapRFC_SbinOnStypeExists("EXT", storage_bin)
    const result_consultaStorageBin = await funcion.sapRFC_consultaStorageBin(result_getStorageLocation[0].storage_location, "EXT", storage_bin);
    let serials_bin = serials_array.length + result_consultaStorageBin.length
    if (binExists.length === 0) {
        res.json([{ "key": `Storage Bin ${storage_bin} not found in Storage Type EXT`, "abapMsgV1": "ALL" }]);
    } else if (storage_bin[0] == "r" || storage_bin[0] == "R" && serials_bin > max_storage_unit_bin) {
        res.json([{ "key": `Exceeded amount of Storage Units per Bin: ${serials_bin - max_storage_unit_bin}` }]);
    } else {
        const innerPromises = serials_array.map(async (serial_) => {
            const result_consultaStorageUnit = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial_, 20));
            if (result_consultaStorageUnit.length === 0) {
                errorsArray.push({ "key": `Check SU ${serial_}`, "abapMsgV1": `${serial_}` });
            } else if (result_consultaStorageUnit[0].LGORT !== result_getStorageLocation[0].storage_location) {
                errorsArray.push({ "key": `SU ${serial_} is in a different storage location`, "abapMsgV1": `${serial_}` });
            } else {
                promises.push(await funcion.sapRFC_transferExt(serial_, storage_bin))
            }
        });
        await Promise.all(innerPromises);
        await Promise.all(promises);
        const newArray = promises.concat(errorsArray);
        res.json(newArray);
    }
}

controller.transferEXTRP_POST = async (req, res) => {

    let serial = req.body.serial
    let serials_array = serial.split(",")
    let promises = []
    let estacion = req.body.station;
    let errorsArray = [];
    let storage_type = ""
    let storage_bin = ""

    let resultEstacion = await funcion.getStorageLocation(estacion)
    let storage_location = resultEstacion[0].storage_location

    if (storage_location == "0012") {
        storage_type = "102"
        storage_bin = "GREEN"
    }
    if (storage_location == "0002") {
        storage_type = "100"
        storage_bin = "101"
    }

    const innerPromises = serials_array.map(async (serial_) => {
        let resultConsultaserial = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial_, 20))
        if (resultConsultaserial.length == 0) {
            errorsArray.push({ "key": `Check Serial Number not found`, "abapMsgV1": `${serial_}` })
        } else if (resultConsultaserial[0].LGTYP !== "EXT" || resultConsultaserial[0].LGORT !== storage_location) {
            errorsArray.push({ "key": `Check SU SType: ${resultConsultaserial[0].LGTYP}, SLocation: ${resultConsultaserial[0].LGORT}`, "abapMsgV1": `${serial_}` })
        } else {
            let resultTransferEXTRP = await funcion.sapRFC_transferExtRP(serial_, storage_type, storage_bin)
            promises.push(resultTransferEXTRP)
        }
    });

    await Promise.all(innerPromises);
    await Promise.all(promises);

    const newArray = promises.concat(errorsArray);
    res.json(newArray);
}


controller.transferEXTPR_POST = async (req, res) => {

    let material = req.body.material
    let cantidad = req.body.cantidad
    let cantidad_actual = 0
    let estacion = req.body.station
    let operador_name = req.body.operador_name

    let resultEstacion = await funcion.getStorageLocation(estacion)
    let storage_location = resultEstacion[0].storage_location

    if (storage_location == "0012") {
        storage_type = "102"
        storage_bin = "GREEN"
    }
    if (storage_location == "0002") {
        storage_type = "100"
        storage_bin = "101"
    }
    const materialData = await funcion.sapRFC_consultaMaterial_EXT(material, storage_location, storage_type, storage_bin);

    if (materialData.length === 0) {
        res.json({ key: "No Material available at selected location" });
    } else {
        let cantidad_actual = 0;
        materialData.forEach(element => {
            cantidad_actual += parseInt(element.GESME.replace(".000", ""));
        });

        if (cantidad_actual < parseInt(cantidad)) {
            const percentageExceeded = Math.round(
                ((parseInt(cantidad) - cantidad_actual) / cantidad_actual) * 100
            );
            res.json({
                key: `Requested amount exceeded by ${percentageExceeded}% of available material`
            });
        } else {
            const transferResult1 = await funcion.sapRFC_transferEXTPR_1(material, cantidad, storage_location, storage_type, storage_bin);
            const transferResult2 = await funcion.sapRFC_transferEXTPR_2(material, cantidad, storage_location);
            const labelData = await funcion.getPrinter(estacion);
            const materialResult = await funcion.materialEXT(material);

            const data = {
                printer: labelData[0].impre,
                no_sap: materialResult[0].no_sap,
                description: materialResult[0].description,
                cust_part: materialResult[0].cust_part,
                platform: materialResult[0].platform,
                rack: materialResult[0].rack,
                family: materialResult[0].family,
                length: materialResult[0].length,
                emp_num: operador_name,
                quant: cantidad,
                serial: parseInt(transferResult2.E_LTAP.NLENR)
            };

            await funcion.printLabelTRA(data, "EXT_RE");

            res.json(transferResult2.E_LTAP);
        }
    }
}

controller.auditoriaEXT_POST = async (req, res) => {
    try {
        let serial = req.body.serial
        let serials_array = serial.split(",")
        let estacion = req.body.station
        let storage_type
        let storage_bin
        const resultSL = await funcion.getStorageLocation(estacion);

        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }) }

        let storage_location = resultSL[0].storage_location

        if (storage_location == "0012") {
            storage_type = "102"
            storage_bin = "GREEN"
        }
        if (storage_location == "0002") {
            storage_type = "100"
            storage_bin = "101"
        }

        const promises = serials_array.map(serial_ =>
            funcion.sapRFC_transferEXTProd(serial_, storage_location, storage_type, storage_bin)
                .catch(error => ({ serial: serial_, error })) // Wrap errors in an object
        );

        const results = await Promise.all(promises);
        res.json(results)
    } catch (err) {
        res.json(err);
    }
}

controller.transferVulProd_POST = async (req, res) => {
    try {
        const serial = req.body.serial;
        const estacion = req.body.station

        const resultSL = await funcion.getStorageLocation(estacion);
        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }); }
        let storage_location = resultSL[0].storage_location

        if (storage_location == "0012") {
            storage_type = "102"
            storage_bin = "103"
        }
        if (storage_location == "0002") {
            storage_type = "100"
            storage_bin = "101"
        }

        let resultConsultaserial = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20))

        if (resultConsultaserial.length == 0) {
            return res.json({ "key": `Check Serial Number not found`, "abapMsgV1": `${serial}` })
        } else if (resultConsultaserial[0].LGTYP !== "VUL" || resultConsultaserial[0].LGORT !== storage_location) {
            return res.json({ "key": `Check SU SType: ${resultConsultaserial[0].LGTYP}, SLocation: ${resultConsultaserial[0].LGORT}`, "abapMsgV1": `${serial}` })
        } else {
            const result = await funcion.sapRFC_transferVULProd(serial, storage_location, storage_type, storage_bin);
            return res.json(result.T_LTAK[0]);
        }


    } catch (err) {
        res.json(err);
    }
};


controller.transferProdVul_POST = async (req, res) => {
    try {

        const material = req.body.material;
        const qty = req.body.qty;
        const estacion = req.body.station

        const resultSL = await funcion.getStorageLocation(estacion);
        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }); }
        let storage_location = resultSL[0].storage_location

        if (storage_location == "0012") {
            from_storage_type = "102"
            from_storage_bin = "103"
            to_storage_type = "VUL"
            to_storage_bin = "TEMPR_VUL"
        }
        if (storage_location == "0002") {
            from_storage_type = "100"
            from_storage_bin = "101"
            to_storage_type = "VUL"
            to_storage_bin = "TEMPR_VUL"
        }

        const result1 = await funcion.sapRFC_transferProdVul_1(material, qty, storage_location, from_storage_type, from_storage_bin);   //0012, 102, 103
        const result2 = await funcion.sapRFC_transferProdVul_2(material, qty, storage_location, to_storage_type, to_storage_bin);       //0012, VUL, TEMPR_VUL

        res.json(result2.E_LTAP);
    } catch (err) {
        res.json(err);
    }
};


controller.auditoriaVUL_POST = async (req, res) => {

    try {
        const serial = req.body.serial;
        const serials_array = serial.split(",");
        let estacion = req.body.station
        let storage_type
        let storage_bin
        const resultSL = await funcion.getStorageLocation(estacion);
        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }) }

        let storage_location = resultSL[0].storage_location


        if (storage_location == "0012") {
            storage_type = "102"
            storage_bin = "103"
        }
        if (storage_location == "0002") {
            storage_type = "100"
            storage_bin = "101"
        }

        const promises = serials_array.map(serial_ =>
            funcion.sapRFC_transferVULProd(serial_, storage_location, storage_type, storage_bin)
        );

        const results = await Promise.all(promises);

        res.json(results)
    } catch (err) {
        res.json(err);
    }
};



controller.transferSemProd_POST = async (req, res) => {
    try {
        const serial = req.body.serial;
        const estacion = req.body.station

        const resultSL = await funcion.getStorageLocation(estacion);
        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }); }
        let storage_location = resultSL[0].storage_location

        if (storage_location == "0012") {
            storage_type = "102"
            storage_bin = "103"
        }
        if (storage_location == "0002") {
            storage_type = "100"
            storage_bin = "101"
        }
        const result_consultaStorageUnit = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20));
        const resultado_transferSemProd = await funcion.sapRFC_transferSemProd(funcion.addLeadingZeros(serial, 20), storage_type, storage_bin);
        const result_consulta = await funcion.sapRFC_consultaMaterial_SEM("'" + result_consultaStorageUnit[0].MATNR + "'", storage_location, "SEM");
        if (result_consulta.length === 0) {
            cantida_sap = 0
        } else {
            cantida_sap = result_consulta.reduce((total, element) => total + parseFloat(element.GESME.trim()), 0);
        }
        result_current_stock_db = await funcion.getCurrentStockSem(`P${result_consultaStorageUnit[0].MATNR}`);
        if (cantida_sap >= parseInt(result_current_stock_db[0].minimum_stock)) {
            await funcion.update_sem_current_stock(`P${result_consultaStorageUnit[0].MATNR}`, cantida_sap);
            await funcion.update_sem_current_employee(`P${result_consultaStorageUnit[0].MATNR}`);
        } else {
            await funcion.update_sem_current_stock(`P${result_consultaStorageUnit[0].MATNR}`, cantida_sap);
        }

        res.json(resultado_transferSemProd.T_LTAK[0]);
    } catch (err) {
        res.json(err);
    }
};


controller.transferProdSem_POST = async (req, res) => {
    try {
        const material = req.body.material;
        const qty = req.body.qty;
        const estacion = req.body.station
        let cantidad_sap

        const resultSL = await funcion.getStorageLocation(estacion);
        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }); }
        let storage_location = resultSL[0].storage_location
        if (storage_location === "0012") {
            from_storage_type = "102"
            from_storage_bin = "103"
            to_storage_type = "SEM"
            to_storage_bin = "TEMPR_SEM"
        }
        if (storage_location === "0002") {
            from_storage_type = "100"
            from_storage_bin = "101"
            to_storage_type = "SEM"
            to_storage_bin = "TEMPR_SEM"
        }
        const transfer100 = await funcion.sapRFC_transferProdSem_1(material, qty, storage_location, from_storage_type, from_storage_bin);
        const transfer998 = await funcion.sapRFC_transferProdSem_2(material, qty, storage_location, to_storage_type, to_storage_bin);
        const result_consulta = await funcion.sapRFC_consultaMaterial_SEM("'" + material + "'", storage_location, to_storage_type);
        if (result_consulta.length === 0) {
            cantidad_sap = 0
        } else {
            cantidad_sap = result_consulta.reduce((total, element) => total + parseFloat(element.GESME.trim()), 0);
        }
        result_current_stock_db = await funcion.getCurrentStockSem(`P${material}`);
        if (cantidad_sap >= parseInt(result_current_stock_db[0].minimum_stock)) {
            await funcion.update_sem_current_stock(`P${material}`, cantidad_sap);
            await funcion.update_sem_current_employee(`P${material}`);
        } else {
            await funcion.update_sem_current_stock(`P${material}`, cantidad_sap);
        }
        res.json(transfer998.E_LTAP);
    } catch (err) {
        res.json(err);
    }
};





controller.consultaVulProductionStock_POST = async (req, res) => {
    try {

        const material = req.body.material;
        let cantidad_actual = 0;
        let estacion = req.body.station

        const resultSL = await funcion.getStorageLocation(estacion);

        if (resultSL.length === 0) {
            return res.json({ key: `Storage Location not set for device "${estacion}"` });
        }

        let storage_location = resultSL[0].storage_location

        if (storage_location == "0012") {
            storage_type = "102"
            storage_bin = "103"
        }
        if (storage_location == "0002") {
            storage_type = "100"
            storage_bin = "101"
        }

        const result = await funcion.sapRFC_consultaMaterial_VUL("'" + material + "'", storage_location, storage_type, storage_bin);
        if (result.length === 0) {
            res.json({ "qty": 0 });
        } else {
            result.forEach(element => { cantidad_actual += parseInt(element.GESME.replace(".000", "")); });
            res.json({ "qty": cantidad_actual });
        }
    } catch (err) {
        res.json(err);
    }
};


controller.consultaSemProductionStock_POST = async (req, res) => {
    try {
        const material = req.body.material;
        const estacion = req.body.station;

        const resultSL = await funcion.getStorageLocation(estacion);

        if (resultSL.length === 0) { return res.json({ key: `Storage Location not set for device "${estacion}"` }); }

        let storage_location = resultSL[0].storage_location;
        let storage_type, storage_bin;

        if (storage_location == "0012") {
            storage_type = "102";
            storage_bin = "103";
        } else if (storage_location == "0002") {
            storage_type = "100";
            storage_bin = "101";
        } else {
            return res.json({ key: `Invalid storage location "${storage_location}"` });
        }

        const result = await funcion.sapRFC_consultaMaterial_VUL("'" + material + "'", storage_location, storage_type, storage_bin);

        if (result.length === 0) { return res.json({ "qty": 0 }); }

        const cantidad_actual = result.reduce((total, element) => total + parseInt(element.GESME.replace(".000", "")), 0);

        res.json({ "qty": cantidad_actual });
    } catch (err) {
        res.json(err);
    }
};



controller.get_packing_instruction_POST = async (req, res) => {
    try {
        let serial = req.body.serial

        const result = await funcion.sapRFC_get_packing_instruction(serial)

        res.json(result);
    } catch (err) {
        res.json(err);
    }
};

controller.get_packing_matreials_POST = async (req, res) => {
    try {
        let POBJID = req.body.POBJID
        let PACKNR = req.body.PACKNR
        let hu_packing_instruction = req.body.hu_packing_instruction
        const result = await funcion.sapRFC_get_packing_matreials(POBJID, PACKNR)

        res.json(result);
    } catch (err) {
        res.json(err);
    }
};

controller.pallet_request_create_POST = async (req, res) => {
    try {
        let serial = req.body.serial
        let serials_array = serial.split(",")
        let packing_materials = req.body.result_packing_materials_formatted
        let result_packingr_formatted = req.body.result_packingr_formatted
        let pallet_packing_material = req.body.pallet_packing_material
        let packing_instruction = req.body.packing_instruction
        let packing_id = req.body.packing_id
        const result = await funcion.sapRFC_pallet_request_create(serials_array, packing_materials, result_packingr_formatted, pallet_packing_material, packing_instruction, packing_id)

        res.json(result);
    } catch (err) {
        res.json(err);
    }
};

controller.pallet_print_POST = async (req, res) => {
    try {
        let serial_um = req.body.serial_um
        let serials_array = serial.split(",")

        let data = {
            "printer": "\\\\tftdelsrv003\\tftdelprn159",
            "serial_um": serial_um,
            "serial_uc": serials_array[0],
            "storage_bin": "FW0101"
        }

        const result = await funcion.printLabel_ONT_UM(data, serials_array)

        res.json(result);
    } catch (err) {
        res.json(err);
    }
};


module.exports = controller;