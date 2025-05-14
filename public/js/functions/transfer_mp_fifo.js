let value = false
let part_num = document.getElementById("part_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo2 = document.getElementById("alerta_prefijo2")
let submitSerial = document.getElementById("submitSerial")
let inp_verifyFIFO = document.getElementById("inp_verifyFIFO")
let submitMaterial = document.getElementById("submitMaterial")
let tableReprint = document.getElementById("tableReprint").getElementsByTagName('tbody')[0];
let errorTextField = document.getElementById("errorTextField")

// let currentST = document.getElementById("currentST")

let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
let errorText2 = document.getElementById("errorText2")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let btnReprint = document.getElementById("btnReprint")

let successText = document.getElementById("successText")
let btnTransferir = document.getElementById("btnTransferir")
let user_id = document.getElementById("user_id")
let storage_type = document.getElementById("storage_type")

let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let tabla_consulta2 = document.getElementById('tabla_consulta2').getElementsByTagName('tbody')[0];
let cPartNum = document.getElementById("cPartNum")

let tabla_consulta_container = document.getElementById("tabla_consulta_container")
let serials_obsoletos = []
let array_fifo = []
let selected_serials = []
let dates = {}
let currentSU = ""
let lower_date = "12/12/9999"
let objectStringArray = {}
let printer = ""
part_num.focus()


btnTransferir.addEventListener("click", transferSU)

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

part_num.addEventListener("keyup", check_qualifier)

function cleanInput() {
    part_num.disabled = false
    part_num.value = ""
    value = false
    selected_serials = []
    serials_obsoletos = []
}

function check_qualifier() {

    if (part_num.value.charAt(0) === "P" || part_num.value.charAt(0) === "p") {
        if ((part_num.value.substring(1)).length > 11) {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
            soundOk()
            consultarMaterial()
        }
    } else if (part_num.value.charAt(0) === "S" || part_num.value.charAt(0) === "s") {
        if ((part_num.value.substring(1)).length > 9) {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
            value = true
            soundOk()
            consultaSerial()
        }
    } else {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        part_num.value = ""

    }
}

function check_qualifierSerials() {
    if (inp_verifyFIFO.value.charAt(0) !== "S" && inp_verifyFIFO.value.charAt(0) !== "s") {
        inp_verifyFIFO.value = ""
    }
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

function transferSU() {


    $('#myModal').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    let data = { "proceso": "raw_mp_confirmed", "user_id": user_id.innerHTML, "serial": `${selected_serials}`, "storage_type": `${storage_type.innerHTML}`, "raw_id": 0, "serials_obsoletos": `${serials_obsoletos}` };
    axios({
        method: 'post',
        url: "/postSerialesMP_RAW",
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
    // .then((result) => {

    //     if ((result.data).includes("<!DOCTYPE html>")) {

    //         setTimeout(() => {
    //             location.href = "/login"
    //         }, 1000);
    //         soundWrong()
    //     }

    //     response = JSON.parse(result.data)

    //     if (response.error !== "N/A") {

    //         errorTextField.innerHTML = response.error
    //         errorText.hidden = false
    //         tabla_consulta_container.hidden = true
    //         selected_serials = []
    //         currentST.innerHTML = ""

    //         setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
    //         $('#modalError').modal({ backdrop: 'static', keyboard: false })

    //     } else {
    //         soundOk()
    //         printer = response.printer
    //         errorText.hidden = true
    //         tabla_consulta_container.hidden = false
    //         let result = response.result
    //         let result_mod = ""

    //         result_mod = result.replace("[", "").replace("]", "").replace(/'/g, '"')
    //         objectStringArray = (new Function("return [" + result_mod + "];")());
    //         let errors = 0

    //         if (errors != 0) {

    //             objectStringArray.forEach(element => {

    //                 let newRow = tabla_consulta2.insertRow(tabla_consulta2.rows.length);
    //                 if (typeof (element.result) != "number") {
    //                     let row = `
    //                             <tr class="bg-danger">
    //                                 <td>${element.serial_num}</td>
    //                                 <td>${element.result}</td>
    //                             </tr>
    //                             `
    //                     newRow.classList.add("bg-danger", "text-white")
    //                     return newRow.innerHTML = row;
    //                 }

    //                 if (typeof (element.result) != "number") {
    //                     errors++
    //                 }
    //             });

    //             cantidadErrores.innerHTML = errors
    //             $('#modalSpinner').modal('hide')
    //             $('#modalError').modal({ backdrop: 'static', keyboard: false })
    //         } else {
    //             $('#modalSpinner').modal('hide')

    //             tableReprint.innerHTML = ""
    //             objectStringArray.forEach(element => {
    //                 let newRow = tableReprint.insertRow(tableReprint.rows.length);

    //                 let row = `
    //                         <tr>
    //                             <td style="width:60% !important">${element.serial_num}</td>
    //                             <td "class="text-center"><input  type="number" class="form-control input-sm"  id="reprint_${element.serial_num}"></td>
    //                         </tr>
    //                         `
    //                 newRow.classList.add("text-center")
    //                 return newRow.innerHTML = row;
    //             })

    //             $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
    //         }
    //     }
    // })
    // .catch((err) => {
    //     console.error(err);
    // })

}

function consultarMaterial() {


    selected_serials = []
    btnTransferir.disabled = true
    lower_date = "12/12/9999"
    dates = {}
    part_num.disabled = true
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })


    let data = { "proceso": "raw_fifo_verify", "material": `${(part_num.value).substring(1)}`, "user_id": user_id.innerHTML, "storage_type": `${storage_type.innerHTML}` };
    axios({
        method: 'post',
        url: "/getRawFIFO",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            console.log(result);
            let response = result.data

            if (result.data.key) {
                soundWrong()
                errorText.innerHTML = result.data.key ? result.data.key : result.data.message
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            } else {
                soundOk()

                // if (result.data[1][0] === undefined) {
                //     currentCount = 0
                // } else {
                //     currentCount = result.data[1][0].count
                // }

                tabla_consulta.innerHTML = ""
                dates = {}
                array_fifo = response
                // cScan.innerHTML = `${currentCount}/${contenedores}`
                let date_
                array_fifo.forEach(function (element) {
                    if (!(element.LGPLA.toUpperCase().includes("CICLI") || element.LGPLA.toUpperCase().includes("JRPLANTA") || element.LGPLA.toUpperCase().includes("JRVINEDOS"))) {
                        let key = JSON.stringify(moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY"))
                        dates[key] = (dates[key] || 0) + 1
                    }
                })

                const arregloFinalSortDate = array_fifo.sort((d1, d2) => new Date(moment(d1.WDATU == "00000000" ? date_ = "20110101" : date_ = d1.WDATU, "YYYYMMDD").format('MM/DD/YYYY')) - new Date(moment(d2.WDATU == "00000000" ? date_ = "20110101" : date_ = d2.WDATU, "YYYYMMDD").format('MM/DD/YYYY')))
                arregloFinalSortDate.forEach(element => {

                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    newRow.setAttribute("id", `${(element.LENUM).replace(/^0+/gm, "")}`)
                    newRow.setAttribute("hu_quantity", `${(parseInt(parseFloat(element.VERME)))}`)
                    newRow.setAttribute("part_number", `${(element.MATNR).trim()}`)

                    if ((element.LGPLA).toUpperCase().includes("CICLI") || (element.LGPLA).toUpperCase().includes("JRPLANTA") || (element.LGPLA).toUpperCase().includes("JRVINEDOS")) {
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

                cPartNum.innerHTML = (part_num.value).substring(1)
                // cDescription.innerHTML = "descripcion"


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

function consultaSerial() {


    selected_serials = []
    btnTransferir.disabled = true
    lower_date = "12/12/9999"
    dates = {}
    part_num.disabled = true
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })


    let data = { "proceso": "raw_fifo_verify", "serial": `${(part_num.value).substring(1)}`, "user_id": user_id.innerHTML, "storage_type": `${storage_type.innerHTML}` };
    axios({
        method: 'post',
        url: "/getRawFIFOSerial",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            console.log(result);
            let response = result.data
            let partNum = ""

            if (result.data.key) {
                soundWrong()
                errorText2.innerHTML = result.data.key ? result.data.key : result.data.message
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError2').modal({ backdrop: 'static', keyboard: false })
            } else {
                soundOk()


                tabla_consulta.innerHTML = ""
                dates = {}
                array_fifo = response

                array_fifo.forEach(function (element) {
                    if (!(element.LGPLA).toUpperCase().includes("CICLI") && !(element.LGPLA).toUpperCase().includes("JRPLANTA") && !(element.LGPLA).toUpperCase().includes("JRVINEDOS")) {
                        let key = JSON.stringify(moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY"))
                        dates[key] = (dates[key] || 0) + 1
                    }
                })

                const arregloFinalSortDate = array_fifo.sort((d1, d2) => new Date(moment(d1.WDATU == "00000000" ? date_ = "20110101" : date_ = d1.WDATU, "YYYYMMDD").format('MM/DD/YYYY')) - new Date(moment(d2.WDATU == "00000000" ? date_ = "20110101" : date_ = d2.WDATU, "YYYYMMDD").format('MM/DD/YYYY')))
                arregloFinalSortDate.forEach(element => {
                    partNum = element.MATNR
                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    newRow.setAttribute("id", `${(element.LENUM).replace(/^0+/gm, "")}`)
                    newRow.setAttribute("hu_quantity", `${(parseInt(parseFloat(element.VERME)))}`)
                    newRow.setAttribute("part_number", `${(element.MATNR).trim()}`)

                    if ((element.LGPLA).toUpperCase().includes("CICLI") || (element.LGPLA).toUpperCase().includes("JRPLANTA") || (element.LGPLA).toUpperCase().includes("JRVINEDOS")) {
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

                cPartNum.innerHTML = partNum

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

submitMaterial.addEventListener("submit", function (e) {

    e.preventDefault()
    check_qualifierSerials()
    let serial = (inp_verifyFIFO.value).substring(1)
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
        } if ((currentSU.cells[0].innerHTML).toUpperCase().includes("CICLI") || (currentSU.cells[0].innerHTML).toUpperCase().includes("JRPLANTA") || (currentSU.cells[0].innerHTML).toUpperCase().includes("JRVINEDOS")) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else if (moment(`"${currentSU.cells[2].innerHTML}"`, 'MM/DD/YYYY').format('MM/DD/YYYY') != moment(lower_date, 'MM/DD/YYYY').format('MM/DD/YYYY')) {
        soundWrong()
        inp_verifyFIFO.value = ""
    } else if (serials_obsoletos.includes(serial)) {
        soundWrong()
        inp_verifyFIFO.value = ""
        lower_date = "12/12/9999"
    } else {
        let current_hu_quantity = currentSU.getAttribute("hu_quantity")
        let current_part_number = currentSU.getAttribute("part_number")
        dates[`${lower_date}`] = dates[`${lower_date}`] - 1;
        soundOk()
        inp_verifyFIFO.value = ""
        currentSU.classList.add("bg-success", "text-white")

        // Deshabilitando el boton para enviar a ciclicos
        currentSU.childNodes[7].children[0].classList.remove("btn-warning")
        currentSU.childNodes[7].children[0].classList.add("btn-success")
        currentSU.childNodes[7].children[0].disabled = true

        btnTransferir.disabled = false
        selected_serials.push(JSON.stringify({"serial": serial, "hu_quantity": current_hu_quantity, "part_number": current_part_number}))
        lower_date = "12/12/9999"
    }
})

btnReprint.addEventListener("click", function (e) {
    e.preventDefault()

    objectStringArray.forEach(element => {

        let labels = document.getElementById(`reprint_${element.serial_num}`).value

        let data = { "labels": `${labels}`, "printer": `${printer}`, "quantity": `${element.quantity}`, "material_description": `${element.material_description}`, "certificate_number": `${element.certificate_number}`, "material": `${element.material}`, serial_num: `${element.serial_num}` };

        axios({
            method: 'POST',
            url: "/reprintLabel",
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data)
        })
        cleanInput()



    });


})