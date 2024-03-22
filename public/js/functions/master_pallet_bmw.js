let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let submitSerial = document.getElementById("submitSerial")
let currentST = document.getElementById("currentST")
let submitArray = document.getElementById("submitArray")
let btn_t = document.getElementById("btn_t")
let contadorSeriales = document.getElementById("contadorSeriales")
let contadorWarning = document.getElementById("contadorWarning")
let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let tabla_consultaFIFO = document.getElementById('tabla_consultaFIFO').getElementsByTagName('tbody')[0];
let btnCerrar_Success = document.getElementById("btnCerrar_Success")
let btnCerrar_Error = document.getElementById("btnCerrar_Error")
let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
let errorText2 = document.getElementById("errorText2")
let errorTextField = document.getElementById("errorTextField")
let tabla_consulta_container = document.getElementById("tabla_consulta_container")
let btn_verificar_cantidad = document.getElementById("btn_verificar_cantidad")
let div_storage_bin = document.getElementById("div_storage_bin")
let submitArray_form = document.getElementById("submitArray_form")
let serialsArray = []
let modalMaster = document.getElementById("modalMaster")
let modalSuccess = document.getElementById("modalSuccess")
let serialMaster = document.getElementById("serialMaster")
// let verifySBin = document.getElementById("verifySBin")
let btnCerrar_Master = document.getElementById("btnCerrar_Master")
let submitArray_Master = document.getElementById("submitArray_Master")
let submit_PackingInstruction = document.getElementById("submit_PackingInstruction")
let ejs_selected_packing = document.getElementById("ejs_selected_packing")
let ejs_packing_quantity = document.getElementById("ejs_packing_quantity")
let inp_verifyFIFO = document.getElementById("inp_verifyFIFO")
let submitSerials = document.getElementById("submitSerials")
let cScan = document.getElementById("cScan")
let cPartNum = document.getElementById("cPartNum")
let cDescription = document.getElementById("cDescription")
let btnMaster = document.getElementById("btnMaster")

// let lower_gr_date = ""
let packing_instruction = ""
let packing_id = ""
let result_packing_materials_formatted
let result_packingr_formatted
let pallet_packing_material
let hu_packing_instruction

///////////////////////////////////////
let contenedores = 0
let id = ""
let serials = []
let seriales_obsoletos = []
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
// let destino = document.getElementById("destino").innerText
///////////////////////////////////////

// let spanBin = document.getElementById("spanBin")

btnMaster.addEventListener("click", palletCreate)

serial_num.focus()
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

submitSerial.addEventListener("submit", listAdd)

// btn_t.addEventListener("click", () => { $('#myModal').modal({ backdrop: 'static', keyboard: false }) })

// submitArray_form.addEventListener("submit", verifyHandlingUnits)

// submitArray_Master.addEventListener("submit", createMaster)

btnCerrar_Success.addEventListener("click", () => { cleanInput() })

btnCerrar_Error.addEventListener("click", cleanInput())

btn_verificar_cantidad.addEventListener("click", verifyQuantity)

btnCerrar_Master.addEventListener("click", () => { cleanInput() })

function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    submitArray.value = ""
    // verifySBin.value = ""
    // currentST.innerHTML = ""
    serialsArray = []
    contadorSeriales.value = 0
    div_storage_bin.classList.remove("animate__flipInX", "animate__animated")
    div_storage_bin.classList.add("animate__flipOutX", "animate__animated")

    lower_gr_date = ""
    packing_instruction = ""
    packing_id = ""
    result_packing_materials_formatted = ""
    result_packingr_formatted = ""
    pallet_packing_material = ""
    ejs_selected_packing.innerText = ""
    ejs_packing_quantity.innerText = ""
    submit_PackingInstruction.innerHTML = ""
    cantidadErrores.innerHTML = ""
    currentCount = 0
}


function listAdd(e) {
    e.preventDefault()

    serial = serial_num.value;

    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s") {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

        setTimeout(() => {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
    } else {
        soundOk()


        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        let serial_number = serial_num.value.substring(1)
        // let serial = `<small style="display:inline; "><span class="badge badge-light text-dark"> ${(serial_num.value).substring(1)} </span></small> `
        // let append = document.createElement("span")
        // append.innerHTML = serial
        // currentST.appendChild(append)
        serial_num.value = ""

        // btn_t.disabled = false
        // btn_t.classList.remove("btn-secondary")
        // btn_t.classList.add("btn-warning")
        $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

        let data = { "serial": `${serial_number}` };
        axios({
            method: 'post',
            url: "/get_packing_instructionBMW",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        })
            .then((result) => {
                // console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀\n", result);
                response = result.data
                if (response.error || response.message) {
                    tabla_consulta.innerHTML = ""
                    tabla_consulta_container.hidden = false
                    errorTextField.innerHTML = ""
                    errorText.hidden = true


                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                    let row = `<tr class="bg-danger">
                                   <td>${serialsArray[0]}</td>
                                   <td>${response.error ? response.error : response.message}</td>
                               </tr>`
                    newRow.classList.add("bg-danger", "text-white")

                    cantidadErrores.innerHTML = ""
                    cantidadErrores.innerHTML = "1"

                    setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })

                    return newRow.innerHTML = row;
                } else {
                    setTimeout(() => { soundOk(), $('#modalSpinner').modal('hide') }, 500);
                    $('#modalSelectPacking').modal({ backdrop: 'static', keyboard: false })

                    response.forEach(element => {

                        let newButton = document.createElement("button");
                        newButton.setAttribute("type", "submit");
                        newButton.setAttribute("class", "btn btn-primary m-1 selected_packing");
                        newButton.textContent = element.POBJID;
                        newButton.setAttribute("data-PACKNR", element.PACKNR);
                        hu_packing_instruction = element.hu_packing_instruction

                        // Append the new button to the existing element
                        submit_PackingInstruction.appendChild(newButton);
                    })
                    let selected_packing = document.querySelectorAll(".selected_packing")
                    selected_packing.forEach(element => {
                        element.addEventListener("click", selectPacking)
                    });
                }
            })
    }
}

function selectPacking(e) {
    e.preventDefault()
    setTimeout(() => { $('#modalSelectPacking').modal('hide') }, 500);
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    packing_instruction = e.target.innerText
    packing_id = e.target.getAttribute("data-PACKNR")

    let data = { "POBJID": `${packing_instruction}`, "PACKNR": `${packing_id}`, "hu_packing_instruction": `${hu_packing_instruction}` };
    axios({
        method: 'post',
        url: "/get_packing_matreialsBMW",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {

            result_packing_materials_formatted = result.data.result_packing_materials_formatted
            result_packingr_formatted = result.data.result_packingr_formatted
            // console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐\n", result_packing_materials_formatted);
            // console.log("👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾\n", result_packingr_formatted);

            let subpacknrquantity = result_packing_materials_formatted
                .filter(item => item.PAITEMTYPE === 'I')
                .map(item => item.TRGQTY);
            contenedores = parseFloat(subpacknrquantity)
            cScan.innerHTML = `${currentCount}/${contenedores}`
            // ejs_selected_packing.innerHTML = packing_instruction

            const filteredItems = result_packing_materials_formatted.filter(item => item.PAITEMTYPE === "I" && item.SUBPACKNR !== hu_packing_instruction);

            if (filteredItems.length > 0) {
                tabla_consulta.innerHTML = ""
                tabla_consulta_container.hidden = false
                errorTextField.innerHTML = ""
                errorText.hidden = true


                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                let row = `
                                <tr class="bg-danger">
                                    <td>${serialsArray[0]}</td>
                                    <td>Check Packing Instruction</td>
                                </tr>
                                `
                newRow.classList.add("bg-danger", "text-white")


                cantidadErrores.innerHTML = ""
                cantidadErrores.innerHTML = "1"

                setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
                return newRow.innerHTML = row;
            }


            pallet_packing_material = result_packing_materials_formatted
                .filter(item => item.PACKITEMID === result_packingr_formatted[0].MAPACO_ITEM)
                .map(item => item.MATNR);

            // setTimeout(() => { soundOk(), $('#modalSpinner').modal('hide') }, 500);
            consultaSerial()
        })

}

function consultaSerial() {


    selected_serials = []
    // btnTransferir.disabled = true
    lower_date = "12/12/9999"
    dates = {}
    // part_num.disabled = true
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })


    let data = { "proceso": "raw_fifo_verify", "serial": `${(serial).substring(1)}`, "user_id": user_id.innerHTML, "storage_type": `FG`, "hu_packing_instruction": hu_packing_instruction };
    axios({
        method: 'post',
        url: "/getRawFIFOSerialBMW",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            console.log(result);
            let response = result.data
            let partNum = ""
            let description = ""

            if (result.data.key) {
                soundWrong()
                errorText2.innerHTML = result.data.key ? result.data.key : result.data.message
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError2').modal({ backdrop: 'static', keyboard: false })
            } else {
                soundOk()


                tabla_consultaFIFO.innerHTML = ""
                dates = {}
                array_fifo = response

                array_fifo.forEach(function (element) {
                    if (!(element.LGPLA).toUpperCase().includes("CICLI")) {
                        let key = JSON.stringify(moment(element.WDATU == "00000000" ? date_ = "20110101" : date_ = element.WDATU, "YYYYMMDD").format("MM/DD/YYYY"))
                        dates[key] = (dates[key] || 0) + 1
                    }
                })

                const arregloFinalSortDate = array_fifo.sort((d1, d2) => new Date(moment(d1.WDATU == "00000000" ? date_ = "20110101" : date_ = d1.WDATU, "YYYYMMDD").format('MM/DD/YYYY')) - new Date(moment(d2.WDATU == "00000000" ? date_ = "20110101" : date_ = d2.WDATU, "YYYYMMDD").format('MM/DD/YYYY')))
                arregloFinalSortDate.forEach(element => {
                    partNum = element.MATNR
                    description = element.LGPLA
                    let newRow = tabla_consultaFIFO.insertRow(tabla_consultaFIFO.rows.length);
                    newRow.setAttribute("id", `${(element.LENUM).replace(/^0+/gm, "")}`)
                    newRow.setAttribute("hu_quantity", `${(parseInt(parseFloat(element.VERME)))}`)
                    newRow.setAttribute("part_number", `${(element.MATNR).trim()}`)

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

                cPartNum.innerHTML = partNum
                cDescription.innerHTML = description

                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                    $('#myModalFIFO').modal({ backdrop: 'static', keyboard: false })
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


submitSerials.addEventListener("submit", function (e) {

    e.preventDefault()
    check_qualifierSerials()
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
        return
    } else {

        if ((currentSU.cells[0].innerHTML).toUpperCase().includes("CICLI")) {
            soundWrong()
            inp_verifyFIFO.value = ""
            lower_date = "12/12/9999"
        } else if (moment(`"${currentSU.cells[2].innerHTML}"`, 'MM/DD/YYYY').format('MM/DD/YYYY') != moment(lower_date, 'MM/DD/YYYY').format('MM/DD/YYYY')) {
            soundWrong()
            inp_verifyFIFO.value = ""
            lower_date = "12/12/9999"
        } else if (seriales_obsoletos.includes(serial)) {
            soundWrong()
            inp_verifyFIFO.value = ""
            lower_date = "12/12/9999"
        } else if (currentCount >= contenedores) {
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

                btnMaster.disabled = false
                selected_serials.push(serial)
                lower_date = "12/12/9999"
            } else {
                inp_verifyFIFO.value = ""
                soundWrong()
            }
        }
    }
})

function cycleAdd(e) {
    e.preventDefault()
    e.target.parentElement.parentElement.classList.add("bg-warning")
    e.target.classList.add("text-white")
    e.target.disabled = true
    let serial_obsoleto = e.target.parentElement.parentElement.id
    seriales_obsoletos.push(serial_obsoleto)

    Object.entries(dates).forEach(entry => {
        const [key, value] = entry;
        if (moment(key, 'MM/DD/YYYY') <= moment(lower_date, 'MM/DD/YYYY') && value > 0) {
            lower_date = key
        }
    });

    dates[`${lower_date}`] = dates[`${lower_date}`] - 1;
    lower_date = "12/12/9999"
}

function check_qualifierSerials() {

    if (inp_verifyFIFO.value.charAt(0) === "S" || inp_verifyFIFO.value.charAt(0) === "s") {
        if ((inp_verifyFIFO.value.substring(1)).length > 9) {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
            value = true
            soundOk()
        }
    } else {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        inp_verifyFIFO.value = ""

    }
}


function verifyQuantity() {
    if (contadorSeriales.value != serialsArray.length) {
        soundWrong()
        setTimeout(() => {
            contadorWarning.classList.remove("animate__flipInX", "animate__animated")
            contadorWarning.classList.add("animate__flipOutX", "animate__animated")

        }, 1000);

        div_storage_bin.classList.remove("animate__flipInX", "animate__animated")
        div_storage_bin.classList.add("animate__flipOutX", "animate__animated")
        contadorWarning.classList.remove("animate__flipOutX", "animate__animated")
        contadorWarning.classList.add("animate__flipInX", "animate__animated")
    } else {
        soundOk()
        submitArray.focus()
        div_storage_bin.classList.remove("animate__flipOutX", "animate__animated")
        div_storage_bin.classList.add("animate__flipInX", "animate__animated")
    }
}

// function verifyBin(e) {
//     e.preventDefault()

//     if (submitArray.value == verifySBin.value) {
//         transferFG()
//     } else {
//         setTimeout(() => {
//             verifySBin.value = ""
//         }, 100);
//         soundWrong()
//     }
// }


function palletCreate(e) {
    e.preventDefault()
    $('#myModalFIFO').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    let data = { "serial": `${selected_serials}`, result_packing_materials_formatted, result_packingr_formatted, pallet_packing_material, packing_instruction, packing_id, "seriales_obsoletos": seriales_obsoletos };
    axios({
        method: 'post',
        url: "/pallet_request_createBMW",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            let response = result.data
            //console.log("✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊✊", response);
            if (response.error) {
                tabla_consulta.innerHTML = ""
                tabla_consulta_container.hidden = false
                errorTextField.innerHTML = ""
                errorText.hidden = true
                response.error.forEach(element => {

                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    if (element.error != "N/A") {
                        let row = `
                                <tr class="bg-danger">
                                    <td>${parseFloat(element.HU_EXID)}</td>
                                    <td>Check HU</td>
                                </tr>
                                `
                        newRow.classList.add("bg-danger", "text-white")
                        return newRow.innerHTML = row;
                    }
                })
                cantidadErrores.innerHTML = ""
                cantidadErrores.innerHTML = response.error.length

                setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            } else if (response.key) {
                tabla_consulta.innerHTML = ""
                tabla_consulta_container.hidden = false
                errorTextField.innerHTML = ""
                errorText.hidden = true
                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                let row = `
                        <tr class="bg-danger">
                            <td>${response.key}</td>
                            <td>Check HU</td>
                        </tr>
                        `
                newRow.classList.add("bg-danger", "text-white")
                setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
                return newRow.innerHTML = row;
            } else {
                soundOk()
                tabla_consulta.innerHTML = ""
                tabla_consulta_container.hidden = false
                errorTextField.innerHTML = ""
                errorText.hidden = true

                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                let row = `
                            <tr>
                                <td>${parseFloat(response.HUKEY)}</td>
                                <td>${response.HUHEADER.PACK_MAT_NAME ? response.HUHEADER.PACK_MAT_NAME : "Pallet Created"}</td>
                            </tr>
                            `
                setTimeout(() => { soundOk(), $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
                return newRow.innerHTML = row;

            }
        })
        .catch((err) => {
            console.error(err);
        })
}



function increaseValue() {
    let value = parseInt(contadorSeriales.value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    contadorSeriales.value = value;
}

function decreaseValue() {
    let value = parseInt(contadorSeriales.value, 10);
    value = isNaN(value) ? 0 : value;
    value < 1 ? value = 1 : '';
    value--;
    contadorSeriales.value = value;
}