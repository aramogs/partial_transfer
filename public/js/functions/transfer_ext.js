let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let submitSerial = document.getElementById("submitSerial")
let currentST = document.getElementById("currentST")
let submitArray = document.getElementById("submitArray")
let btn_transferEXT = document.getElementById("btn_transferEXT")
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
let modalStorage = document.getElementById("modalStorage")
let verifySBin = document.getElementById("verifySBin")
let btnCerrar_Bin = document.getElementById("btnCerrar_Bin")
let submitArray_Bin = document.getElementById("submitArray_Bin")
let spanBin = document.getElementById("spanBin")


serial_num.focus()
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

submitSerial.addEventListener("submit", listAdd)

btn_transferEXT.addEventListener("click", () => { $('#myModal').modal({ backdrop: 'static', keyboard: false }) })

submitArray_form.addEventListener("submit", verifyBinModal)

submitArray_Bin.addEventListener("submit", verifyBin)

btnCerrar_Success.addEventListener("click", () => { location.href = "/consultaEXT" })

btnCerrar_Error.addEventListener("click", cleanInput())

btn_verificar_cantidad.addEventListener("click", verifyQuantity)

btnCerrar_Bin.addEventListener("click", () => {
    submitArray.value = "",
        verifySBin.value = "",
        $('#myModal').modal('show'),
        $('#modalStorage').modal('hide')
})

function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    submitArray.value = ""
    verifySBin.value = ""
    currentST.innerHTML = ""
    serialsArray = []
    contadorSeriales.value = 0
    div_storage_bin.classList.remove("animate__flipInX", "animate__animated")
    div_storage_bin.classList.add("animate__flipOutX", "animate__animated")
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


    } else if (serialsArray.indexOf((serial_num.value).substring(1)) === -1 && serialsArray.indexOf(`0${(serial_num.value).substring(1)}`) ===-1) {
        soundOk()
        if ((serial_num.value).substring(1).length < 10) {
            serialsArray.push(`0${(serial_num.value).substring(1)}`)
        } else {
            serialsArray.push((serial_num.value).substring(1))
        }

        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")

        let serial = `<small style="display:inline; "><span class="badge badge-light text-dark"> ${(serial_num.value).substring(1)} </span></small> `
        let append = document.createElement("span")
        append.innerHTML = serial
        currentST.appendChild(append)
        serial_num.value = ""

        btn_transferEXT.disabled = false
        btn_transferEXT.classList.remove("btn-secondary")
        btn_transferEXT.classList.add("btn-warning")


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

function verifyBinModal(e) {
    e.preventDefault()
    $('#myModal').modal('hide')
    $('#modalStorage').modal('show')
    spanBin.innerHTML = submitArray.value
    setTimeout(() => {
        verifySBin.focus()
    }, 500);
    soundOk()


}
function verifyBin(e) {
    e.preventDefault()

    if (submitArray.value == verifySBin.value) {
        transferEXT()
    } else {
        setTimeout(() => {
            verifySBin.value = ""
        }, 100);
        soundWrong()
    }
}

function transferEXT(e) {
    // e.preventDefault()
    $('#modalStorage').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()
    let storage_bin = submitArray.value
    $('#myModal').modal('hide')
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    let data = { "proceso": "transfer_EXT_confirmed", "user_id": user_id.innerHTML, "serial": `${serialsArray}`, "storage_bin": `${storage_bin}` };
    axios({
        method: 'post',
        url: "/postSeriales",
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
                serialsArray = []
                currentST.innerHTML = ""
                btn_transferEXT.disabled = true

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
                    tabla_consulta.innerHTML = ""
                    objectStringArray.forEach(element => {
                        let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
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

