const funcion = {};

const db = require('../../db/conn_empleados');
const dbC = require('../../db/conn_cycle');
const dbEX = require('../../db/conn_extr');
const dbA = require('../../db/conn_areas');
const dbBartender = require('../../db/conn_b10_bartender');
const dbBartenderExt = require('../../db/conn_b10_bartender_ext');
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
        dbBartenderExt(`
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



funcion.sapRFC_transferFG = async (serial, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: 'FG',
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        managed_client.release();
        return result;
    } catch (error) {
        throw error;
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

funcion.sapRFC_consultaMaterial_ST = async (material_number, storage_location, storage_type) => {
    try {
        const managed_client = await node_RFC.acquire();

        const options = {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `MATNR EQ '${material_number.toUpperCase()}' AND LGORT EQ '${storage_location}' AND LGTYP EQ '${storage_type}' ` }]
        };

        const result = await managed_client.call('RFC_READ_TABLE', options);

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));
        managed_client.release();
        return res;
    } catch (error) {
        throw error;
    };
}



funcion.sapRFC_consultaStorageUnit = async (storage_unit) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LENUM EQ '${storage_unit}' ` }]
        });

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));

        managed_client.release();
        return res;
    } catch (error) {
        throw error;
    }
};



funcion.sapRFC_ConsultaMaterialMM03 = async (material_number) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('BAPI_MATERIAL_GET_DETAIL', {
            MATERIAL: `${material_number}`, /* Material no. */
        });

        managed_client.release();
        return result;
    } catch (error) {
        throw error;
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


funcion.sapRFC_partialTransferStorageUnit = async (material_number, transfer_quantity, source_storage_location, source_storage_type, source_storage_unit, destination_storage_type, destination_storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

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

        managed_client.release();
        return result;
    } catch (error) {
        throw error;
    }
}


funcion.sapRFC_transferEXTProd = async (serial, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

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
        managed_client.release();
        if (res.length === 0) {
            return ({ "key": "SU_DOESNT_EXIST", "abapMsgV1": `${serial}` });

        } else if (res[0].LGORT !== storage_location) {
            return ({ "key": "Storage Locations do not match", "abapMsgV1": `${serial}` });
        } else {
            const managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                I_BWLVS: '998',
                I_LETYP: 'IP',
                I_NLTYP: storage_type.toUpperCase(),
                I_NLBER: '001',
                I_NLPLA: storage_bin.toUpperCase()
            });
            managed_client2.release();
            return result;
        }
    } catch (err) {
        throw err;
    }
}


funcion.sapRFC_transferVULProd = async (serial, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

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
        managed_client.release();
        if (res.length === 0) {
            return ({ "key": "SU_DOESNT_EXIST", "abapMsgV1": `${serial}` });

        } else if (res[0].LGTYP !== "VUL" || res[0].LGORT !== storage_location) {
            return ({ "key": `Check SU SType: ${res[0].LGTYP}, SLocation: ${res[0].LGORT}`, "abapMsgV1": `${serial}` });
        } else {
            const managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', {
                I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
                I_BWLVS: '998',
                I_LETYP: 'IP',
                I_NLTYP: storage_type.toUpperCase(),
                I_NLBER: '001',
                I_NLPLA: storage_bin.toUpperCase()
            });
            managed_client2.release();
            return result;
        }
    } catch (err) {
        throw err;
    }
}


funcion.sapRFC_transferProdVul_1 = async (material, qty, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();
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

            managed_client.release();
            return result;
        } catch (err) {
            managed_client.release();
            throw err;
        }
    } catch (err) {
        throw err;
    }
};


funcion.sapRFC_transferProdVul_2 = async (material, qty, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();
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

            managed_client.release();
            return result;
        } catch (err) {
            managed_client.release();
            throw err;
        }
    } catch (err) {
        throw err;
    }
};

funcion.sapRFC_transferProdSem_1 = async (material, qty, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();
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
            
            managed_client.release();
            return result;
        } catch (err) {
            managed_client.release();
            throw err;
        }
    } catch (err) {
        throw err;
    }
};


funcion.sapRFC_transferProdSem_2 = async (material, qty, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();
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
            
            managed_client.release();
            return result;
        } catch (err) {
            managed_client.release();
            throw err;
        }
    } catch (err) {
        throw err;
    }
};

funcion.sapRFC_transferVul = async (serial, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `VUL`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        managed_client.release();
        return result;
    } catch (err) {
        return Promise.reject(err);
    }
};


funcion.sapRFC_transferSemProd = async(serial, storage_type, storage_bin) =>{
    try {
        const managed_client = await node_RFC.acquire();

        const parameters = {
            I_LENUM: `${funcion.addLeadingZeros(serial, 20)}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        };

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', parameters);
        managed_client.release();
        return result;
    } catch (err) {
        throw err;
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
//         managed_client.release();
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
//         managed_client.release();
//         return result;
//     } catch (err) {
//         console.error(err); // Log the error
//         throw err;
//     }
// }

funcion.sapRFC_transferMP = async (storage_unit, storage_type, storage_bin, emp_num, estacion) => {
    try {
        const result = await funcion.sapRFC_consultaStorageUnit(funcion.addLeadingZeros(storage_unit, 20));

        const storageLocation = await funcion.getStorageLocation(estacion);
        const storage_location = storageLocation[0].storage_location;
        console.log(storage_location);
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

        const managed_client = await node_RFC.acquire();
        const resultLTO = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(storage_unit, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: `${storage_type}`,
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        managed_client.release();
        funcion.insertCompleteTransfer(emp_num, storage_type, storage_unit, storage_bin.toUpperCase(), resultLTO.E_TANUM);
        return resultLTO;
    } catch (error) {
        return error;
    }
}

funcion.sapRFC_transferMP_BetweenStorageTypes = async (storage_unit, storage_type, storage_bin, emp_num) => {
    try {
        const storageUnitInfo = await funcion.sapRFC_consultaStorageUnit(storage_unit);

        if (storageUnitInfo.length === 0) {
            throw ({ "key": "DEL: Check your entries", "abapMsgV1": `${serial}` });
        }

        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${storage_unit}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        });

        funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, result.E_TANUM);
        managed_client.release();

        return result;
    } catch (error) {
        funcion.insertCompleteTransfer(emp_num, storage_type, (storage_unit).replace(/^0+/gm, ""), storage_bin, error.message);
        throw error;
    }
};




funcion.sapRFC_transferMP1_DEL = async (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${funcion.addLeadingZeros(storage_unit, 20)}`,
            I_BWLVS: '998',
            I_LETYP: 'IP',
            I_NLTYP: `${storage_type}`,
            I_NLBER: '001',
            I_NLPLA: `${storage_bin.toUpperCase()}`
        });

        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, result.E_TANUM);
        managed_client.release();

        return result;
    } catch (err) {
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, err.message);
        throw err;
    }
};


funcion.sapRFC_transferMP1_DELX = async (storage_unit, storage_type, storage_bin, material, cantidad, emp_num, raw_id) => {
    try {
        const managed_client = await node_RFC.acquire();

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
        managed_client.release();
        const managed_client2 = await node_RFC.acquire();
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
        managed_client2.release();
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, result_transfer998.E_TANUM);

        return result_transfer998;
    } catch (err) {
        funcion.insertRawMovement(raw_id, storage_type, emp_num, storage_unit, err.message);
        return err;
    }
};


funcion.sapRFC_transferMP_Obsoletos = async (storage_unit, storage_type, storage_bin, emp_num, raw_id) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('L_TO_CREATE_MOVE_SU', {
            I_LENUM: `${storage_unit}`,
            I_BWLVS: `998`,
            I_LETYP: `IP`,
            I_NLTYP: `${storage_type}`,
            I_NLBER: `001`,
            I_NLPLA: `${storage_bin}`
        });

        await funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${result.E_TANUM}`);

        managed_client.release();
        return result;
    } catch (err) {
        await funcion.insertRawMovement(raw_id, storage_type, emp_num, (storage_unit).replace(/^0+/gm, ""), `${storage_bin}-${err.message}`);
        throw err;
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

funcion.sapRFC_SbinOnStypeExists = async (storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LAGP',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `LGNUM EQ 521 AND LGTYP EQ '${storage_type}' AND LGPLA EQ '${storage_bin}'` }]
            // FIELDS: ["MATNR", "LGORT", "LGTYP", "LGPLA"]
        });
        const fields = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(fields.map((key, i) => [key, row[i]])));
        managed_client.release();
        return res;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
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

funcion.sapRFC_consultaMaterial_SEM = async (material_number, storage_location, storage_type) => {
    try {
        const managed_client = await node_RFC.acquire();
        const result = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'LQUA',
            DELIMITER: ",",
            OPTIONS: [{ TEXT: `MATNR EQ ${material_number.toUpperCase()} AND LGTYP EQ '${storage_type}' AND LGORT EQ '${storage_location}'` }]
        });

        const columns = result.FIELDS.map(field => field.FIELDNAME);
        const rows = result.DATA.map(data_ => data_.WA.split(","));
        const res = rows.map(row => Object.fromEntries(columns.map((key, i) => [key, row[i]])));

        managed_client.release();
        return res;
    } catch (err) {
        throw err;
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

funcion.sapRFC_transferSlocCheck = async (serial, storage_location, storage_type, storage_bin) => {
    try {
        const managed_client = await node_RFC.acquire();

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
        managed_client.release();

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
            const managed_client2 = await node_RFC.acquire();
            const result = await managed_client2.call('L_TO_CREATE_MOVE_SU', inputParameters);
            managed_client2.release();
            return result;
        }
    } catch (err) {
        throw err;
    }
};


funcion.sapRFC_materialDescription = async (material_number) => {
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('BAPI_MATERIAL_GET_DETAIL', {
            MATERIAL: `${material_number}`,
        });
        managed_client.release();
        return result;
    } catch (err) {
        throw err;
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
    try {
        const managed_client = await node_RFC.acquire();

        const result = await managed_client.call('ZWM_HU_MFHU', {
            I_EXIDV: `${funcion.addLeadingZeros(serial, 20)}`,
            I_VERID: '1'
        });
        managed_client.release();
        return result;
    } catch {
        throw err;
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
//                 managed_client.release()

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
//                 managed_client.release()
//             })
//     })
//     .catch(err => {
//         console.error(err);
//         managed_client.release()
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
//     managed_client.release()
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
//                 managed_client.release()
//             })
//     })

// * NO BORRAR CON ESTE PROCESO SE CREA ETIQUETA Y SE ACREDITA
// const sap_number = '7000016497A0';
// const sap_cantidad = '2';

// funcion.sapRFC_createHU = async function main() {
//     try {
//         const managed_client = await node_RFC.acquire();

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

//         managed_client.release();

        
//         console.log("✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️✒️", result_hu_process_msg);

//     } catch (err) {
//         console.error(err);
//     }
// }

// funcion.sapRFC_createHU()





module.exports = funcion;