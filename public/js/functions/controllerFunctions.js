const funcion = {};
const moment = require('moment');

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


funcion.dBinsert_cycle_Listed_storage_units = (storage_type, storage_bin, storage_units, emp_num) => {
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

funcion.dBinsert_cycle_result = (storage_type, storage_bin, storage_unit, emp_num, status, sap_result) => {
    return new Promise((resolve, reject) => {



        dbC(`INSERT INTO cycle_count (storage_type, storage_bin, storage_unit, emp_num, status, sap_result) 
                VALUES ("${storage_type}", "${storage_bin}", "${storage_unit}", "${emp_num}", "${status}", "${sap_result}")`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })

    })

}

funcion.dBinsertListed_OKBIN = (storage_type, storage_bin, storage_units, emp_num) => {
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

funcion.getListadoPendiente = async (fecha) => {
    try {
        const result = await dbC(`
            SELECT 
                *
            FROM
                raw_delivery
            WHERE
                status = "Pendiente"
        `);
        return result;
    } catch (error) {
        throw error;
    }
};


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

funcion.getRawMovements = async (raw_id) => {
    try {
        const result = await dbC(`
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
        `);
        return result;
    } catch (error) {
        throw error;
    }
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

funcion.materialVUL = (material) => {
    return new Promise((resolve, reject) => {
        dbBartender(`
        SELECT
            *
        FROM
            vulc
        WHERE
            no_sap = '${material}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.materialSEM = (material) => {
    return new Promise((resolve, reject) => {
        dbBartender(`
        SELECT
            *
        FROM
            sem
        WHERE
            no_sap = '${material}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.update_plan_ext = async (plan_id) => {
    try {
        const result = await dbEX(`
            UPDATE
                production_plan
            SET
                status = "Impreso"
            WHERE
                plan_id = '${plan_id}'
        `);
        return result;
    } catch (error) {
        throw error;
    }
};

funcion.update_print_ext = async (serial_num, plan_id, material, emp_num, cantidad, impresoType) => {
    try {
        const result = await dbEX(`
            INSERT INTO extrusion_labels (serial, plan_id, numero_parte, emp_num, cantidad, status) 
                VALUES(${serial_num},'${plan_id}', '${material}', ${emp_num}, ${cantidad}, '${impresoType}')
        `);
        return result;
    } catch (error) {
        throw error;
    }
};


funcion.sapRFC_transferFG = async (serial, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: 'FG',
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });


        return result;
    } catch (error) {
        throw error;
    } finally {
        if (managed_client) { managed_client.release() }
    }
};






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
                        if (managed_client) { managed_client.release() }
                    })
                    .catch(err => {
                        reject(err)
                        if (managed_client) { managed_client.release() }
                    })
            })
            .catch(err => {
                reject(err)
                if (managed_client) { managed_client.release() }
            })
    })
}

funcion.sapRFC_consultaMaterial_ST = async (material_number, storage_location, storage_type) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const options = {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `MATNR EQ '${material_number.toUpperCase()}' AND LGORT EQ '${storage_location}' AND LGTYP EQ '${storage_type}' ` }]
        };

        const result = await managed_client.call('RFC_READ_TABLE', options);

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));
        return res;
    } catch (error) {
        throw error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}



funcion.sapRFC_consultaStorageUnit = async (storage_unit) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LENUM EQ '${storage_unit}' ` }]
        });

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));

        return res;
    } catch (error) {
        throw error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};



funcion.sapRFC_ConsultaMaterialMM03 = async (material_number) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('BAPI_MATERIAL_GET_DETAIL', {
            MATERIAL: `${material_number}`, /* Material no. */
        });

        return result;
    } catch (error) {
        throw error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_consultaStorageBin = (storage_location, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `LGORT EQ '${storage_location}' AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin.toUpperCase()}'` }]
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
                        if (managed_client) { managed_client.release() }
                    })
                    .catch(err => {
                        reject(err)
                        if (managed_client) { managed_client.release() }
                    })
            })
            .catch(err => {
                reject(err)
                if (managed_client) { managed_client.release() }
            })
    })
}


funcion.sapRFC_partialTransferStorageUnit = async (material_number, transfer_quantity, source_storage_location, source_storage_type, source_storage_unit, destination_storage_type, destination_storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_SINGLE', {
            I_LGNUM: '521',                             /* Warehouse number */
            I_BWLVS: '998',                             /* Movement type    */
            I_MATNR: `${material_number}`,              /* Material no. */
            I_WERKS: '5210',                            /* Plant    */
            I_ANFME: `${transfer_quantity}`,            /* Requested Qty    */
            I_ALTME: '',                                /* Unit of measure  */
            I_LGORT: `${source_storage_location}`,      /* Storage Location */
            I_LETYP: '001',                             /* Storage Unit Type    */
            I_VLTYP: `${source_storage_type}`,           /* Source storage type  */
            I_VLBER: '001',                             /* Source storage section   */
            I_VLENR: `${funcion.addLeadingZeros(source_storage_unit, 20)}`, /* Source storage unit   */
            I_NLTYP: `${destination_storage_type}`,     /*  Destination storage type    */
            I_NLBER: '001',                             /* Destination storage section  */
            I_NLPLA: `${destination_storage_bin}`,      /* Destination Storage Bin  */
        });

        return result;
    } catch (error) {
        throw error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}


funcion.sapRFC_transferEXTProd = async (serial, storage_location, storage_type, storage_bin) => {
    let managed_client
    let managed_client2
    try {
        managed_client = await node_RFC.acquire();

        const result_suCheck = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LENUM EQ '${funcion.addLeadingZeros(serial, 20)}'` }]
        });
        const columns = result_suCheck.FIELDS.map(field => field.FIELDNAME);
        const rows = result_suCheck.DATA.map(data_ => data_.WA.split(","));

        const res = rows.map(row => Object.fromEntries(
            columns.map((key, i) => [key, row[i]])
        ));

        if (res.length === 0) {
            return ({ "key": "SU_DOESNT_EXIST", "abapMsgV1": `${serial}` });

        } else if (res[0].LGORT !== storage_location) {
            return ({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                I_BWLVS: '998',
                I_LETYP: 'IP',
                I_NLTYP: storage_type.toUpperCase(),
                I_NLBER: '001',
                I_NLPLA: storage_bin.toUpperCase()
            });
            return result;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() }
        if (managed_client2) { managed_client2.release() }
    }
}


funcion.sapRFC_transferVULProd = async (serial, storage_location, storage_type, storage_bin) => {
    let managed_client
    let managed_client2
    try {
        managed_client = await node_RFC.acquire();

        const result_suCheck = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LENUM EQ '${funcion.addLeadingZeros(serial, 20)}'` }]
        });
        const columns = result_suCheck.FIELDS.map(field => field.FIELDNAME);
        const rows = result_suCheck.DATA.map(data_ => data_.WA.split(","));

        const res = rows.map(row => Object.fromEntries(
            columns.map((key, i) => [key, row[i]])
        ));

        if (res.length === 0) {
            return ({ "key": "SU_DOESNT_EXIST", "abapMsgV1": `${serial}` });

        } else if (res[0].LGTYP !== "VUL" || res[0].LGORT !== storage_location) {
            return ({ "key": `Check SU SType: ${res[0].LGTYP}, SLocation: ${res[0].LGORT}`, "abapMsgV1": `${serial}` });
        } else {
            managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                I_BWLVS: '998',
                I_LETYP: 'IP',
                I_NLTYP: storage_type.toUpperCase(),
                I_NLBER: '001',
                I_NLPLA: storage_bin.toUpperCase()
            });
            return result;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() }
        if (managed_client2) { managed_client2.release() }
    }
}


funcion.sapRFC_transferProdVul_1 = async (material, qty, storage_location, storage_type, storage_bin) => {

    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_SINGLE', {
                I_LGNUM: '521',
                I_BWLVS: '100',
                I_MATNR: material,
                I_WERKS: '5210',
                I_ANFME: qty,
                I_LGORT: storage_location,
                I_LETYP: 'IP',
                I_VLTYP: storage_type,
                I_VLBER: '001',
                I_VLPLA: storage_bin
            });


            return result;
        } catch (err) {

            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_transferProdVul_2 = async (material, qty, storage_location, storage_type, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_SINGLE', {
                I_LGNUM: '521',
                I_BWLVS: '199',
                I_MATNR: material,
                I_WERKS: '5210',
                I_ANFME: qty,
                I_LGORT: storage_location,
                I_LETYP: 'IP',
                I_NLTYP: storage_type,
                I_NLBER: '001',
                I_NLPLA: storage_bin
            });

            return result;
        } catch (err) {

            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};

funcion.sapRFC_transferProdSem_1 = async (material, qty, storage_location, storage_type, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_SINGLE', {
                I_LGNUM: '521',
                I_BWLVS: '100',
                I_MATNR: material,
                I_WERKS: '5210',
                I_ANFME: qty,
                I_LGORT: storage_location,
                I_LETYP: 'IP',
                I_VLTYP: storage_type,
                I_VLBER: '001',
                I_VLPLA: storage_bin
            });

            return result;
        } catch (err) {
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_transferProdSem_2 = async (material, qty, storage_location, storage_type, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_SINGLE', {
                I_LGNUM: '521',
                I_BWLVS: '199',
                I_MATNR: material,
                I_WERKS: '5210',
                I_ANFME: qty,
                I_LGORT: storage_location,
                I_LETYP: 'IP',
                I_NLTYP: storage_type,
                I_NLBER: '001',
                I_NLPLA: storage_bin
            });

            return result;
        } catch (err) {
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};

funcion.sapRFC_TBNUM = async (material, cantidad) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        // const yesterday = moment().subtract(1, 'days').format('YYYYMMDD');
        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LTBP',
            DELIMITER: ",",
            OPTIONS: [
                { TEXT: `LGNUM EQ '521' AND MATNR EQ '${material}' AND MENGE EQ '${cantidad}'` },
                { TEXT: `AND ELIKZ EQ ''` },
            ]
        });
        const fields = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(fields.map((key, i) => [key, row[i]])));
        // Sort by TBNUM field in descending order
        res.sort((a, b) => (parseInt(b.TBNUM) - parseInt(a.TBNUM)));
        return res;
    } catch (err) {
        return err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_transferVul = async (serial, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `VUL`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        return result;
    } catch (err) {
        return Promise.reject(err);
    } finally {
        if (managed_client) { managed_client.release() };
    }
};

funcion.sapRFC_transferVul_TR = async (serial_num, quantity, storage_type, storage_bin, tbnum) => {

    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_TR', {
                I_LGNUM: '521',
                I_TBNUM: `${tbnum}`,
                IT_TRITE:
                    [{
                        TBPOS: "001",
                        ANFME: `${quantity}`,
                        ALTME: "ST",
                        NLTYP: `${storage_type}`,
                        NLBER: "001",
                        NLPLA: `${storage_bin}`,
                        NLENR: `${funcion.addLeadingZeros(serial_num, 20)}`,
                        LETYP: "001"
                    }]
            });

            return result;
        } catch (err) {
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};

funcion.sapRFC_transferSEM_TR = async (serial_num, quantity, storage_type, storage_bin, tbnum) => {

    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        try {
            const result = await managed_client.call('L_TO_CREATE_TR', {
                I_LGNUM: '521',
                I_TBNUM: `${tbnum}`,
                IT_TRITE:
                    [{
                        TBPOS: "001",
                        ANFME: `${quantity}`,
                        ALTME: "ST",
                        NLTYP: `${storage_type}`,
                        NLBER: "001",
                        NLPLA: `${storage_bin}`,
                        NLENR: `${funcion.addLeadingZeros(serial_num, 20)}`,
                        LETYP: "001"
                    }]
            });

            return result;
        } catch (err) {
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_transferSemProd = async (serial, storage_type, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const parameters = {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        };

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', parameters);
        return result;
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}


// funcion.sapRFC_transferProdSem_1 = async (material, qty) =>{
//     try {
//         const managed_client = await node_RFC.acquire();

//         const parameters = {
//             I_LGNUM: `521`,
//             I_BWLVS: `100`,
//             I_MATNR: `${material}`,
//             I_WERKS: `5210`,
//             I_ANFME: `${qty}`,
//             I_LGORT: `0012`,
//             I_LETYP: `IP`,
//             I_VLTYP: `102`,
//             I_VLBER: `001`,
//             I_VLPLA: `103`
//         };

//         const result = await managed_client.call('L_TO_CREATE_SINGLE', parameters);
//         if (managed_client) { managed_client.release() };
//         return result;
//     } catch (err) {
//         throw err;
//     }
// }



// funcion.sapRFC_transferProdSem_2 =  async (material, qty) =>{
//     try {
//         const managed_client = await node_RFC.acquire();

//         const parameters = {
//             I_LGNUM: '521',
//             I_BWLVS: '199',
//             I_MATNR: material,
//             I_WERKS: '5210',
//             I_ANFME: qty,
//             I_LGORT: '0012',
//             I_LETYP: 'IP',
//             I_NLTYP: 'SEM',
//             I_NLBER: '001',
//             I_NLPLA: 'TEMPR_SEM'
//         };

//         const result = await managed_client.call('L_TO_CREATE_SINGLE', parameters);
//         if (managed_client) { managed_client.release() };
//         return result;
//     } catch (err) {
//         console.error(err); // Log the error
//         throw err;
//     }
// }

funcion.sapRFC_transferMP = async (storage_unit, storage_type, storage_bin, emp_num, estacion) => {
    let managed_client
    try {
        const result = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(storage_unit, 20));

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;

        if (result.length === 0) {
            return ({ "key": "DEL: Check your entries", "abapMsgV1": `${storage_unit}` });
        }

        if (result[0].LGORT !== storage_location) {
            error = "DEL: Storage Locations do not match"
            funcion.insertCompleteTransfer(emp_num, storage_type, storage_unit, storage_bin.toUpperCase(), error);
            return ({ "key": `${error}`, "abapMsgV1": `${storage_unit}` });
        }

        if ((result[0].LGTYP).trim() !== (storage_type).trim()) {
            error = "DEL: Transfer between Storage Types not permitted"
            funcion.insertCompleteTransfer(emp_num, storage_type, storage_unit, storage_bin.toUpperCase(), error);
            return ({ "key": `${error}`, "abapMsgV1": `${storage_unit}` });
        }

        managed_client = await node_RFC.acquire();
        const resultLTO = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(storage_unit, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: `${storage_type}`,
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        funcion.insertCompleteTransfer(emp_num, storage_type, storage_unit, storage_bin.toUpperCase(), resultLTO.E_TANUM);
        return resultLTO;
    } catch (error) {
        return error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}

funcion.sapRFC_transferMP_BetweenStorageTypes = async (storage_unit, storage_type, storage_bin, emp_num) => {
    let managed_client
    try {
        const storageUnitInfo = await funcion.sapRFC_consultaStorageUnit(storage_unit);

        if (storageUnitInfo.length === 0) {
            throw ({ "key": "DEL: Check your entries", "abapMsgV1": `${serial}` });
        }

        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${storage_unit}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        });

        funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, result.E_TANUM);

        return result;
    } catch (error) {
        funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, error.message);
        throw error;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};




funcion.sapRFC_transferMP1_DEL = async (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(storage_unit, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: `${storage_type}`,
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, result.E_TANUM);

        return result;
    } catch (err) {
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, err.message);
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_transferMP1_DELX = async (storage_unit, storage_type, storage_bin, material, cantidad, emp_num, raw_id) => {
    let managed_client
    let managed_client2
    try {
        managed_client = await node_RFC.acquire();

        const result_transfer199 = await managed_client.call('L_TO_CREATE_SINGLE',
            {
                I_LGNUM: `521`,
                I_BWLVS: `100`,
                I_MATNR: `${material}`,
                I_WERKS: `5210`,
                I_ANFME: `${cantidad}`,
                I_LGORT: `0011`,
                I_LETYP: `IP`,
                I_VLENR: `${funcion.addLeadingZeros(storage_unit, 20)}`
            }
        )
        managed_client2 = await node_RFC.acquire();
        const result_transfer998 = await managed_client2.call('L_TO_CREATE_SINGLE',
            {
                I_LGNUM: `521`,
                I_BWLVS: `998`,
                I_MATNR: `${material}`,
                I_WERKS: `5210`,
                I_ANFME: `${cantidad}`,
                I_LGORT: `0001`,
                I_LETYP: `IP`,
                I_VLTYP: `199`,
                I_VLBER: `001`,
                I_VLPLA: `199`,
                I_NLTYP: `MP`,
                I_NLBER: `001`,
                I_NLPLA: storage_bin,
                I_NLENR: `${funcion.addLeadingZeros(storage_unit, 20)}`
            }
        )
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, result_transfer998.E_TANUM);

        return result_transfer998;
    } catch (err) {
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, err.message);
        return err;
    } finally {
        if (managed_client) { managed_client.release() }
        if (managed_client2) { managed_client2.release() }
    }
};


funcion.sapRFC_transferMP_Obsoletos = async (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${storage_unit}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        });

        await funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${result.E_TANUM}`);

        return result;
    } catch (err) {
        await funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${err.message}`);
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


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
                        if (managed_client) { managed_client.release() }
                        resolve(result)
                    })
                    .catch(err => {
                        if (managed_client) { managed_client.release() }
                        reject(err)
                    })
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferExtRP = (serial, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_LETYP: `IP`,
                        I_NLTYP: `${storage_type.toUpperCase()}`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        if (managed_client) { managed_client.release() }
                        resolve(result)
                    })
                    .catch(err => {
                        if (managed_client) { managed_client.release() }
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
                        if (managed_client) { managed_client.release() }
                    })
                    .catch(err => {
                        reject(err)
                        if (managed_client) { managed_client.release() }
                    })
            })
            .catch(err => {
                reject(err)
                if (managed_client) { managed_client.release() }
            })
    })
}

funcion.sapRFC_transferEXTPR_1 = (material, cantidad, fromStorageLocation, fromStorageType, fromStorageBin) => {
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
                        I_LGORT: `${fromStorageLocation.toUpperCase()}`,
                        I_LETYP: `IP`,
                        I_VLTYP: `${fromStorageType.toUpperCase()}`,
                        I_VLBER: `001`,
                        I_VLPLA: `${fromStorageBin.toUpperCase()}`

                    }
                )
                    .then(result => {
                        if (managed_client) { managed_client.release() }
                        resolve(result)
                    })
                    .catch(err => {
                        if (managed_client) { managed_client.release() }
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferEXTPR_2 = (material, cantidad, toStorageLocation) => {
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
                        I_LGORT: `${toStorageLocation.toUpperCase()}`,
                        I_LETYP: `IP`,
                        I_NLTYP: `EXT`,
                        I_NLBER: `001`,
                        I_NLPLA: `TEMPR_EXT`


                    }
                )
                    .then(result => {
                        if (managed_client) { managed_client.release() }
                        resolve(result)
                    })
                    .catch(err => {
                        if (managed_client) { managed_client.release() }
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_SbinOnStypeExists = async (storage_type, storage_bin) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LAGP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LGNUM EQ 521 AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin}'` }]
            // FIELDS: ["MATNR", "LGORT", "LGTYP", "LGPLA"]
        });
        const fields = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(fields.map((key, i) => [key, row[i]])));
        return res;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.sapRFC_consultaMaterial_VUL = (material_number, storage_location, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {
                managed_client.call('RFC_READ_TABLE',
                    {
                        QUERY_TABLE: 'LQUA',
                        DELIMITER: ",",
                        OPTIONS: [{ TEXT: `MATNR EQ ${material_number.toUpperCase()} AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin}'` }]
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
                        if (managed_client) { managed_client.release() }
                    })
                    .catch(err => {
                        reject(err)
                        if (managed_client) { managed_client.release() }
                    })
            })
            .catch(err => {
                reject(err)
                if (managed_client) { managed_client.release() }
            })
    })
}

funcion.sapRFC_consultaMaterial_SEM = async (material_number, storage_location, storage_type) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();
        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `MATNR EQ ${material_number.toUpperCase()} AND LGTYP EQ '${storage_type}' AND LGORT EQ '${storage_location}'` }]
        });

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));

        return res;
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};


funcion.getStorageLocation = (station) => {
    return new Promise((resolve, reject) => {
        dbB10(`
        SELECT storage_location
        FROM b10.station_conf
        WHERE no_estacion = '${station}'
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.sapRFC_transfer = (serial, storage_type, storage_bin) => {
    return new Promise((resolve, reject) => {
        node_RFC.acquire()
            .then(managed_client => {

                managed_client.call('L_TO_CREATE_MOVE_SU',
                    {
                        I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                        I_BWLVS: `998`,
                        I_NLTYP: `${storage_type}`,
                        I_NLBER: `001`,
                        I_NLPLA: `${storage_bin.toUpperCase()}`
                    }
                )
                    .then(result => {
                        if (managed_client) { managed_client.release() }
                        resolve(result)
                    })
                    .catch(err => {
                        if (managed_client) { managed_client.release() }
                        reject(err)
                    });
            })
            .catch(err => {
                reject(err)
            });
    })
}

funcion.sapRFC_transferSlocCheck = async (serial, storage_location, storage_type, storage_bin) => {
    let managed_client
    let managed_client2
    try {
        managed_client = await node_RFC.acquire();

        const result_suCheck = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LENUM EQ '${funcion.addLeadingZeros(serial, 20)}'` }]
        });
        const columns = result_suCheck.FIELDS.map(field => field.FIELDNAME);
        const rows = result_suCheck.DATA.map(data_ => data_.WA.split(","));

        const res = rows.map(row => Object.fromEntries(
            columns.map((key, i) => [key, row[i]])
        ));

        if (res.length === 0) {
            return ({ "key": "SU_DOESNT_EXIST", "abapMsgV1": `${serial}` });

        } else if (res[0].LGORT !== storage_location) {
            return ({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            const inputParameters = {
                I_LENUM: funcion.addLeadingZeros(serial, 20),
                I_BWLVS: '998',
                I_NLTYP: storage_type,
                I_NLBER: '001',
                I_NLPLA: storage_bin.toUpperCase()
            };
            managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', inputParameters);
            return result;
        }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() }
        if (managed_client2) { managed_client2.release() }
    }
};


funcion.sapRFC_materialDescription = async (material_number) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('BAPI_MATERIAL_GET_DETAIL', {
            MATERIAL: `${material_number}`,
        });
        return result;
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
};

funcion.insertRawDelivery = async (valores) => {
    try {
        const query = "INSERT INTO raw_delivery (numero_sap, descripcion_sap, contenedores, sup_name,fecha, turno, status, destino) VALUES ?";
        const result = await dbC(query, [valores]); // Wrap the valores array in another array
        return result.affectedRows; // Returns the number of affected rows
    } catch (error) {
        console.error('DB-Error:', error.message);
        // You can log the error or handle it as needed
        throw error; // Rethrow the error for further handling
    }
}

funcion.backflushFG = async (serial) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result = await managed_client.call('ZWM_HU_MFHU', {
            I_EXIDV: `${funcion.addLeadingZeros(serial, 20)}`,
            I_VERID: '1'
        });
        return result;
    } catch {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}

funcion.getCurrentStockSem = async (part_number) => {
    try {
        const sql = `
            SELECT
                *
            FROM
                sem
            WHERE
                no_sap = "${part_number}"
        `;

        const result = await dbBartender(sql);
        return result;
    } catch (error) {
        throw error;
    }
};



funcion.update_sem_current_stock = async (part_number, current_stock) => {
    try {
        const sql = `
            UPDATE sem
            SET current_stock = "${current_stock}"
            WHERE no_sap = "${part_number}"
        `;

        const result = await dbBartender(sql, current_stock);
        return result;
    } catch (error) {
        throw error;
    }
};




funcion.update_sem_current_employee = async (part_number) => {
    try {
        const sql = `
            UPDATE sem
            SET current_employee = ''
            WHERE no_sap = "${part_number}"
        `;

        const result = await dbBartender(sql);
        return result;
    } catch (error) {
        throw error;
    }
};

funcion.mpStdQuant = (no_sap, table) => {
    return new Promise((resolve, reject) => {
        dbBartender(`
        SELECT
            std_pack
        FROM
            ${table}
        WHERE
            no_sap = "${no_sap}"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.sapRFC_HUEXT = async (storage_location, material, cantidad) => {
    let managed_client = await node_RFC.acquire();
    try {

        const result_packing_object = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID EQ 'UC${material}'` }],
            FIELDS: ['PACKNR']
        });

        const result_packing_material = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKPO',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `PACKNR EQ '${result_packing_object.DATA[0].WA}' AND PAITEMTYPE EQ 'P'` }],
            FIELDS: ['MATNR']
        });

        const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
            HEADERPROPOSAL: {
                PACK_MAT: result_packing_material.DATA[0].WA,
                HU_GRP3: 'UC11',
                PACKG_INSTRUCT: result_packing_object.DATA[0].WA,
                PLANT: '5210',
                L_PACKG_STATUS_HU: '2',
                HU_STATUS_INIT: 'A',
                STGE_LOC: storage_location
            },
            ITEMSPROPOSAL: [{
                HU_ITEM_TYPE: '1',
                MATERIAL: material,
                PACK_QTY: cantidad,
                PLANT: '5210',
            }],
        });

        const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        const result_hu_change_header = await managed_client.call('BAPI_HU_CHANGE_HEADER', {
            HUKEY: result_hu_create.HUKEY,
            HUCHANGED: {
                CLIENT: '200',
                PACK_MAT_OBJECT: '07',
                WAREHOUSE_NUMBER: '521',
                HU_STOR_LOC: 'A'
            },
        });

        const result_commit2 = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        return result_hu_create
    } catch (err) {
        return err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}


funcion.sapRFC_HUVUL = async (storage_location, material, cantidad) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result_packing_object = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID EQ 'UC${material}'` }],
            FIELDS: ['PACKNR']
        });

        const result_packing_material = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKPO',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `PACKNR EQ '${result_packing_object.DATA[0].WA}' AND PAITEMTYPE EQ 'P'` }],
            FIELDS: ['MATNR']
        });

        const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
            HEADERPROPOSAL: {
                PACK_MAT: result_packing_material.DATA[0].WA,
                HU_GRP3: 'UC11',
                PACKG_INSTRUCT: result_packing_object.DATA[0].WA,
                PLANT: '5210',
                L_PACKG_STATUS_HU: '2',
                HU_STATUS_INIT: 'A',
                STGE_LOC: storage_location
            },
            ITEMSPROPOSAL: [{
                HU_ITEM_TYPE: '1',
                MATERIAL: material,
                PACK_QTY: cantidad,
                PLANT: '5210',
            }],
        });

        const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        const result_hu_change_header = await managed_client.call('BAPI_HU_CHANGE_HEADER', {
            HUKEY: result_hu_create.HUKEY,
            HUCHANGED: {
                CLIENT: '200',
                PACK_MAT_OBJECT: '07',
                WAREHOUSE_NUMBER: '521',
                HU_STOR_LOC: 'A'
            },
        });

        const result_commit2 = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        return result_hu_create
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}

funcion.sapRFC_HUSEM = async (storage_location, material, cantidad) => {
    let managed_client
    try {
        managed_client = await node_RFC.acquire();

        const result_packing_object = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID EQ 'UC${material}'` }],
            FIELDS: ['PACKNR']
        });

        const result_packing_material = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKPO',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `PACKNR EQ '${result_packing_object.DATA[0].WA}' AND PAITEMTYPE EQ 'P'` }],
            FIELDS: ['MATNR']
        });

        const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
            HEADERPROPOSAL: {
                PACK_MAT: result_packing_material.DATA[0].WA,
                HU_GRP3: 'UC11',
                PACKG_INSTRUCT: result_packing_object.DATA[0].WA,
                PLANT: '5210',
                L_PACKG_STATUS_HU: '2',
                HU_STATUS_INIT: 'A',
                STGE_LOC: storage_location
            },
            ITEMSPROPOSAL: [{
                HU_ITEM_TYPE: '1',
                MATERIAL: material,
                PACK_QTY: cantidad,
                PLANT: '5210',
            }],
        });

        const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        const result_hu_change_header = await managed_client.call('BAPI_HU_CHANGE_HEADER', {
            HUKEY: result_hu_create.HUKEY,
            HUCHANGED: {
                CLIENT: '200',
                PACK_MAT_OBJECT: '07',
                WAREHOUSE_NUMBER: '521',
                HU_STOR_LOC: 'A'
            },
        });

        const result_commit2 = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        return result_hu_create
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }
}


funcion.sapRFC_get_packing_instruction = async (handlingUnit) => {
    let managed_client = await node_RFC.acquire();
    try {
        //1 First step scan HU and get packing instruction to use on table PACKKP and get all master packing instructions
        const result_hu_history = await managed_client.call('BAPI_HU_GETLIST', {
            NOTEXT: '',
            ONLYKEYS: '',
            HUNUMBERS: [funcion.addLeadingZeros(handlingUnit, 20)],
        });

        if (result_hu_history.HUHEADER.length > 1) {
            return ({ "error": "HU is part of a pallet" });
        }

        let hu_material_number = result_hu_history.HUITEM[0].MATERIAL;
        let hu_packing_instruction = result_hu_history.HUHEADER[0].PACKG_INSTRUCT
        // 2 Given the material number get the packing instructions from table PACKKP
        const result_packing_instructions = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID LIKE '%${hu_material_number}%' AND POBJID LIKE 'UM%'` }],
            FIELDS: ["PACKNR", "POBJID"]
        });



        // 2.1 At this point the user should select the correct master packing instruction to use
        const hu_packing_um_instructions = result_packing_instructions.DATA.map(row => {
            const formattedRow = {};
            row.WA.split(',').forEach((value, index) => {
                const fieldName = result_packing_instructions.FIELDS[index].FIELDNAME;
                formattedRow[fieldName] = value;
            });
            formattedRow["hu_packing_instruction"] = hu_packing_instruction;
            return formattedRow;
        });

        return hu_packing_um_instructions;
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }

}


funcion.sapRFC_get_packing_matreials = async (POBJID, PACKNR) => {
    let managed_client = await node_RFC.acquire();
    try {
        const result_packnr = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID EQ '${POBJID}'` }],
            FIELDS: ["PACKNR", "MAPACO_ITEM"]
        });


        const result_packing_materials = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKPO',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `PACKNR EQ '${PACKNR}' AND INDDEL NE 'X'` }],
            FIELDS: ["PACKITEMID", "MATNR", "PAITEMTYPE", "TRGQTY", "SUBPACKNR"]
        });

        const result_packingr_formatted = result_packnr.DATA.map(row => {
            const formattedRow = {};
            row.WA.split(',').forEach((value, index) => {
                const fieldName = result_packnr.FIELDS[index].FIELDNAME;
                formattedRow[fieldName] = value.trim();
            });
            return formattedRow;
        });

        const result_packing_materials_formatted = result_packing_materials.DATA.map(row => {
            const formattedRow = {};
            row.WA.split(',').forEach((value, index) => {
                const fieldName = result_packing_materials.FIELDS[index].FIELDNAME;
                formattedRow[fieldName] = value.trim();
            });
            return formattedRow;
        });

        return { result_packingr_formatted, result_packing_materials_formatted }
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }

}

funcion.sapRFC_pallet_request_create = async (array_handling_units, packing_materials, result_packingr_formatted, pallet_packing_material, packing_instruction, packing_id) => {
    const resultArray = array_handling_units.map(serial => funcion.addLeadingZeros(serial, 20));
    let managed_client = await node_RFC.acquire();
    try {
        const result_hus_history = await managed_client.call('BAPI_HU_GETLIST', {
            NOTEXT: 'X',
            ONLYKEYS: '',
            HUNUMBERS: resultArray,
        });

        const subpacknrOfTypeI = packing_materials
            .filter(item => item.PAITEMTYPE === 'I')
            .map(item => item.SUBPACKNR);

        const mismatchedObjects = result_hus_history.HUHEADER.filter(headerObj =>
            !subpacknrOfTypeI.includes(headerObj.PACKG_INSTRUCT)
        );
        //If there are mismatched objects then we return an error with the HU's of the problem ❌
        if (mismatchedObjects.length > 0) { return ({ "error": mismatchedObjects }); }

        //4.1 The HU's are sent to the correct storage bin in orther to be packed into the pallet
        for (let i = 0; i < resultArray.length; i++) {
            const result_hu_transfer = await managed_client.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: resultArray[i],
                I_BWLVS: '998',
                I_NLTYP: `923`,
                I_NLBER: '001',
                I_NLPLA: `PACK.BIN`
            });
        }

        //Creating item proposal with all the handling units
        const itemsProposal = array_handling_units.map((handlingUnit) => ({
            HU_ITEM_TYPE: "3",
            LOWER_LEVEL_EXID: funcion.addLeadingZeros(handlingUnit, 20),
            MATERIAL: result_hus_history.HUITEM[0].MATERIAL,
            PACK_QTY: result_hus_history.HUITEM[0].PACK_QTY,
            PLANT: result_hus_history.HUHEADER[0].PLANT,
        }));

        packing_materials.forEach((item) => {
            if (item.PAITEMTYPE === 'P' && item.MATNR !== pallet_packing_material[0]) {

                const exists = itemsProposal.some(
                    (proposalItem) =>
                        proposalItem.HU_ITEM_TYPE === '2' && // Check if HU_ITEM_TYPE is '2'
                        proposalItem.MATERIAL === item.MATNR // Check if MATERIAL matches
                );
                if (!exists) {
                    itemsProposal.push({
                        HU_ITEM_TYPE: "2",
                        MATERIAL: item.MATNR,
                        PACK_QTY: parseFloat(item.TRGQTY),
                        PLANT: result_hus_history.HUHEADER[0].PLANT,
                    });
                }

            }
        });

        //5 If the pallet is correct then we can proceed to create the pallet
        const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
            HEADERPROPOSAL: {
                PACK_MAT: pallet_packing_material[0],
                // HU_GRP3: result_hu_history.HUHEADER[0].HU_GRP3,
                PACKG_INSTRUCT: result_packingr_formatted[0].PACKNR,
                PLANT: result_hus_history.HUHEADER[0].PLANT,
                // L_PACKG_STATUS_HU: '2',
                HU_STATUS_INIT: 'A',
                EXT_ID_HU_2: 'P'
            },
            ITEMSPROPOSAL: itemsProposal
        });

        const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        const result_um_transfer = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: result_hu_create.HUKEY,
            I_BWLVS: '998',
            I_NLTYP: `SHP`,
            I_NLBER: '001',
            I_NLPLA: `SHP`
        });

        if (result_hu_create.HUKEY) {
            let dataPrint = {
                "printer": "\\\\tftdelsrv003\\tftdelprn060",
                "serial_um": parseFloat(result_hu_create.HUKEY),
                "storage_bin": "SHP",
                "serial_uc": array_handling_units[0],
            }
            funcion.printLabel_ONT_UM(dataPrint, "ONT_UM")
        }

        return result_hu_create;
    } catch (err) {
        throw err;
    } finally {
        if (managed_client) { managed_client.release() };
    }

}


funcion.printLabel_EXT = async (data, labelType) => {
    try {
        const result = await axios({
            method: 'POST',
            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/${labelType}/Execute/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        });
        return result;
    } catch (err) {
        throw err;
    }
};

funcion.printLabel_VUL = async (station, P_material, _material, cantidad, subline, serial_num) => {
    const labelType = "VULC"
    try {
        const result_printer = await funcion.getPrinter(station);
        if (result_printer.length === 0) { return res.json({ "key": `Printer not set for device ${station}` }) }
        const materialResult = await funcion.materialVUL(P_material);
        if (materialResult.length === 0) { return res.json({ "key": `Part number not set in database ${_material}` }) }
        const data = {
            printer: result_printer[0].impre,
            no_sap: materialResult[0].no_sap,
            assembly: materialResult[0].assembly,
            cust_part: materialResult[0].cust_part,
            // platform: materialResult[0].platform,
            rack: materialResult[0].rack,
            rack_return: materialResult[0].rack_return,
            // family: materialResult[0].family,
            // length: materialResult[0].length,
            line: subline,
            std_pack: `${parseInt(materialResult[0].std_pack)}`,
            real_quant: `${parseInt(cantidad)}`,
            serial_num: `${parseInt(serial_num)}`,
            client: materialResult[0].client,
            platform: "VULC"
        };
        // let printedLabel = await funcion.printLabel_VUL(data, "VULC")
        // if (printedLabel.status !== 200) { return res.json({ "key": `Label print error check Bartender Server` }) }

        const printedLabel = await axios({
            method: 'POST',
            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/${labelType}/Execute/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        });
        return printedLabel;
    } catch (err) {
        throw err;
    }
};

funcion.printLabel_SEM = async (station, P_material, _material, cantidad, subline, serial_num) => {
    const labelType = "SUB"
    try {
        const result_printer = await funcion.getPrinter(station);
        if (result_printer.length === 0) { return res.json({ "key": `Printer not set for device ${station}` }) }
        const materialResult = await funcion.materialSEM(P_material);
        if (materialResult.length === 0) { return res.json({ "key": `Part number not set in database ${_material}` }) }
        const data = {
            printer: result_printer[0].impre,
            no_sap: materialResult[0].no_sap,
            assembly: materialResult[0].assembly,
            cust_part: materialResult[0].cust_part,
            // platform: materialResult[0].platform,
            rack: materialResult[0].rack,
            rack_return: materialResult[0].rack_return,
            // family: materialResult[0].family,
            // length: materialResult[0].length,
            line: subline,
            std_pack: `${parseInt(materialResult[0].std_pack)}`,
            real_quant: `${parseInt(cantidad)}`,
            serial_num: `${parseInt(serial_num)}`,
            client: materialResult[0].client,
            platform: "VULC"
        };
        // let printedLabel = await funcion.printLabel_VUL(data, "VULC")
        // if (printedLabel.status !== 200) { return res.json({ "key": `Label print error check Bartender Server` }) }

        const printedLabel = await axios({
            method: 'POST',
            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/${labelType}/Execute/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        });
        return printedLabel;
    } catch (err) {
        throw err;
    }
};

funcion.printLabel_ONT_UM = async (data, labelType) => {
    try {
        const result = await axios({
            method: 'POST',
            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/${labelType}/Execute/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        });
        return result;
    } catch (err) {
        throw err;
    }
};

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
//                 if (managed_client) { managed_client.release() }
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
//                 if (managed_client) { managed_client.release() }
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
//             if (managed_client) { managed_client.release() }
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
//                 if (managed_client) { managed_client.release() }
//             })
//     })


// // todo probar promise all
// node_RFC.acquire()
//     .then(managed_client => {
//         managed_client.call('BAPI_GOODSMVT_CREATE',
//             {
//                 GOODSMVT_CODE: { GM_CODE: "06" },
//                 GOODSMVT_HEADER: {
//                     PSTNG_DATE: '20230202',
//                     DOC_DATE: '20230202',
//                     HEADER_TXT: 'NODEJS_TEST',
//                 },
//                 GOODSMVT_ITEM: [
//                     {
//                         MATERIAL: '5000010065A0',
//                         PLANT: '5210',
//                         STGE_LOC: '0012',
//                         MOVE_TYPE: '551',
//                         ENTRY_QNT: '1.000',
//                         COSTCENTER: '0052101020',
//                         MOVE_REAS: '5204',
//                         PROFIT_CTR: '0052100000',
//                         BASE_UOM: 'PC',
//                     }
//                 ]
//             }
//         )
//             .then(result => {
//                 console.log(result);
//                 managed_client.call("BAPI_TRANSACTION_COMMIT",{WAIT:"X"})
//                 if (managed_client) { managed_client.release() }

//                 // managed_client.invoke('BAPI_GOODSMVT_CREATE', structure_scrap, function(err,res){       
//                 //     managed_client.invoke('BAPI_TRANSACTION_COMMIT',{}, function(err,res){
//                 //         console.log('committed?');
//                 //         console.log(err);
//                 //         console.log(res);
//                 //     });

//                 //     if (err) {
//                 //         return console.error('Error invoking BAPI_COSTCENTER_CHANGEMULTIPLE:', err);
//                 //     }

//                 //     console.log('update cc res:', res);
//                 // })   

//             })
//             .catch(err => {
//                 console.error(err);
//                 if (managed_client) { managed_client.release() }
//             })
//     })
//     .catch(err => {
//         console.error(err);
//         if (managed_client) { managed_client.release() }
//     })


// node_RFC.acquire()
// .then(managed_client => {

//     structure_scrap =  {
//         GOODSMVT_CODE: { GM_CODE: "06" },
//         GOODSMVT_HEADER: {
//             PSTNG_DATE: '20230213',
//             DOC_DATE: '20230213',
//             HEADER_TXT: 'NODEJS_TEST',
//         },
//         GOODSMVT_ITEM: [
//             {
//                 MATERIAL: '5000010065A0',
//                 PLANT: '5210',
//                 STGE_LOC: '0012',
//                 MOVE_TYPE: '551',
//                 ENTRY_QNT: '1.000',
//                 COSTCENTER: '0052101020',
//                 MOVE_REAS: '5204',
//                 PROFIT_CTR: '0052100000',
//                 BASE_UOM: 'PC',
//             }
//         ]
//     }

//     managed_client.invoke('BAPI_GOODSMVT_CREATE', structure_scrap, function(err,res){       
//         managed_client.invoke('BAPI_TRANSACTION_COMMIT',{}, function(err,res){
//             console.log('committed?');
//             console.log(err);
//             console.log(res);
//         });

//         if (err) {
//             return console.error('Error invoking BAPI_COSTCENTER_CHANGEMULTIPLE:', err);
//         }

//         console.log('update cc res:', res);
//     })  

// })
// .catch(err => {
//     console.error(err);
//     if (managed_client) { managed_client.release() }
// })



// node_RFC.acquire()
//     .then(managed_client => {
//         managed_client.call('ZWM_HU_MFHU',
//             {
//                 I_EXIDV: `${funcion.addLeadingZeros(185173746, 20)}`,
//                 I_VERID: '1'
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//                 if (managed_client) { managed_client.release() }
//             })
//     })

// * NO BORRAR CON ESTE PROCESO SE CREA ETIQUETA Y SE ACREDITA
// const sap_number = '7000016497A0';
// const sap_cantidad = '2';

// funcion.sapRFC_createHU = async function main() {
//     let managed_client = await node_RFC.acquire();
//     try {
//         const result_packing_object = await managed_client.call('RFC_READ_TABLE', {
//             QUERY_TABLE: 'PACKKP',
//             DELIMITER: ",",
//             OPTIONS: [{ TEXT: `POBJID EQ 'UC${sap_number}'` }],
//             FIELDS: ['PACKNR']
//         });

//         const result_packing_material = await managed_client.call('RFC_READ_TABLE', {
//             QUERY_TABLE: 'PACKPO',
//             DELIMITER: ",",
//             OPTIONS: [{ TEXT: `PACKNR EQ '${result_packing_object.DATA[0].WA}' AND PAITEMTYPE EQ 'P'` }],
//             FIELDS: ['MATNR']
//         });

//         const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
//             HEADERPROPOSAL: {
//                 PACK_MAT: result_packing_material.DATA[0].WA,
//                 HU_GRP3: 'UC11',
//                 PACKG_INSTRUCT: result_packing_object.DATA[0].WA,
//                 PLANT: '5210',
//                 L_PACKG_STATUS_HU: '2',
//                 HU_STATUS_INIT: 'A',
//             },
//             ITEMSPROPOSAL: [{
//                 HU_ITEM_TYPE: '1',
//                 MATERIAL: sap_number,
//                 PACK_QTY: sap_cantidad,
//                 PLANT: '5210',
//             }],
//         });

//         const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

//         const result_hu_change_header = await managed_client.call('BAPI_HU_CHANGE_HEADER', {
//             HUKEY: result_hu_create.HUKEY,
//             HUCHANGED: {
//                 CLIENT: '200',
//                 PACK_MAT_OBJECT: '07',
//                 WAREHOUSE_NUMBER: '521',
//                 HU_STOR_LOC: 'A'
//             },
//         });

//         const result_commit2 = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

//         const result_backflush = await managed_client.call('ZWM_HU_MFHU', {
//             I_EXIDV: `${result_hu_change_header.HUKEY}`,
//             I_VERID: '1',
//             I_LGORT: '0014'
//         });



//         const result_hu_get_list_msg = await managed_client.call('BAPI_HU_GET_LIST_MSG', {

//                 HUKEY: [result_backflush.I_EXIDV],
//                 MESSAGEKEY: [result_backflush.E_RETURN.MESSAGE],
//                 RETURN: [result_backflush.E_RETURN]

//         });
//         console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐\n", result_hu_create);
//         console.log("✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋✋\n", result_hu_change_header);
//         console.log("⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️\n", result_backflush);
//         console.log("⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓⚓\n", result_hu_get_list_msg);

//         const result_hu_process_msg = await managed_client.call('BAPI_HU_PROCESS_MSG', {

//             MESSAGEKEY: result_hu_get_list_msg.MESSAGEKEY,
//             MESSAGEPROTOCOL:[],
//             RETURN: result_hu_get_list_msg.RETURN

//     });


//         console.log("✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️", result_hu_process_msg);

//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (managed_client) { managed_client.release() };
//     }
// }

// funcion.sapRFC_createHU()

const test_hu_number = '00000000000187631125';


funcion.sapRFC_createHU = async function main() {
    let managed_client = await node_RFC.acquire();
    try {
        //1 First step scan HU and get packing instruction to use on table PACKKP and get all master packing instructions
        const result_hu_history = await managed_client.call('BAPI_HU_GETLIST', {
            NOTEXT: '',
            ONLYKEYS: '',
            HUNUMBERS: [test_hu_number],
        });


        let hu_material_number = result_hu_history.HUITEM[0].MATERIAL;
        // 2 Given the material number get the packing instructions from table PACKKP
        const result_packing_instructions = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID LIKE '%${hu_material_number}%' AND POBJID LIKE 'UM%'` }],
            FIELDS: ["PACKNR", "POBJID"]
        });



        // 2.1 At this point the user should select the correct master packing instruction to use
        const hu_packing_um_instructions = result_packing_instructions.DATA.map(row => {
            const formattedRow = {};
            row.WA.split(',').forEach((value, index) => {
                const fieldName = result_packing_instructions.FIELDS[index].FIELDNAME;
                formattedRow[fieldName] = value;
            });
            return formattedRow;
        });


        // 2.2 Once the user selected the correct packing instruction, get the packing materials for that packing instruction from table PACKPO
        // Note Just using dummy selection for now basically whatever is in poistion 0 of the array
        const result_packnr = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKKP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `POBJID EQ '${hu_packing_um_instructions[0].POBJID}'` }],
            FIELDS: ["PACKNR", "MAPACO_ITEM"]
        });


        const result_packing_materials = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'PACKPO',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `PACKNR EQ '${result_packnr.DATA[0].WA.split(',')[0]}' ` }],
            FIELDS: ["PACKITEMID", "MATNR", "PAITEMTYPE", "TRGQTY", "SUBPACKNR"]
        });

        //2.3 At this point this information is sent to the user device so the device stores it, this has all the packing materials used in next steps
        const result_packing_materials_formatted = result_packing_materials.DATA.map(row => {
            const formattedRow = {};
            row.WA.split(',').forEach((value, index) => {
                const fieldName = result_packing_materials.FIELDS[index].FIELDNAME;
                formattedRow[fieldName] = value.trim();
            });
            return formattedRow;
        });

        //3 At this point the screen will prompt the user to scan all the HU's limiting it to the result_packing_materials_formatted array where the PAITEMTYPE is I
        //Note at this point we pretend to receive an array of HU's or could get one by one needs testing for speed
        let array_handling_units = [
            '00000000000187611800',
            '00000000000187506265',
            '00000000000187506158',
            '00000000000187506099',
            '00000000000187506078',
            '00000000000187505980',
            '00000000000187611542',
            '00000000000187611429',
            '00000000000187611357',
            '00000000000187611318',
            '00000000000187611174',
            '00000000000187611079',
            '00000000000187611045',
            '00000000000187610998',
            '00000000000187610933',
            '00000000000187610882',
            '00000000000187610790',
            '00000000000187610432',
            '00000000000187610417',
            '00000000000187610284',
            '00000000000187610216',
        ]

        const subpacknrquantity = result_packing_materials_formatted
            .filter(item => item.PAITEMTYPE === 'I')
            .map(item => item.TRGQTY);

        const pallet_packing_material = result_packing_materials_formatted
            .filter(item => item.PACKITEMID === result_packnr.DATA[0].WA.split(',')[1])
            .map(item => item.MATNR);


        if (array_handling_units.length > parseFloat(subpacknrquantity[0])) {
            console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌', 'The number of handling units is greater than the quantity of the subpacking instruction');
        } else {
            console.log('✔️✔️✔️✔️✔️✔️✔️✔️✔️✔️✔️✔️✔️✔️', 'The number of handling units is less or equal than the quantity of the subpacking instruction');
        }

        //3.1 With an array of HU's we check if the provided handling units and their packing instruction matches th subpacking instruction of the master packing instruction
        //This way we know the materials are the same and correspond to the pallet
        const result_hus_history = await managed_client.call('BAPI_HU_GETLIST', {
            NOTEXT: 'X',
            ONLYKEYS: '',
            HUNUMBERS: array_handling_units,
        });

        //Getting the master sub packing instruction
        const subpacknrOfTypeI = result_packing_materials_formatted
            .filter(item => item.PAITEMTYPE === 'I')
            .map(item => item.SUBPACKNR);

        //Filtering the handling units that do not match the subpacking instruction
        //Variable mismatchedObjects contains the handling units that do not match the subpacking instruction
        //If the variable is not empty then the user should be notified that the pallet is not correct
        //4 At this point the user should be notified if the pallet is correct or not
        const mismatchedObjects = result_hus_history.HUHEADER.filter(headerObj =>
            !subpacknrOfTypeI.includes(headerObj.PACKG_INSTRUCT)
        );

        //4.1 The HU's are sent to the correct storage bin in orther to be packed into the pallet
        for (let i = 0; i < array_handling_units.length; i++) {
            const result_hu_transfer = await managed_client.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: array_handling_units[i],
                I_BWLVS: '998',
                I_NLTYP: `923`,
                I_NLBER: '001',
                I_NLPLA: `PACK.BIN`
            });
        }

        //Creating item proposal with all the handling units
        const itemsProposal = array_handling_units.map((handlingUnit) => ({
            HU_ITEM_TYPE: "3",
            LOWER_LEVEL_EXID: handlingUnit,
            MATERIAL: hu_material_number,
            PACK_QTY: result_hu_history.HUITEM[0].PACK_QTY,
            PLANT: result_hu_history.HUHEADER[0].PLANT,
        }));
        // Adding the separate object for HU_ITEM_TYPE: "2"
        itemsProposal.push({
            HU_ITEM_TYPE: "2",
            MATERIAL: result_packing_materials.DATA[2].WA.split(',')[1],
            PACK_QTY: parseFloat(result_packing_materials.DATA[2].WA.split(',')[3]),
            PLANT: result_hu_history.HUHEADER[0].PLANT,
        });


        //5 If the pallet is correct then we can proceed to create the pallet
        const result_hu_create = await managed_client.call('BAPI_HU_CREATE', {
            HEADERPROPOSAL: {
                PACK_MAT: pallet_packing_material[0],
                // HU_GRP3: result_hu_history.HUHEADER[0].HU_GRP3,
                PACKG_INSTRUCT: hu_packing_um_instructions[0].PACKNR,
                PLANT: result_hu_history.HUHEADER[0].PLANT,
                // L_PACKG_STATUS_HU: '2',
                HU_STATUS_INIT: 'A',
                EXT_ID_HU_2: 'P'
            },
            ITEMSPROPOSAL: itemsProposal
        });

        const result_commit = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        //6 Need to transfer all hu's to storage bin 


        // //####################This code might be deleted######################
        // // const result_hu_transfer1 = await managed_client.call('L_TO_CREATE_MOVE_SU', {
        // //     I_LENUM: result_hu_create.HUHEADER.HU_EXID,
        // //     I_BWLVS: '998',
        // //     I_NLTYP: `923`,
        // //     I_NLBER: '001',
        // //     I_NLPLA: `PACK.BIN`
        // // });

        // //7 At this point the pallet is created and we can proceed to pack the handling units into the pallet
        // // const result_hu_pack = await managed_client.call('BAPI_HU_PACK', {
        // //     HUKEY: result_hu_create.HUHEADER.HU_EXID,
        // //     ITEMPROPOSAL:{
        // //         HU_ITEM_TYPE: "3",
        // //         LOWER_LEVEL_EXID: array_handling_units[1],
        // //     }

        // // });
        // //####################This code might be deleted######################
        // // const result_hu_repack = await managed_client.call('BAPI_HU_REPACK', {
        // //     HUKEY: result_hu_create.HUHEADER.HU_EXID,
        // //     REPACK: [{
        // //         SOURCE_HU: array_handling_units[1],
        // //         FLAG_PACKHU: 'x',
        // //         PACK_QTY: '1',
        // //     }]

        // // });

        // // const result_commit2 = await managed_client.call("BAPI_TRANSACTION_COMMIT", { WAIT: "X" });

        // console.log('✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️✏️', parseFloat(subpacknrquantity[0]));
        // console.log('⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐', mismatchedObjects);
        // console.log("✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️", result_packing_materials_formatted);
        // console.log("⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕⭕", result_hus_history);
        console.log("⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽⛽", result_hu_create);
        // console.log("✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️✈️", result_hu_repack);

    } catch (err) {
        console.error(err);
    } finally {
        if (managed_client) { managed_client.release() };
    }
}

// funcion.sapRFC_createHU()



module.exports = funcion;