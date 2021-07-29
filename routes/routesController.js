//Conexion a base de datos
const controller = {};

var amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

//Require ExcelJs
const Excel = require('exceljs');
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');
const { promiseImpl } = require('ejs');



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
        jwt.sign({ id }, `tristone`, { expiresIn: '1h' }, (err, token) => {
            resolve(token)
            reject(err)
        })
    })
}


function cookieSet(req, res, result) {

    let minutes = 60;
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

controller.transferFG_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transfer_fg.ejs', {
        user_id,
        user_name
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
    res.render('transfer_mp.ejs', {
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
    let storage_type = req.params.storage_type
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('conteoC.ejs', {
        user_id,
        user_name,
        storage_type
    })
}

controller.master_request_GM_POST = (req, res) => {
    let estacion = uuidv4()
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

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.master_request_GM_CREATE_POST = (req, res) => {
    let estacion = uuidv4()
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

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.postSerials_POST = (req, res) => {
    let estacion = uuidv4()
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

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}




controller.postSerialsMP_POST = (req, res) => {
    let estacion = uuidv4()
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

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getUbicaciones_POST = (req, res) => {
    let estacion = uuidv4()
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

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getInfo_POST = (req, res) => {
    let estacion = uuidv4()
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


    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}




controller.transferenciaMaterial_POST = (req, res) => {
    let estacion = uuidv4()
    let serial = req.body.serial
    let material = req.body.material
    let cantidad = req.body.cantidad
    let proceso = req.body.proceso
    let material_description = req.body.material_description


    let cantidad_restante = req.body.cantidad_restante
    let user_id = req.body.user_id

    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "material_description": "${material_description}",
            "cantidad_restante":"${cantidad_restante}", 
            "user_id":"${user_id}"
 
        }`

    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.getBinStatusReport_POST = (req, res) => {
    let estacion = uuidv4()
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


    amqpRequest(send)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}

controller.postCycleSU_POST = (req, res) => {
    let estacion = uuidv4()
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


    funcion.insertListed_storage_units(storage_type, storage_bin.toUpperCase(), listed_storage_units, user_id)
    // .then((result) => { console.info(result) })
    // .catch((err) => { console.info(err) })

    let send = `{
            "station":"${estacion}",
            "serial_num":"${serial}",
            "material": "${material}",
            "cantidad":"${cantidad}", 
            "process":"${proceso}", 
            "storage_bin": "${storage_bin}",  
            "user_id":"${user_id}",
            "storage_type":"${storage_type}", 
            "unlisted_storage_units": "${unlisted_storage_units}", 
            "not_found_storage_units": "${not_found_storage_units}" 
        }`



    amqpRequest(send)
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

    let estacion = uuidv4()
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
            let valores =JSON.stringify(result[1])
     
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

            amqpRequest(send)
                .then((result) => { res.json(result) })
                .catch((err) => { res.json(err) })
        })
        .catch((err) => { console.log(err); res.status(200).send({ message: err }) })
}

controller.editarProgramacion_GET = (req, res) => {

    user = req.connection.user
    fecha = req.params.fecha
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_PT_Pedido") access = "ok"
            });
            if (access == "ok") {
                res.render("editarProgramacion.ejs", { user, fecha })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}

controller.tablaProgramacion_POST = (req, res) => {

    let fecha = req.body.fecha
    funcion.getProgramacionFecha(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}


function amqpRequest(send) {
    return new Promise((resolve, reject) => {
        var args = process.argv.slice(2);
        if (args.length == 0) {
            // console.log("Usage: rpc_client.js num");
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

                    channel.sendToQueue('rpc_queue',
                        Buffer.from(send.toString()), {
                        correlationId: correlationId,
                        replyTo: q.queue
                    });
                });
            });
        });
    })
}




module.exports = controller;