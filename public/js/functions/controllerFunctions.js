const funcion = {};

const db = require('../../db/conn_empleados');
const dbC = require('../../db/conn_cycle');
const dbEX = require('../../db/conn_extr');
const dbA = require('../../db/conn_areas');
const dbBartender = require('../../db/conn_b10_bartender');

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

        let sql  = `INSERT INTO cycle_count (storage_type, storage_bin, storage_unit, emp_num, status) VALUES ?`;

        dbC(sql, [arreglo_arreglos])
        .then((result) => {
            resolve(result.affectedRows)
        })
        .catch((error) => { reject(error) })

    })

}

funcion.insertListed_OKBIN = (storage_type, storage_bin, storage_units, emp_num) => {
    return new Promise((resolve, reject) => {
  

        let sql  = `INSERT INTO cycle_count (storage_type, storage_bin, storage_unit, emp_num, status) VALUES ?`;

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
            .catch((error) => { reject(error)   })
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

        let sql  = `INSERT INTO ${tabla} (${titulos.join()},sup_name,fecha,turno) VALUES ?`;
        
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
            .then((result) => {resolve(result) })
            .catch((error) => {reject(error) })
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
            .then((result) => {resolve(result) })
            .catch((error) => {reject(error) })
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
            .then((result) => {resolve(result) })
            .catch((error) => {reject(error) })
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
            .then((result) => {resolve(result) })
            .catch((error) => {reject(error) })
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


funcion.sapFromMandrel = (mandrel, table) =>{
    return new Promise((resolve, reject) =>{
        dbBartender(`
        SELECT
            no_sap
        FROM
            ${table}
        WHERE
            cust_part = "${mandrel}"
        `)
        .then((result) => { resolve(result) })
        .catch((error) => { reject(error)})
    })
}
module.exports = funcion;