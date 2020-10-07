//Conexion a base de datos
const controller = {};

var amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');



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

controller.userAccess_POST = (req, res) => {
    let user_id = req.body.user
    funcion.getUsers(user_id)
        .then((result) => {
            console.log(result);
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
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
    res.json(result)

}


controller.movimiento_parcial_GET = (req, res) => {


    user_id = req.res.locals.authData.id.id
    user_name = req.res.locals.authData.id.username

    res.render('movimiento_parcial.ejs', {
        user_id,
        user_name
    })
}


controller.getInfo_POST = (req, res) => {
    //TODO verificar si cookie aun es valida, sino regresar a login
    let estacion = uuidv4()
    let serial = req.body.serial
    let proceso = req.body.proceso
    let material = null
    let material_description = null
    let cantidad = null
    let cantidad_restante = null
    let user_id = req.body.user_id
    let user_name= req.body.user_name

    // accessToken(user_id, user_name)
    //     .then((result) => {
    //         cookieSet(req, res, result)
    //     })
    //     .catch((err) => { res.json(err); })


    amqpRequest(estacion, serial, proceso, material, material_description, cantidad, cantidad_restante, user_id)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}



controller.transferenciaMaterial_POST = (req, res) => {
    let estacion = uuidv4()
    let serial = req.body.serial
    let proceso = req.body.proceso
    let material = req.body.material
    let material_description = req.body.material_description
    let cantidad = req.body.cantidad
    let cantidad_restante = req.body.cantidad_restante
    let user_id = req.body.user_id
    let user_name= req.body.user_name



    amqpRequest(estacion, serial, proceso, material, material_description,cantidad, cantidad_restante, user_id)
        .then((result) => { res.json(result) })
        .catch((err) => { res.json(err) })
}





function amqpRequest(estacion, serial, proceso, material, material_description, cantidad, cantidad_restante, user_id) {
    return new Promise((resolve, reject) => {
        let send = `{"station":"${estacion}","serial_num":"${serial}","process":"${proceso}", "material": "${material}", "material_description": "${material_description}", "cantidad":"${cantidad}", "cantidad_restante":"${cantidad_restante}", "user_id":${user_id}}`

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
                    var correlationId = estacion;
                    // console.log(' [x] Requesting: ', send);

                    channel.consume(q.queue, function (msg) {
                        if (msg.properties.correlationId == correlationId) {
                            // console.log(' [x] Response:   ', msg.content.toString());
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