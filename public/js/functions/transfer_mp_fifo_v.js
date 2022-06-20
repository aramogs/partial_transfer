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
let regexBefore = /\-(.*)/
let regexAfter = /^(.*?)\-/
let currentCount = 0
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
                table.row.add([
                    `<button id="${element.id}" onClick="submitMaterial(this)" class="btn btn-outline-dark btn-sm ">${element.numero_sap}-${element.turno}</button>`,
                    element.contenedores,
                    element.descripcion_sap,
                    moment(element.fecha).format('MM/DD/YYYY')
                ]).draw(false);
            });
        })
        .catch((err) => { console.error(err) })

})

btnTransferir.addEventListener("click", transferSU)

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
})

function submitMaterial(e) {

    let material = e.innerHTML.replace(regexBefore, "")
    turno = e.innerHTML.replace(regexAfter, "")
    contenedores = e.parentElement.nextElementSibling.innerHTML
    descripcion = e.parentElement.nextElementSibling.nextElementSibling.innerHTML
    id = e.id
    serials = []

    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })


    let datax = { "proceso": "raw_fifo_verify", "material": `${material}`, "user_id": user_id.innerHTML, "storage_type": `${storage_type.innerHTML}`, "raw_id": `${id}` };
    axios({
        method: 'post',
        url: "/getRawFIFO",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(datax)
    })
        .then((result) => {

            let response = JSON.parse(result.data[0])
            console.log(response);
            if ((result.data).includes("<!DOCTYPE html>")) {

                setTimeout(() => {
                    location.href = "/login"
                }, 1000);
                soundWrong()
            }

            if (response.error !== "N/A") {
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
                array_fifo = response.result
                cScan.innerHTML = `${currentCount}/${contenedores}`

                array_fifo.forEach(function (obj) {
                    if (!(obj.storage_bin).toUpperCase().includes("CICLI")) {
                        let key = JSON.stringify(obj.gr_date)
                        dates[key] = (dates[key] || 0) + 1
                    }
                })

                array_fifo.forEach(element => {

                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    newRow.setAttribute("id", `${element.storage_unit}`)
                   
                    if ((element.storage_bin).toUpperCase().includes("CICLI")) {
                        newRow.setAttribute("class", "bg-secondary text-white")
                        row = `
                        <tr id="${element.storage_unit}">
                            <td>${element.storage_bin}</td>
                            <td>${element.storage_unit}</td>
                            <td>${element.gr_date}</td>
                            <td><button type="button" class="cycleButton btn btn-sm btn-secondary fas fa-recycle " disabled></button></td>
                        </tr>
                        `
                    }else{
                        row = `
                        <tr id="${element.storage_unit}">
                            <td>${element.storage_bin}</td>
                            <td>${element.storage_unit}</td>
                            <td>${element.gr_date}</td>
                            <td><button type="button" class="cycleButton btn btn-sm btn-warning fas fa-recycle"></button></td>
                        </tr>
                        `
                    }
                   

                    
                    return newRow.innerHTML = row;
                });

                cPartNum.innerHTML = material
                cDescription.innerHTML = descripcion
                $('#modalSpinner').modal('hide')
                $('#myModal').modal({ backdrop: 'static', keyboard: false })

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
    } else if (parseInt(cScan.innerHTML) >= contenedores) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else if (serials_obsoletos.includes(serial)) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else {
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
    }
})

function transferSU() {

    let clear = null
    if (parseInt(currentCount) == parseInt(contenedores)) clear = "ok"

    $('#myModal').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    let data = { "proceso": "raw_mp_confirmed_v", "user_id": user_id.innerHTML, "serial": `${selected_serials}`, "storage_type": `${storage_type.innerHTML}`, "raw_id": `${id}`, "shift": `${turno}`, "clear": `${clear}`, "serials_obsoletos": `${serials_obsoletos}` };
    axios({
        method: 'post',
        url: "/postSerialesMP_RAW",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {

            if ((result.data).includes("<!DOCTYPE html>")) {

                setTimeout(() => {
                    location.href = "/login"
                }, 1000);
                soundWrong()
            }

            response = JSON.parse(result.data)

            if (response.error !== "N/A") {

                errorTextField.innerHTML = response.error
                errorText.hidden = false
                tabla_consulta_container.hidden = true
                selected_serials = []
                currentST.innerHTML = ""

                setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })

            } else {
                soundOk()
                errorText.hidden = true
                tabla_consulta_container.hidden = false
                let result = response.result
                let result_mod = ""


                result_mod = result.replace("[", "").replace("]", "").replace(/'/g, '"')
                let objectStringArray = (new Function("return [" + result_mod + "];")());
                let errors = 0

                objectStringArray.forEach(element => {
                    if (typeof (element.result) != "number") {
                        errors++
                    }
                });

                if (errors != 0) {
                    tabla_consulta2.innerHTML = ""
                    objectStringArray.forEach(element => {
                        let newRow = tabla_consulta2.insertRow(tabla_consulta2.rows.length);
                        if (typeof (element.result) != "number") {
                            let row = `
                                <tr class="bg-danger">
                                    <td>${element.serial_num}</td>
                                    <td>${element.result}</td>
                                </tr>
                                `
                            newRow.classList.add("bg-danger", "text-white")
                            return newRow.innerHTML = row;
                        }


                    })
                    cantidadErrores.innerHTML = errors
                    $('#modalSpinner').modal('hide')
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                } else {
                    $('#modalSpinner').modal('hide')
                    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
                }
            }
        })
        .catch((err) => {
            console.error(err);
        })

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