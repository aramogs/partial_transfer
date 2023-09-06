let value = false
let part_num = document.getElementById("part_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo2 = document.getElementById("alerta_prefijo2")
// let submitMaterial = document.getElementById("submitMaterial")
let inp_verifyFIFO = document.getElementById("inp_verifyFIFO")
let submitSerials = document.getElementById("submitSerials")

// let submitCantidad = document.getElementById("submitCantidad")
// let cantidadSubmit = document.getElementById("cantidadSubmit")
// let alerta_cantidad = document.getElementById("alerta_cantidad")
// let Bserial = document.getElementById("Bserial")
// let Bmaterial = document.getElementById("Bmaterial")
// let Bstock = document.getElementById("Bstock")
// let Bdescription = document.getElementById("Bdescription")
// let Bweigth = document.getElementById("Bweigth")

let errorTextField = document.getElementById("errorTextField")

// let currentST = document.getElementById("currentST")

let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
let btnCerrar = document.querySelectorAll(".btnCerrar")

let successText = document.getElementById("successText")
let btnTransferir = document.getElementById("btnTransferir")
let user_id = document.getElementById("user_id")
let storage_type = document.getElementById("storage_type")

let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let tabla_consulta2 = document.getElementById('tabla_consulta2').getElementsByTagName('tbody')[0];
let cScan = document.getElementById("cScan")
let cPartNum = document.getElementById("cPartNum")
let cDescription = document.getElementById("cDescription")
let btnExtraMaterial = document.getElementById("btnExtraMaterial")
let tabla_consulta_container = document.getElementById("tabla_consulta_container")

///////////////////////////////////////
let contenedores = 0
let id = ""
let serials = []
let serials_obsoletos = []
let array_fifo = []
let currentSU = ""
let selected_serials = []
let dates = {}
let turno = ""
let lower_date = "12/12/9999"
let table = $('#tableListado').DataTable({ dom: 'frt' })
let tableExtraMaterial = $('#tableExtraMaterial').DataTable({ dom: 'frtp' })
let regexBefore = /\-(.*)/
let regexAfter = /^(.*?)\-/
let currentCount = 0
let procesoActual = ""
let destino = document.getElementById("destino").innerText
///////////////////////////////////////

$(document).ready(function () {

    axios({
        method: 'get',
        url: "/getRawListado",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((result) => {
            let response = result.data
            if ((response).includes("<!DOCTYPE html>")) {
                setTimeout(() => {
                    location.href = "/login"
                }, 1000);
                soundWrong()
            }
            response.forEach(element => {
                if (destino === element.destino) {
                    table.row.add([
                        `<button id="${element.id}" onClick="submitMaterial(this, 'inicio')" class="btn btn-outline-dark btn-sm ">${element.numero_sap}-${element.turno}</button>`,
                        element.contenedores,
                        element.descripcion_sap,
                        moment(element.fecha).format('MM/DD/YYYY')
                    ]).draw(false);
                }
            });
        })
        .catch((err) => { console.error(err) })

})

btnTransferir.addEventListener("click", transferSU)
btnExtraMaterial.addEventListener("click", extraMaterial)

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
})

function submitMaterial(e, proceso) {
    procesoActual = proceso
    let material = e.innerHTML.replace(regexBefore, "")
    turno = e.innerHTML.replace(regexAfter, "")
    contenedores = e.parentElement.nextElementSibling.innerHTML
    descripcion = e.parentElement.nextElementSibling.nextElementSibling.innerHTML
    id = e.id
    serials = []

    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    setTimeout(() => { $('#modalExtraMaterial').modal('hide') }, 500);

    let datax = { "proceso": "raw_fifo_verify", "material": `${material}`, "user_id": user_id.innerHTML, "storage_type": `${storage_type.innerHTML}`, "raw_id": `${id}` };
    axios({
        method: 'post',
        url: "/getRawFIFOMP1",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(datax)
    })
        .then((result) => {
            let response = result.data[0]

            if (result.data.key) {
                soundWrong()
                errorText.innerHTML = response.error
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            } else {
                soundOk()

                if (result.data[1][0] === undefined) {
                    currentCount = 0
                } else {
                    currentCount = result.data[1][0].count
                }

                tabla_consulta.innerHTML = ""
                dates = {}
                array_fifo = response
                cScan.innerHTML = `${currentCount}/${contenedores}`
                let date_
                array_fifo.forEach(function (element) {
                    if (!(element.LGPLA).toUpperCase().includes("CICLI")) {
                        let key = JSON.stringify(moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY"))
                        dates[key] = (dates[key] || 0) + 1
                    }
                })

                const arregloFinalSortDate = array_fifo.sort((d1, d2) => new Date(moment(d1.WDATU == "00000000" ? date_ = "20110101" : date_ = d1.WDATU, "YYYYMMDD").format('MM/DD/YYYY')) - new Date(moment(d2.WDATU == "00000000" ? date_ = "20110101" : date_ = d2.WDATU, "YYYYMMDD").format('MM/DD/YYYY')))
                arregloFinalSortDate.forEach(element => {

                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    newRow.setAttribute("id", `${(element.LENUM).replace(/^0+/gm, "")}`)

                    if ((element.LGPLA).toUpperCase().includes("CICLI")) {
                        newRow.setAttribute("class", "bg-secondary text-white")
                        row = `
                        <tr>
                            <td>${element.LGPLA}</td>
                            <td>${(element.LENUM).replace(/^0+/gm, "")}</td>
                            <td>${moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY")}</td>
                            <td><button type="button" class="cycleButton btn btn-sm btn-secondary fas fa-recycle " disabled></button></td>
                        </tr>
                        `
                    } else {
                        row = `
                        <tr>
                            <td>${element.LGPLA}</td>
                            <td>${(element.LENUM).replace(/^0+/gm, "")}</td>
                            <td>${moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY")}</td>
                            <td><button type="button" class="cycleButton btn btn-sm btn-warning fas fa-recycle"></button></td>
                        </tr>
                        `
                    }



                    return newRow.innerHTML = row;
                });

                cPartNum.innerHTML = material
                cDescription.innerHTML = descripcion


                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                    $('#myModal').modal({ backdrop: 'static', keyboard: false })
                }, 500);

                setTimeout(() => { inp_verifyFIFO.focus() }, 500);


            }

        })
        .catch((err) => { console.error(err) })
        .finally(() => {
            setTimeout(() => {
                cycleButtons = document.getElementsByClassName("cycleButton")
                for (let i = 0; i < cycleButtons.length; i++) {
                    cycleButtons[i].addEventListener("click", (e) => { cycleAdd(e) })

                }
            }, 500);

        })

}

function cycleAdd(e) {
    e.preventDefault()
    e.target.parentElement.parentElement.classList.add("bg-warning")
    e.target.classList.add("text-white")
    e.target.disabled = true
    let serial_obsoleto = e.target.parentElement.parentElement.id
    serials_obsoletos.push(serial_obsoleto)

    Object.entries(dates).forEach(entry => {
        const [key, value] = entry;
        if (moment(key, 'MM/DD/YYYY') <= moment(lower_date, 'MM/DD/YYYY') && value > 0) {
            lower_date = key
        }
    });

    dates[`${lower_date}`] = dates[`${lower_date}`] - 1;
    lower_date = "12/12/9999"
}

submitSerials.addEventListener("submit", function (e) {

    e.preventDefault()
    check_qualifier()
    let serial = (inp_verifyFIFO.value).substring(1);
    currentSU = document.getElementById(`${serial}`)

    Object.entries(dates).forEach(entry => {
        const [key, value] = entry;
        if (moment(key, 'MM/DD/YYYY') <= moment(lower_date, 'MM/DD/YYYY') && value > 0) {
            lower_date = key
        }
    });



    if (currentSU === null) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } if ((currentSU.cells[0].innerHTML).toUpperCase().includes("CICLI")) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else if (moment(`"${currentSU.cells[2].innerHTML}"`, 'MM/DD/YYYY').format('MM/DD/YYYY') != moment(lower_date, 'MM/DD/YYYY').format('MM/DD/YYYY')) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else if (parseInt(cScan.innerHTML) >= contenedores && procesoActual != "extraMaterial") {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else if (serials_obsoletos.includes(serial)) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else {

        if (!selected_serials.includes(serial)) {
            soundOk()
            currentCount = currentCount + 1
            cScan.innerHTML = `${currentCount}/${contenedores}`
            dates[`${lower_date}`] = dates[`${lower_date}`] - 1;
            inp_verifyFIFO.value = ""
            currentSU.classList.add("bg-success", "text-white")

            // Deshabilitando el boton para enviar a ciclicos
            currentSU.childNodes[7].children[0].classList.remove("btn-warning")
            currentSU.childNodes[7].children[0].classList.add("btn-success")
            currentSU.childNodes[7].children[0].disabled = true

            btnTransferir.disabled = false
            selected_serials.push(serial)
            lower_date = "12/12/9999"
        } else {
            inp_verifyFIFO.value = ""
            soundWrong()
        }
    }
})

function transferSU() {
    btnTransferir.disabled = true
    let clear = null
    if (parseInt(currentCount) == parseInt(contenedores)) clear = "ok"

    $('#myModal').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    let data = { "proceso": "raw_mp_confirmed_v", "user_id": user_id.innerHTML, "serial": `${selected_serials}`, "storage_type": `${storage_type.innerHTML}`, "raw_id": `${id}`, "shift": `${turno}`, "clear": `${clear}`, "serials_obsoletos": `${serials_obsoletos}`, "destino": `${destino}` };
    axios({
        method: 'post',
        url: "/postSerialesMP1_RAW",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            console.log(result);
            let response = result.data
            let errors = 0
            soundOk()
            errorText.hidden = true
            tabla_consulta_container.hidden = false

            tabla_consulta2.innerHTML = ""
            response.forEach(element => {
                let newRow = tabla_consulta2.insertRow(tabla_consulta2.rows.length);
                if (element.key) {
                    console.log(element);
                    let row = `
                            <tr class="bg-danger">
                                <td>${element.abapMsgV1}</td>
                                <td>${element.key ? element.key : element.abapMsgV1}</td>
                            </tr>
                            `
                    newRow.classList.add("bg-danger", "text-white")
                    errors++
                    return newRow.innerHTML = row;
                } else {
                    let row = `
                            <tr >
                                <td>${(element.I_LENUM).replace(/^0+/gm, "")}</td>
                                <td>${element.E_TANUM}</td>
                            </tr>
                            `

                    return newRow.innerHTML = row;
                }


            })
            cantidadErrores.innerHTML = errors

            setTimeout(function () {
                $('#modalSpinner').modal('hide')
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            }, 500);

        })
        .catch(err => {

            setTimeout(function () {
                cantidadErrores.innerHTML = err
                $('#modalSpinner').modal('hide')
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            }, 500);
        })


}

function extraMaterial() {

    axios({
        method: 'get',
        url: "/getRawListadoProcesado",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((result) => {
            let response = result.data
            if ((response).includes("<!DOCTYPE html>")) {
                setTimeout(() => {
                    location.href = "/login"
                }, 1000);
                soundWrong()
            }
            $('#modalExtraMaterial').modal({ backdrop: 'static', keyboard: false })
            response.forEach(element => {
                tableExtraMaterial.row.add([
                    `<button id="${element.id}" onClick="submitMaterial(this, 'extraMaterial')" class="btn btn-outline-dark btn-sm ">${element.numero_sap}-${element.turno}</button>`,
                    element.contenedores,
                    element.descripcion_sap,
                    moment(element.fecha).format('MM/DD/YYYY')
                ]).draw(false);
            });
        })
        .catch((err) => { console.error(err) })

}

function cleanInput() {
    location.reload()
}
function check_qualifier() {

    serial = inp_verifyFIFO.value;
    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s") {
        // soundWrong()
        alerta_prefijo2.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo2.classList.add("animate__flipInX", "animate__animated")
        inp_verifyFIFO.value = ""

    } else {
        value = true
        // soundOk()
        alerta_prefijo2.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo2.classList.add("animate__flipOutX", "animate__animated")

    }
}