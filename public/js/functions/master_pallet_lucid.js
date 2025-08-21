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
let btnCerrar_Success = document.getElementById("btnCerrar_Success")
let btnCerrar_Error = document.getElementById("btnCerrar_Error")
let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
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

let lower_gr_date = ""
let packing_instruction = ""
let packing_id = ""
let result_packing_materials_formatted
let result_packingr_formatted
let pallet_packing_material
let hu_packing_instruction

// let spanBin = document.getElementById("spanBin")


serial_num.focus()
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

submitSerial.addEventListener("submit", listAdd)

btn_t.addEventListener("click", () => { $('#myModal').modal({ backdrop: 'static', keyboard: false }) })

submitArray_form.addEventListener("submit", verifyHandlingUnits)

submitArray_Master.addEventListener("submit", createMaster)

btnCerrar_Success.addEventListener("click", () => { cleanInput() })

btnCerrar_Error.addEventListener("click", cleanInput())

btn_verificar_cantidad.addEventListener("click", verifyQuantity)

btnCerrar_Master.addEventListener("click", () => { cleanInput() })

function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    submitArray.value = ""
    // verifySBin.value = ""
    currentST.innerHTML = ""
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
}


function listAdd(e) {
    e.preventDefault()

    serial = serial_num.value;
    const regex = /.*[a-zA-Z].*/;
    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s" || (serial.substring(1)).length < 9 || regex.exec(serial.substring(1)) !== null) {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

        setTimeout(() => {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
    } else if (serialsArray.indexOf((serial_num.value).substring(1)) === -1 && serialsArray.indexOf(`0${(serial_num.value).substring(1)}`) === -1) {
        soundOk()
        if ((serial_num.value).substring(1).length < 10) {
            serialsArray.push(`0${(serial_num.value).substring(1)}`)
        } else {
            serialsArray.push((serial_num.value).substring(1))
        }

        if (serialsArray.length > 1 && serialsArray.length > parseInt(ejs_packing_quantity.innerText)) {
            soundWrong()
            serialsArray.pop()
            alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
            serial_num.value = ""
        } else {

            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")

            let serial = `<small style="display:inline; "><span class="badge badge-light text-dark"> ${(serial_num.value).substring(1)} </span></small> `
            let append = document.createElement("span")
            append.innerHTML = serial
            currentST.appendChild(append)
            serial_num.value = ""

            btn_t.disabled = false
            btn_t.classList.remove("btn-secondary")
            btn_t.classList.add("btn-warning")

            if (serialsArray.length === 1) {
                $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

                let data = { "serial": `${serialsArray}` };
                axios({
                    method: 'post',
                    url: "/get_packing_instructionLUCID",
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

                            let row = `
                                        <tr class="bg-danger">
                                               <td>${serialsArray[0]}</td>
                                               <td>${response.error ? response.error : response.message}</td>
                                           </tr>
                                           `
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

    } else {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

        setTimeout(() => {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
    }
}

function selectPacking(e) {
    e.preventDefault()
    setTimeout(() => { $('#modalSelectPacking').modal('hide') }, 500);
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    packing_instruction = e.target.innerText
    packing_id = e.target.getAttribute("data-PACKNR")
    ejs_selected_packing.innerHTML = packing_instruction
    let data = { "POBJID": `${packing_instruction}`, "PACKNR": `${packing_id}`, "hu_packing_instruction": `${hu_packing_instruction}` };
    axios({
        method: 'post',
        url: "/get_packing_matreialsLUCID",
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
            ejs_packing_quantity.innerHTML = parseFloat(subpacknrquantity)


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

            setTimeout(() => { soundOk(), $('#modalSpinner').modal('hide') }, 500);
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


function verifyHandlingUnits(e) {
    e.preventDefault()
    $('#myModal').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    let data = { "serial": `${serialsArray}`, result_packing_materials_formatted, result_packingr_formatted, pallet_packing_material, packing_instruction, packing_id };
    axios({
        method: 'post',
        url: "/pallet_request_createLUCID",
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


function createMaster(e) {
    e.preventDefault()
    $('#modalMaster').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })



    let data = { "proceso": "master_fg_lucid_create", "user_id": user_id.innerHTML, "serial": `${serialsArray}`, "lower_gr_date": `${lower_gr_date}` };
    axios({
        method: 'post',
        url: "/master_request_lucid_create",
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
                let error_json = ""

                try {
                    error_json = JSON.parse(response.error)
                } catch (error) {
                    error_json = ""
                }

                if (typeof (error_json) === "object") {
                    let error_array = JSON.parse(response.error)
                    let errors = 0
                    error_array.forEach(element => {
                        if (element.error != "N/A") {
                            errors++
                        }
                    })

                    if (errors != 0) {
                        tabla_consulta.innerHTML = ""
                        tabla_consulta_container.hidden = false
                        errorTextField.innerHTML = ""
                        errorText.hidden = true
                        error_array.forEach(element => {

                            let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                            if (element.error != "N/A") {
                                let row = `
                                <tr class="bg-danger">
                                    <td>${element.serial_num}</td>
                                    <td>${element.error}</td>
                                </tr>
                                `
                                newRow.classList.add("bg-danger", "text-white")
                                return newRow.innerHTML = row;
                            }


                        })
                        cantidadErrores.innerHTML = ""
                        cantidadErrores.innerHTML = errors

                        setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                        $('#modalError').modal({ backdrop: 'static', keyboard: false })
                    }
                } else {


                    errorTextField.innerHTML = response.error
                    errorText.hidden = false
                    tabla_consulta_container.hidden = true
                    serialsArray = []
                    currentST.innerHTML = ""
                    btn_t.disabled = true

                    setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                }
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
                    if (isNaN(element.result)) {
                        errors++
                    }
                });

                if (errors != 0) {
                    tabla_consulta.innerHTML = ""
                    objectStringArray.forEach(element => {
                        let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                        if (isNaN(element.result)) {
                            let row = `
                                <tr class="bg-danger">
                                    <td>${element.serial_num}</td>
                                    <td>${element.error}</td>
                                </tr>
                                `
                            newRow.classList.add("bg-danger", "text-white")
                            return newRow.innerHTML = row;
                        }


                    })
                    cantidadErrores.innerHTML = errors
                    setTimeout(() => { soundWrong(), $('#modalSpinner').modal('hide') }, 500);
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                } else {
                    serialMaster.innerHTML = ""
                    serialMaster.innerHTML = objectStringArray[0].serial_num
                    setTimeout(() => { soundOk(), $('#modalSpinner').modal('hide') }, 500);
                    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
                }
            }
        })
        .catch((err) => {
            console.error(err);
        })

}

