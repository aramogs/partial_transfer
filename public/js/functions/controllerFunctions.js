const funcion = {};

const db = require('../../db/conn_empleados');


funcion.getUsers = (user) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
            emp_nombre
        FROM
            del_empleados
        LEFT JOIN 
            del_accesos
        ON 
            emp_id = acc_id
        WHERE
            emp_id = ${user}
        AND 
            acc_pt = 1
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



module.exports = funcion;