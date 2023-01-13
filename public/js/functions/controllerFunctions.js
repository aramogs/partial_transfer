const funcion = {};

const db = require('../../db/conn_empleados');
const dbC = require('../../db/conn_cycle');
const dbEX = require('../../db/conn_extr');
const dbA = require('../../db/conn_areas');
const dbBartender = require('../../db/conn_b10_bartender');
const dbB10 = require('../../db/conn_b10');
//Require Node-RFC
const node_RFC = require('../../sap/Connection');
//Require Axios
const axios = require('axios');


funcion.addLeadingZeros = (num, totalLength) => {
    return String(num).padStart(totalLength, '0');
}


funcion.getUsers = (user) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
            emp_name
        FROM
            empleados
        WHERE
            emp_num = ${user}
        AND 
            emp_area = "TO"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.insertListed_storage_units = (storage_type, storage_bin, storage_units, emp_num) => {
    return new Promise((resolve, reject) => {
        let valores_finales = []
        let arreglo_arreglos = []

        for (let i = 0; i < storage_units.length; i++) {
            valores_finales = []

            valores_finales.push(`${storage_type}`)
            valores_finales.push(`${storage_bin}`)
            valores_finales.push(`${storage_units[i]}`)
            valores_finales.push(`${emp_num}`)
            valores_finales.push(`OK`)
            arreglo_arreglos.push(valores_finales)
        }

        let sql = `INSERT INTO cycle_count (storage_type, storage_bin, storage_unit, emp_num, status) VALUES ?`;

        dbC(sql, [arreglo_arreglos])
            .then((result) => {
                resolve(result.affectedRows)
            })
            .catch((error) => { reject(error) })

    })

}

funcion.insertListed_OKBIN = (storage_type, storage_bin, storage_units, emp_num) => {
    return new Promise((resolve, reject) => {


        let sql = `INSERT INTO cycle_count (storage_type, storage_bin, storage_unit, emp_num, status) VALUES ?`;

        dbC(sql, [[storage_type, storage_bin, "", emp_num, ""]])
            .then((result) => {
                resolve(result.affectedRows)
            })
            .catch((error) => { reject(error) })

    })

}

funcion.getListado = (fecha) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT DISTINCT
            turno
        FROM
            raw_delivery
        WHERE
            fecha = '${fecha}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => {
                console.error(error);
                reject(error)
            })
    })
}

funcion.getTurnos = () => {
    return new Promise((resolve, reject) => {
        dbA(`
        SELECT 
            turno_descripcion
        FROM
            turnos
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getProgramacion = (fecha) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT DISTINCT
            turno
        FROM
            raw_delivery
        WHERE
            fecha = '${fecha}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => {
                console.error(error);
                reject(error)
            })
    })
}

funcion.getNumerosSAP = () => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT no_sap FROM extr;
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.insertListadoExcel = (tabla, titulos, valores, sup_num, fecha, turno) => {
    return new Promise((resolve, reject) => {
        let valor
        let valores_finales = []
        let arreglo_arreglos = []


        for (let i = 0; i < valores.length; i++) {
            valores_finales = []
            for (let y = 0; y < titulos.length; y++) {

                if (typeof (valores[i][y]) === "string") {
                    valor = `${valores[i][y]}`
                } else if (typeof (valores[i][y])) {
                    valor = valores[i][y]
                }
                valores_finales.push(valor)

            }
            valores_finales.push(`${sup_num}`)
            valores_finales.push(`${fecha}`)
            valores_finales.push(`${turno}`)

            arreglo_arreglos.push(valores_finales)
        }

        let sql = `INSERT INTO ${tabla} (${titulos.join()},sup_name,fecha,turno) VALUES ?`;

        dbC(sql, [arreglo_arreglos])
            .then((result) => {
                resolve(result.affectedRows)

            })
            .catch((error) => { console.error(error); reject(error) })

    })

}

funcion.getListadoFecha = (fecha) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT 
            *
        FROM
            raw_delivery
        WHERE
           fecha like "${fecha}%"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getInfoIdListado = (id) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT 
            *
        FROM
            raw_delivery
            
        WHERE
            id = ${id}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.cancelarIdListado = (idplan, motivo) => {

    return new Promise((resolve, reject) => {
        dbC(`
        UPDATE 
            raw_delivery
        SET
            status = 'Cancelado', 
            motivo_cancel ='${motivo}'

        WHERE
            id= ${idplan}
        
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.editarIdListado = (idListado, contenedores) => {
    return new Promise((resolve, reject) => {
        dbC(`
        UPDATE 
            raw_delivery
        SET
            contenedores = ${contenedores}
        WHERE
            id= ${idListado}
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getListadoPendiente = (fecha) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT 
            *
        FROM
            raw_delivery
        WHERE
           status = "Pendiente"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getListadoProcesado = (fecha) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT 
            *
        FROM
            raw_delivery
        WHERE
           status = "Procesado"
        AND
            DATE(fecha) = CURDATE()
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getRawMovements = (raw_id) => {
    return new Promise((resolve, reject) => {
        dbC(`
        SELECT 
            raw_id,
            COUNT(
                CASE WHEN 
                    sap_result REGEXP '^[0-9]+$' 
                THEN 
                    1
                END) 
            AS count
        FROM
            raw_movement
        WHERE
            raw_id = ${raw_id}
        GROUP BY 
            raw_id;
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateProcesado = (raw_id) => {
    return new Promise((resolve, reject) => {
        dbC(`
        UPDATE 
            raw_delivery
        SET
            status = "Procesado"
        WHERE
            id= ${raw_id}
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getPrinter = (station) => {
    return new Promise((resolve, reject) => {
        dbB10(`
        SELECT impre
        FROM b10.station_conf
        WHERE no_estacion = '${station}'
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.insertPartialTransfer = (emp_num, part_num, no_serie, linea, transfer_order) => {
    return new Promise((resolve, reject) => {
        dbC(`INSERT INTO partial_transfer (emp_num, part_num, no_serie, linea, transfer_order) 
                VALUES (${emp_num}, "${part_num}", ${no_serie}, "${linea}", ${transfer_order})`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.insertCompleteTransfer = (emp_num, area, no_serie, storage_bin, result) => {
    return new Promise((resolve, reject) => {
        dbC(`INSERT INTO complete_transfer (emp_num, area, no_serie, storage_bin, result) 
                VALUES (${emp_num}, "${area}", ${no_serie}, "${storage_bin}", "${result}")`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.insertRawMovement = (raw_id, storage_type, emp_num, no_serie, sap_result) => {
    return new Promise((resolve, reject) => {
        dbC(`INSERT INTO raw_movement (raw_id, storage_type, emp_num, no_serie, sap_result) 
                VALUES (${raw_id}, "${storage_type}", "${emp_num}", ${no_serie}, "${sap_result}")`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.printLabelTRA = (data, labelType) => {
    return new Promise((resolve, reject) => {

        axios({
            method: 'POST',
            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/${labelType}/Execute/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        })
            .then((result) => { resolve(result) })
            .catch((err) => { reject(err) })

    })
}

funcion.sapFromMandrel = (mandrel, table) => {
    return new Promise((resolve, reject) => {
        dbBartender(`
        SELECT
            no_sap
        FROM
            ${table}
        WHERE
            cust_part = "${mandrel}"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.materialEXT = (material) => {
    return new Promise((resolve, reject) => {
        dbBartender(`
        SELECT
            *
        FROM
            extr
        WHERE
            no_sap = '${material}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.sapRFC_transferFG = (serial, storage_bin) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `FG`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}





funcion.sapRFC_consultaMaterial = (material_number, storage_location) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `MATNR EQ '${material_number}'   AND LGORT EQ '${storage_location}'` }]
                    }
                )
                    .then(result => {
                        let columns = []
                        let rows = []
                        let fields = result.FIELDS

                        fields.forEach(field => {
                            columns.push(field.FIELDNAME)
                        });

                        let data = result.DATA

                        data.forEach(data_ => {
                            rows.push(data_.WA.split(","))
                        });

                        let res = rows.map(row => Object.fromEntries(
                            columns.map((key, i) => [key, row[i]])
                        ))
                        resolve(res)
                        managed_client.release()
                    })
                    .catch(err => {
                        reject(err)
                        managed_client.release()
                    })
            })
            .catch(err => {
                reject(err)
                managed_client.release()
            })
    })
}

funcion.sapRFC_consultaMaterial_ST = (material_number, storage_location, storage_type) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `MATNR EQ '${material_number.toUpperCase()}'   AND LGORT EQ '${storage_location}' AND LGTYP EQ '${storage_type}' ` }]
                    }
                )
                    .then(result => {
                        let columns = []
                        let rows = []
                        let fields = result.FIELDS

                        fields.forEach(field => {
                            columns.push(field.FIELDNAME)
                        });

                        let data = result.DATA

                        data.forEach(data_ => {
                            rows.push(data_.WA.split(","))
                        });

                        let res = rows.map(row => Object.fromEntries(
                            columns.map((key, i) => [key, row[i]])
                        ))
                        resolve(res)
                        managed_client.release()
                    })
                    .catch(err => {
                        reject(err)
                        managed_client.release()
                    })
            })
            .catch(err => {
                reject(err)
                managed_client.release()
            })
    })
}

funcion.sapRFC_consultaStorageUnit = (storage_unit) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `LENUM EQ '${storage_unit}' ` }]
                    }
                )
                    .then(result => {
                        let columns = []
                        let rows = []
                        let fields = result.FIELDS

                        fields.forEach(field => {
                            columns.push(field.FIELDNAME)
                        });

                        let data = result.DATA

                        data.forEach(data_ => {
                            rows.push(data_.WA.split(","))
                        });

                        let res = rows.map(row => Object.fromEntries(
                            columns.map((key, i) => [key, row[i]])
                        ))
                        resolve(res)
                        managed_client.release()
                    })
                    .catch(err => {
                        reject(err)
                        managed_client.release()
                    })
            })
            .catch(err => {
                reject(err)
                managed_client.release()
            })
    })
}


funcion.sapRFC_ConsultaMaterialMM03 = (material_number) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('BAPI_MATERIAL_GET_DETAIL',
                    {
                        MATERIAL: `${material_number}`, /* Material no. */
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_consultaStorageBin = (storage_location, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `LGORT EQ '${storage_location}'   AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin.toUpperCase()}'` }]
                    }
                )
                    .then(result => {
                        let columns = []
                        let rows = []
                        let fields = result.FIELDS

                        fields.forEach(field => {
                            columns.push(field.FIELDNAME)
                        });

                        let data = result.DATA

                        data.forEach(data_ => {
                            rows.push(data_.WA.split(","))
                        });

                        let res = rows.map(row => Object.fromEntries(
                            columns.map((key, i) => [key, row[i]])
                        ))
                        resolve(res)
                        managed_client.release()
                    })
                    .catch(err => {
                        reject(err)
                        managed_client.release()
                    })
            })
            .catch(err => {
                reject(err)
                managed_client.release()
            })
    })
}


funcion.sapRFC_partialTransferStorageUnit = (material_number, transfer_quantity, source_storage_location, source_storage_type, source_storage_unit, destination_storage_type, destination_storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: '521',                                                     /* Warehouse number */
                        I_BWLVS: '998',                                                     /* Movement type    */
                        I_MATNR: `${material_number}`,                                      /* Material no. */
                        I_WERKS: '5210',                                                    /* Plant    */
                        I_ANFME: `${transfer_quantity}`,                                    /* Requested Qty    */
                        I_ALTME: '',                                                        /* Unit of measure  */
                        I_LGORT: `${source_storage_location}`,                              /* Storage Location */
                        I_LETYP: '001',                                                     /* Storage Unit Type    */
                        I_VLTYP: `${source_storage_type}`,                                  /* Source storage type  */
                        I_VLBER: '001',                                                     /* Source storage section   */
                        I_VLENR: `${funcion.addLeadingZeros(source_storage_unit, 20)}`,     /* Source storage unit   */
                        I_NLTYP: `${destination_storage_type}`,                             /*  Destination storage type    */
                        I_NLBER: '001',                                                     /* Destination storage section  */
                        I_NLPLA: `${destination_storage_bin}`,                              /* Destination Storage Bin  */
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    })
            })
    })
}

funcion.sapRFC_transferEXTProd = (serial) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `102`,
                        I_NLBER: `001`,
                        I_NLPLA: `GREEN`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => { reject(err) })

    })

}

funcion.sapRFC_transferVulProd = (serial) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `102`,
                        I_NLBER: `001`,
                        I_NLPLA: `103`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => { reject(err) })

    })

}

funcion.sapRFC_transferProdVul_1 = (material, qty) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `100`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${qty}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_VLTYP: `102`,
                        I_VLBER: `001`,
                        I_VLPLA: `103`

                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferProdVul_2 = (material, qty) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `199`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${qty}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_NLTYP: `VUL`,
                        I_NLBER: `001`,
                        I_NLPLA: `TEMPR`


                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferVul = (serial, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `VUL`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferSemProd = (serial) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `102`,
                        I_NLBER: `001`,
                        I_NLPLA: `103`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferProdSem_1 = (material, qty) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `100`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${qty}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_VLTYP: `102`,
                        I_VLBER: `001`,
                        I_VLPLA: `103`

                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}


funcion.sapRFC_transferProdSem_2 = (material, qty) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `199`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${qty}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_NLTYP: `SEM`,
                        I_NLBER: `001`,
                        I_NLPLA: `TEMPR_SEM`

                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        log(err)
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferMP = (storage_unit, storage_type, storage_bin, emp_num) => {
    return new Promise((resolve, reject) => {

        funcion.sapRFC_consultaStorageUnit(storage_unit)
            .then(result => {
                let error = ""
                let abap_error = {
                    "name": 'ABAPError',
                    "group": 2,
                    "code": 4,
                    "codeString": 'RFC_ABAP_MESSAGE',
                    "key": '',
                    "message": "",
                    "abapMsgClass": 'L3',
                    "abapMsgType": 'E',
                    "abapMsgNumber": '004',
                    "abapMsgV1": `${(storage_unit).replace(/^0+/gm, "")}`,
                    "abapMsgV2": '',
                    "abapMsgV3": '',
                    "abapMsgV4": ''
                }
                if (result.length === 0) {
                    error = "DEL: Check your entries"
                    abap_error.message = error
                    reject(abap_error)
                } else if ((result[0].LGTYP).trim() !== (storage_type).trim()) {
                    error = 'DEL: Transfer between Storage Types not permited'
                    abap_error.message = error
                    funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin.toUpperCase(), error)
                    reject(abap_error)
                } else {

                    node_RFC.acquire()
                        .then(managed_client => {
                            managed_client.call('L_TO_CREATE_MOVE_SU',
                                {
                                    I_LENUM: `${storage_unit}`,
                                    I_BWLVS: `998`,
                                    I_LETYP: `IP`,
                                    I_NLTYP: `${storage_type}`,
                                    I_NLBER: `001`,
                                    I_NLPLA: `${storage_bin.toUpperCase()}`
                                }
                            )
                                .then(result => {
                                    managed_client.release()
                                    funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin.toUpperCase(), result.E_TANUM)
                                    resolve(result)
                                })
                                .catch(err => {
                                    funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin.toUpperCase(), err.message)
                                    managed_client.release()
                                    reject(err)
                                });
                        })
                        .catch(err => {
                            reject(err)
                        })
                }
            })
            .catch()


    })
}

funcion.sapRFC_transferMP_BetweenStorageTypes = (storage_unit, storage_type, storage_bin, emp_num) => {
    return new Promise((resolve, reject) => {

        funcion.sapRFC_consultaStorageUnit(storage_unit)
            .then(result => {
                let error = ""
                let abap_error = {
                    "name": 'ABAPError',
                    "group": 2,
                    "code": 4,
                    "codeString": 'RFC_ABAP_MESSAGE',
                    "key": '',
                    "message": "",
                    "abapMsgClass": 'L3',
                    "abapMsgType": 'E',
                    "abapMsgNumber": '004',
                    "abapMsgV1": `${(storage_unit).replace(/^0+/gm, "")}`,
                    "abapMsgV2": '',
                    "abapMsgV3": '',
                    "abapMsgV4": ''
                }
                if (result.length === 0) {
                    error = "DEL: Check your entries"
                    abap_error.message = error
                    reject(abap_error)
                } else {

                    node_RFC.acquire()
                        .then(managed_client => {
                            managed_client.call('L_TO_CREATE_MOVE_SU',
                                {
                                    I_LENUM: `${storage_unit}`,
                                    I_BWLVS: `998`,
                                    I_LETYP: `IP`,
                                    I_NLTYP: `${storage_type}`,
                                    I_NLBER: `001`,
                                    I_NLPLA: `${storage_bin}`
                                }
                            )
                                .then(result => {
                                    managed_client.release()
                                    funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, result.E_TANUM)
                                    resolve(result)
                                })
                                .catch(err => {
                                    funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, err.message)
                                    managed_client.release()
                                    reject(err)
                                });
                        })
                        .catch(err => {
                            reject(err)
                        })
                }
            })
            .catch()


    })
}



funcion.sapRFC_transferMP1 = (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${storage_unit}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `${storage_type}`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), result.E_TANUM)
                        resolve(result)
                    })
                    .catch(err => {
                        funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), err.message)
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            })
    })
}

funcion.sapRFC_transferMP_Obsoletos = (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${storage_unit}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `${storage_type}`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${result.E_TANUM}`)
                        resolve(result)
                    })
                    .catch(err => {
                        funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${err.message}`)
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            })
    })
}

funcion.sapRFC_transferExt = (serial, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `EXT`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferExtRP = (serial, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `102`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_consultaMaterial_EXT = (material_number, storage_location, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `MATNR EQ '${material_number.toUpperCase()}' AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin}'` }]
                        // FIELDS: ["MATNR", "LGORT", "LGTYP", "LGPLA"]
                    }
                )
                    .then(result => {
                        let columns = []
                        let rows = []
                        let fields = result.FIELDS

                        fields.forEach(field => {
                            columns.push(field.FIELDNAME)
                        });

                        let data = result.DATA

                        data.forEach(data_ => {
                            rows.push(data_.WA.split(","))
                        });

                        let res = rows.map(row => Object.fromEntries(
                            columns.map((key, i) => [key, row[i]])
                        ))
                        resolve(res)
                        managed_client.release()
                    })
                    .catch(err => {
                        reject(err)
                        managed_client.release()
                    })
            })
            .catch(err => {
                reject(err)
                managed_client.release()
            })
    })
}

funcion.sapRFC_transferEXTPR_1 = (material, cantidad) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `100`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${cantidad}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_VLTYP: `102`,
                        I_VLBER: `001`,
                        I_VLPLA: `GREEN`

                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferEXTPR_2 = (material, cantidad) => {
    return new Promise((resolve, reject) => {

        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_SINGLE',
                    {
                        I_LGNUM: `521`,
                        I_BWLVS: `199`,
                        I_MATNR: `${material}`,
                        I_WERKS: `5210`,
                        I_ANFME: `${cantidad}`,
                        I_LGORT: `0012`,
                        I_LETYP: `IP`,
                        I_NLTYP: `EXT`,
                        I_NLBER: `001`,
                        I_NLPLA: `TEMPR_EXT`


                    }
                )
                    .then(result => {
                        managed_client.release()
                        resolve(result)
                    })
                    .catch(err => {
                        managed_client.release()
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

//LT01
// node_RFC.acquire()
//     .then(managed_client => {
//         managed_client.call('L_TO_CREATE_SINGLE',
//             {
//                I_LGNUM: '521',          /* Warehouse number */
//                I_BWLVS: '998' ,         /* Movement type    */
//                I_MATNR: '1000009362A0', /* Material no. */
//                I_WERKS: '5210',         /* Plant    */
//                I_ANFME: '1',            /* Requested Qty    */
//                I_ALTME: '',             /* Unit of measure  */
//                I_LGORT: '0011',         /* Storage Location */
//                I_LETYP: '001',          /* Storage Unit Type    */
//                I_VLTYP: 'MP',           /* Source storage type  */
//                I_VLBER: '001',          /* Source storage section   */
//                I_VLENR: '00000000001032829214',/* Source storage unit   */
//                I_NLTYP: '102',          /*  Destination storage type    */
//                I_NLBER: '001',          /* Destination storage section  */
//                I_NLPLA: '104',          /* Destination Storage Bin  */
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//                 managed_client.release()
//             })
//     })

//MM03
// node_RFC.acquire()
//     .then(managed_client => {
//         managed_client.call('BAPI_HU_CREATE ',
//             {

//                 HEADERPROPOSAL:
//                 {
//                     PACK_MAT: '4MC0175',
//                     PLANT: '5210',
//                     STGE_LOC: '0012',
//                     HU_EXID_TYPE: 'C',

//                 },
//                 HUITEM: [{
//                     MATERIAL: '5000010057A0',
//                     PACK_QTY: '100',
//                 }]

//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//                 managed_client.release()
//             })
//     })


// node_RFC.acquire()
// .then(managed_client => {
//     managed_client.call('BAPI_HU_PACK',
//         {
//             HUKEY: '00000000000183071080',
//             // ITEMPROPOSAL: [{
//             //     MATERIAL: '5000010057A0',
//             //     PACK_QTY: '100',
//             // }]
//             ITEMPROPOSAL:[]

//         }
//     )
//         .then(result => {
//             console.log(result);
//         })
//         .catch(err => {
//             console.log(err);
//             managed_client.release()
//         })
// })

// node_RFC.acquire()
//     .then(managed_client => {
//         managed_client.call('ABAP4_CALL_TRANSACTION',
//             {
//                 TCODE: 'LX03',
//                 SKIP_SCREEN :'X',
//                 SPAGPA_TAB: [
//                     { PARID: 'LGN', PARVAL: '521' },
//                     { PARID: 'LGT', PARVAL: 'FG' },
//                     { PARID: 'LGP', PARVAL: 'FW0101' },
//                     // { PARID: 'MATNR', PARVAL: '5000009979A0' },
//                     // { PARID: 'DATUM', PARVAL: '16.11.2022' },
//                     // { PARID: 'VERID', PARVAL: '1' },
//                     // { PARID: 'LDEST', PARVAL: 'TFTDELPRN067' }
//                 ]
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//                 managed_client.release()
//             })
//     })

module.exports = funcion;