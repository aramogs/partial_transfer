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


controller.postSerialsFG_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let storage_bin = req.body.storage_bin
    let user_id = req.res.locals.authData.id.id

    let serials_array = serial.split(",")
    let promises = []
    serials_array.forEach(serial_ => {
        promises.push(funcion.sapRFC_transferFG(serial_, (storage_bin).toUpperCase())
            .catch((err) => { return err }))
    });

    Promise.all(promises)
        .then(result => { res.json(result) })
        .catch(err => { res.json(err) })

    // let progress = 0;
    // promises.forEach(p => p.then(() => {
    //     progress++;
    //     console.log(Math.round(progress / promises.length * 100) + "%");
    // }));

}

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

controller.postSerialsMP_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let storage_bin = req.body.storage_bin
    let storage_type = req.body.storage_type
    let user_id = req.res.locals.authData.id.id

    let serials_array = serial.split(",")
    let promises = []
    serials_array.forEach(serial_ => {
        promises.push(funcion.sapRFC_transferMP(funcion.addLeadingZeros(serial_, 20), storage_type, (storage_bin).toUpperCase(), user_id)
            .catch((err) => { return err }))
    });

    Promise.all(promises)
        .then(result => { res.json(result) })
        .catch(err => { res.json(err) })

}

controller.getUbicacionesMPSerial_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type


    funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20))
        .then(resultado => {
            funcion.sapRFC_consultaMaterial_ST(resultado[0].MATNR, "0011", storage_type)
                .then(resultado => {
                    res.json(resultado)
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => { res.json(err) })
}

controller.getUbicacionesMPMaterial_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type


    funcion.sapRFC_consultaMaterial_ST(material, "0011", storage_type)
        .then(resultado => {
            res.json(resultado)
        })
        .catch(err => {
            res.json(err)
        })

}

controller.getUbicacionesFG_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_type": "${storage_type}", 
            "user_id":"${user_id}"
        }`

    // amqpRequest(send, "rpc_fg")
    //     .then((result) => { res.json(result) })
    //     .catch((err) => { res.json(err) })
    funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20))
        .then(resultado => {
            funcion.sapRFC_consultaMaterial(resultado[0].MATNR, "0014")
                .then(resultado => {
                    res.json(resultado)
                })
                .catch(err => {
                    res.json(err)
                })
        })
        .catch(err => { res.json(err) })
}

controller.getInfoMP_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id




    funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(serial, 20))
        .then(result => {
            let certificate_number = ""
            let material_number = ""
            let stock_quantity = ""
            let material_description = ""
            let material_w = ""
            let storage_type = ""
            let response



            if (result.length == 0) {
                response = `{
                    "serial":"${serial}",
                    "material":"${material_number}",
                    "material_description": "${material_description}",
                    "material_w":"${material_w}", 
                    "cantidad":"${Number(stock_quantity)}", 
                    "certificate_number":"${certificate_number}" ,
                    "error": "Storage Unit: ${serial} Not Found "
                }`
                res.json(response)
            } else {

                certificate_number = (result[0].ZEUGN).trim()
                material_number = (result[0].MATNR).trim()
                stock_quantity = (result[0].VERME).trim()
                storage_type = (result[0].LGTYP).trim()

                if (storage_type !== "MP") {
                    response = `{
                        "serial":"${serial}",
                        "material":"${material_number}",
                        "material_description": "${material_description}",
                        "material_w":"${material_w}", 
                        "cantidad":"${Number(stock_quantity)}", 
                        "certificate_number":"${certificate_number}" ,
                        "error": "Storage Unit: ${serial} From Storage Type: ${storage_type} Not Permited "
                    }`
                    res.json(response)
                } else {
                    funcion.sapRFC_ConsultaMaterialMM03(material_number)
                        .then(result => {
                            material_description = result.MATERIAL_GENERAL_DATA.MATL_DESC
                            material_w = result.MATERIAL_GENERAL_DATA.GROSS_WT


                            response = `{
                            "serial":"${serial}",
                            "material":"${material_number}",
                            "material_description": "${material_description}",
                            "material_w":"${material_w}", 
                            "cantidad":"${Number(stock_quantity)}", 
                            "certificate_number":"${certificate_number}" ,
                            "error": ""
                        }`
                            res.json(response)
                        })
                        .catch(err => { res.json(err) })
                }
            }
        })
        .catch(err => { res.json(err) })

    // amqpRequest(send, "rpc_rm")
    //     .then((result) => { res.json(result) })
    //     .catch((err) => { res.json(err) })
}




controller.transferenciaMaterialMP_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = req.body.cantidad
    let proceso = req.body.proceso
    let material_description = req.body.material_description
    let certificate_number = req.body.certificate_number
    let cantidad_restante = req.body.cantidad_restante
    let user_id = req.body.user_id



    funcion.sapRFC_partialTransferStorageUnit(material, cantidad, "0011", "MP", serial, "102", "104")
        .then((result) => {
            let transfer_order = result.E_TANUM
            let response = `{
                "serial":"${serial}",
                "material": "${material}",
                "cantidad":"${cantidad}",  
                "result": "${transfer_order}",
                "error": "N/A"
            }`
            funcion.getPrinter(estacion)
                .then(result => {

                    let dataTRA = { "labels": `1`, "printer": `${result[0].impre}`, "cantidad": `${cantidad_restante}`, "descripcion": `${material_description}`, "lote": `${certificate_number}`, "material": `${material}`, "serial": `${serial}` }
                    let dataTRAB = { "labels": `1`, "printer": `${result[0].impre}`, "cantidad": `${cantidad}`, "descripcion": `${material_description}`, "lote": `${certificate_number}`, "material": `${material}`, "serial": `${serial}` }

                    funcion.printLabelTRA(dataTRAB, "TRAB").catch(err => { console.error(err) })
                    if (cantidad_restante > 0) { funcion.printLabelTRA(dataTRA, "TRA") }
                    funcion.insertPartialTransfer(user_id, material, serial, estacion, transfer_order).catch(err => { console.error(err) })

                })
                .catch(err => { console.error(err) })
            res.json(response)
        })
        .catch((err) => { res.json(err) })

}

controller.getBinStatusReport_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = null
    let proceso = req.body.proceso
    let material = null
    let storage_bin = req.body.storage_bin
    let cantidad = null
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type

    let send = `{
        "station":"${estacion}",
        "serial_num":"${serial}",
        "material": "${material}",
        "cantidad":"${cantidad}", 
        "process":"${proceso}",  
        "storage_bin": "${storage_bin}", 
        "user_id":"${user_id}",
        "storage_type":"${storage_type}" 
    }`


    amqpRequest(send, "rpc_cycle")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.postCycleSU_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = null
    let material = null
    let cantidad = null
    let proceso = req.body.proceso

    let storage_bin = req.body.storage_bin

    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type
    let listed_storage_units = req.body.listed_storage_units
    let unlisted_storage_units = req.body.unlisted_storage_units
    let not_found_storage_units = req.body.not_found_storage_units

    if (listed_storage_units.length !== 0) {
        funcion.insertListed_storage_units(storage_type, storage_bin.toUpperCase(), listed_storage_units, user_id)
            .then((result) => { console.info(result) })
            .catch((err) => { console.error(err) })
    }

    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_bin": "${storage_bin}",  
            "user_id":"${user_id}",
            "storage_type":"${storage_type}", 
            "listed_storage_units": "${listed_storage_units}", 
            "unlisted_storage_units": "${unlisted_storage_units}", 
            "not_found_storage_units": "${not_found_storage_units}" 
        }`



    amqpRequest(send, "rpc_cycle")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}


controller.cargaListado_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_PT_Pedido") access = "ok"
            });
            if (access == "ok") {
                res.render("cargaListado.ejs", { user })
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

controller.verificarSAP_POST = (req, res) => {
    let body = JSON.parse(req.body.data)

    let estacion = req.res.locals.macIP.mac
    let serial = null
    let material = null
    let cantidad = null
    let proceso = "raw_delivery_verify"

    let fecha = body.fecha
    let turno = body.turno




    let user = (req.res.socket.user).substring(4)
    let bufferExcel = req.file.buffer

    async function waitForPromise() {
        const excel = await arreglosExcel(bufferExcel)
        return (excel)
    }
    waitForPromise()
        .then(result => {

            let titulos = result[0]
            let valores = JSON.stringify(result[1])

            let send = `{
                "station":"${estacion}",
                "serial_num":"${serial}",
                "material": "${material}",
                "cantidad":"${cantidad}", 
                "process":"${proceso}", 
                "fecha": "${fecha}",  
                "user_id":"${user}",
                "turno":"${turno}", 
                "numeros_sap": ${valores}
            }`

            amqpRequest(send, "rpc_rm")
                .then((result) => { res.json(result) })
                .catch((err) => { res.json(err) })
        })
        .catch((err) => { res.status(200).send({ message: err }) })
}

controller.editarListado_GET = (req, res) => {

    user = req.connection.user
    fecha = req.params.fecha
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_PT_Pedido") access = "ok"
            });
            if (access == "ok") {
                res.render("editarListado.ejs", { user, fecha })
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
        .catch((err) => { console.error(err) })

}

controller.idListadoInfo_POST = (req, res) => {

    let id = req.body.id
    funcion.getInfoIdListado(id)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.cancelarIdListado_POST = (req, res) => {

    let idListado = req.body.id
    let motivo = req.body.motivo

    funcion.cancelarIdListado(idListado, motivo)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.editarIdListado_POST = (req, res) => {

    let id = req.body.id
    let contenedores = req.body.contenedores
    funcion.editarIdListado(id, contenedores)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.checkSap_POST = (req, res) => {

    let sap = req.body.sap

    funcion.checkSap(sap)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

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
        res.render('transfer_mp_FIFO_V.ejs', {
            user_id,
            user_name,
            storage_type
        })
    }

}

//TODO dividir esto en 2 funciones, crear nueva ruta y modificar en javascript la nueva ruta de MP1
controller.getRawFIFO_POST = (req, res) => {

    let estacion = req.res.locals.macIP.mac
    let serial = null
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let storage_type = req.body.storage_type
    let user_id = req.res.locals.authData.id.id
    let raw_id = req.body.raw_id

    if (raw_id !== undefined) {
        async function waitForPromise() {
            let count = funcion.getRawMovements(raw_id)
            return count
        }
        waitForPromise()
            .then(result => {
                let count_res = result
                let send = `{
                "station":"${estacion}",
                "serial_num":"${serial}",
                "material": "${material}",
                "cantidad":"${cantidad}", 
                "process":"${proceso}", 
                "storage_type":"${storage_type}",  
                "user_id":"${user_id}"
            }`

                amqpRequest(send, "rpc_rm")
                    .then(result => { res.json([result, count_res]) })
                    .catch(err => { res.json(err) })
            })
            .catch((err) => { res.status(200).send({ message: err }) })
    } else {
        let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_type":"${storage_type}",  
            "user_id":"${user_id}"
        }`

        amqpRequest(send, "rpc_rm")
            .then(result => { res.json(result) })
            .catch(err => { res.json(err) })
    }
}

controller.postSerialsMP_RAW_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let storage_type = req.body.storage_type
    let user_id = req.res.locals.authData.id.id
    let raw_id = req.body.raw_id
    let shift = req.body.shift
    let clear = req.body.clear
    let serials_obsoletos = req.body.serials_obsoletos

    if (clear !== "null") {
        async function waitForPromise() {
            let procesado = funcion.updateProcesado(raw_id)
            return procesado
        }
        waitForPromise()
            .catch((err) => { res.status(200).send({ message: err }) })
    }

    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_type":"${storage_type}",
            "raw_id":"${raw_id}",
            "shift":"${shift}",
            "user_id":"${user_id}",
            "serials_obsoletos": "${serials_obsoletos}"
        }`

    amqpRequest(send, "rpc_rm")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}


controller.getRawListado_GET = (req, res) => {

    funcion.getListadoPendiente()
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}

controller.getRawListadoProcesado_GET = (req, res) => {

    funcion.getListadoProcesado()
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}

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
    // .catch((err) => { console.error(err) })

}

function amqpRequest(send, queue) {
    return new Promise((resolve, reject) => {
        var args = process.argv.slice(2);
        if (args.length == 0) {
            console.error("Usage: rpc_client.js num");
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

controller.transferVUL_Confirmed = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let storage_bin = req.body.storage_bin
    let user_id = req.res.locals.authData.id.id


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_bin": "${storage_bin}", 
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_vul")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getUbicacionesVULSerial_POST = (req, res) => {

    let estacion = (req.res.locals.macIP.mac).replace(/:/g, "-")
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type

    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_type": "${storage_type}", 
            "user_id":"${user_id}"
        }`
    amqpRequest(send, "rpc_vul")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getUbicacionesVULMaterial_POST = (req, res) => {
    let estacion = (req.res.locals.macIP.mac).replace(/:/g, "-")
    let material = req.body.material
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type


    let send = `{
            "station":"${estacion}",
            "material": "${material}", 
            "process":"${proceso}", 
            "storage_type": "${storage_type}", 
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_vul")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getUbicacionesVULMandrel_POST = (req, res) => {
    // let estacion = req.res.locals.macIP.mac
    // let serial = req.body.serial
    // let material = req.body.material
    // let cantidad = null
    // let proceso = req.body.proceso
    // let user_id = req.res.locals.authData.id.id
    // let storage_type = req.body.storage_type


    // let send = `{
    //         "station":"${estacion}",
    //         "serial_num":"${serial}",
    //         "material": "${material}",
    //         "cantidad":"${cantidad}", 
    //         "process":"${proceso}", 
    //         "storage_type": "${storage_type}", 
    //         "user_id":"${user_id}"
    //     }`

    // amqpRequest(send, "rpc_vul")
    //     .then((result) => { res.json(result) })
    //     .catch((err) => { res.json(err) })


    let estacion = (req.res.locals.macIP.mac).replace(/:/g, "-")
    let mandrel = req.body.mandrel
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let material = ""


    funcion.sapFromMandrel(mandrel, "vulc")
        .then((result) => {
            if (result.length == 0) {
                res.json(JSON.stringify({ "result": "N/A", "error": "Check Mandrel Number" }))
            } else {
                let send = `{
                        "station":"${estacion}",
                        "material": "${(result[0].no_sap).charAt(0).toUpperCase() == "P" ? (result[0].no_sap).substring(1) : result[0].no_sap}",
                        "process":"${proceso}", 
                        "user_id":"${user_id}"
                    }`

                amqpRequest(send, "rpc_vul")
                    .then((result) => { res.json(result) })
                    .catch((err) => { res.json(err) })
            }

        })
        .catch((err) => { res.json(err) })
}

controller.getUbicacionesVULSerial_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = null
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id
    let storage_type = req.body.storage_type


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_type": "${storage_type}", 
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_vul")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}


controller.getUbicacionesEXTMandrel_POST = (req, res) => {

    let estacion = req.res.locals.macIP.mac
    let mandrel = req.body.mandrel
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id


    funcion.sapFromMandrel(mandrel, "extr")
        .then((result) => {
            if (result.length == 0) {
                res.json(JSON.stringify({ "result": "N/A", "error": "Check Mandrel Number" }))
            } else {
                let send = `{
                    "station":"${estacion}",
                    "material": "${(result[0].no_sap)}",
                    "process":"${proceso}", 
                    "user_id":"${user_id}"
                }`

                amqpRequest(send, "rpc_ext")
                    .then((result) => { res.json(result) })
                    .catch((err) => { res.json(err) })
            }

        })
        .catch((err) => { res.json(err) })



}

controller.getUbicacionesEXTSerial_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial_num = req.body.serial
    let proceso = req.body.proceso
    let user_id = req.res.locals.authData.id.id



    let send = `{
            "station":"${estacion}",
            "serial_num": "${serial_num}",
            "process":"${proceso}", 
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_ext")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })




}



controller.postSerialsEXT_POST = (req, res) => {
    let estacion = req.res.locals.macIP.mac
    let serial = req.body.serial
    let material = null
    let cantidad = null
    let proceso = req.body.proceso
    let storage_bin = req.body.storage_bin
    let user_id = req.res.locals.authData.id.id


    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_bin": "${storage_bin}", 
            "user_id":"${user_id}"
        }`

    amqpRequest(send, "rpc_ext")
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.transferVulProd_POST = (req, res) => {
    let serial = req.body.serial
    funcion.sapRFC_transferVulProd(funcion.addLeadingZeros(serial, 20))
        .then(resultado => { res.json(resultado.T_LTAK[0]) })
        .catch(err => { res.json(err) })

}
module.exports = controller;