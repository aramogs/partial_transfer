let value = false
let storage_bin = document.getElementById("storage_bin")
let sbin = document.getElementById("sbin")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo2 = document.getElementById("alerta_prefijo2")
let submitBin = document.getElementById("submitBin")

let submitCantidad = document.getElementById("submitCantidad")
let cantidadSubmit = document.getElementById("cantidadSubmit")
let alerta_cantidad = document.getElementById("alerta_cantidad")
let Bserial = document.getElementById("Bserial")
let Bmaterial = document.getElementById("Bmaterial")
let Bstock = document.getElementById("Bstock")
let Bdescription = document.getElementById("Bdescription")
let Bweigth = document.getElementById("Bweigth")


let errorText = document.getElementById("errorText")
let errorText2 = document.getElementById("errorText2")
let btnCerrar = document.querySelectorAll(".btnCerrar")

let successText = document.getElementById("successText")
let btnTransferir = document.getElementById("btnTransferir")
let user_id = document.getElementById("user_id")
let storage_type = document.getElementById("storage_type")
let storage_units_count = document.getElementById("storage_units_count")
let current_storage_units = document.getElementById("current_storage_units")
let btn_verifyCount = document.getElementById("btn_verifyCount")
let inp_verifyCount = document.getElementById("inp_verifyCount")
let submitSU = document.getElementById("submitSU")
let storage_units = []
let listed_storage_units = []
let unlisted_storage_units = []
let not_found_storage_units = []
let nav3014 = document.getElementById("nav3014")
let nav3015 = document.getElementById("nav3015")
storage_bin.focus()

if (storage_type.innerHTML === "EXT") {
    nav3014.style.display = "none"
}else{
    nav3015.style.display = "none"
}


btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});



function cleanInput() {
    storage_bin.disabled = false
    storage_bin.value = ""
    current_storage_units.innerHTML = ""
    storage_units = []
    listed_storage_units = []
    unlisted_storage_units = []
    not_found_storage_units = []
    btn_verifyCount.classList.remove("bg-success")
    btn_verifyCount.classList.add("bg-secondary")
    btn_verifyCount.classList.remove("animate__animated", "animate__tada")
    // btn_verifyCount.disabled = true
    storage_bin.focus()
}


submitBin.addEventListener("submit", function (e) {
    e.preventDefault()


    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    storage_bin.disabled = true


    let data = { "proceso": "cycle_count_status", "storage_type": `${storage_type.innerHTML}`, "storage_bin": `${storage_bin.value.toUpperCase()}`, "user_id": user_id.innerHTML };
    axios({
        method: 'post',
        url: "/getBinStatusReport",
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
            let response = JSON.parse(result.data)

            if (response.error !== "N/A") {
                soundWrong()
                errorText2.innerHTML = response.error
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError2').modal({ backdrop: 'static', keyboard: false })
            } else {

                soundOk()
                let result = response.storage_units

                for (let i = 0; i < result.length; i++) {
                    if (storage_units.indexOf(result[i].storage_unit) === -1) {
                        storage_units.push(parseInt(result[i].storage_unit))
                    }
                }
                storage_units_count.innerHTML = result.length
                sbin.innerHTML = storage_bin.value.toUpperCase()
                storage_units.forEach(element => {

                    if (isNaN(element)) {
                        badge = `<span class="badge badge-warning  m-1 serialBadge">EMPTY</span>`
                        current_storage_units.innerHTML = current_storage_units.innerHTML + badge
                        btn_verifyCount.disabled = true
                    } else {
                        badge = `<span class="badge badge-secondary  m-1 serialBadge">${parseInt(element)}</span>`
                        current_storage_units.innerHTML = current_storage_units.innerHTML + badge
                    }
                });

                $('#modalSpinner').modal('hide')
                $('#myModal').modal({ backdrop: 'static', keyboard: false })
                setTimeout(() => { inp_verifyCount.focus() }, 500);

            }

        })
        .catch((err) => { console.error(err) })

})




submitSU.addEventListener("submit", function (e) {
    e.preventDefault()
    let serialBadge = document.querySelectorAll(".serialBadge")
    let currentSerial = parseInt(inp_verifyCount.value.substring(1))
    let serial = inp_verifyCount.value;

    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s") {
        soundWrong()
        alerta_prefijo2.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo2.classList.add("animate__flipInX", "animate__animated")
        inp_verifyCount.value = ""

    } else {

        if (storage_units.includes(currentSerial) && !listed_storage_units.includes(currentSerial) && !unlisted_storage_units.includes(currentSerial)) {
            listed_storage_units.push(currentSerial)
            soundOk()
            alerta_prefijo2.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo2.classList.add("animate__flipOutX", "animate__animated")

            serialBadge.forEach(sbadge => {
                if (parseInt(sbadge.innerHTML) === currentSerial) {
                    sbadge.classList.remove("badge-secodnary")
                    sbadge.classList.add("badge-success")
                }
            })
            btn_verifyCount.disabled = false
            btn_verifyCount.classList.remove("bg-secondary")
            btn_verifyCount.classList.add("bg-success")
            btn_verifyCount.classList.add("animate__animated", "animate__tada")
            inp_verifyCount.value = ""
        } else {
            if (!listed_storage_units.includes(currentSerial) && !unlisted_storage_units.includes(currentSerial)) {
                soundOk()
                setTimeout(() => { soundOk() }, 200)
                setTimeout(() => { soundOk() }, 400)
                badge = `<span class="badge badge-warning m-1">${currentSerial}</span>`
                current_storage_units.innerHTML = current_storage_units.innerHTML + badge
                unlisted_storage_units.push(currentSerial)
                btn_verifyCount.disabled = false
                btn_verifyCount.classList.remove("bg-secondary")
                btn_verifyCount.classList.add("bg-success")
                btn_verifyCount.classList.add("animate__animated", "animate__tada")
                inp_verifyCount.value = ""
            } else {
                soundWrong()
                alerta_prefijo2.classList.remove("animate__flipOutX", "animate__animated")
                alerta_prefijo2.classList.add("animate__flipInX", "animate__animated")
                inp_verifyCount.value = ""
            }

        }
    }

})

btn_verifyCount.addEventListener("click", () => {
    $('#myModal').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    storage_units.forEach(storageU => {
        if (!listed_storage_units.includes(parseInt(storageU)) && !unlisted_storage_units.includes(parseInt(storageU))) {
            not_found_storage_units.push(parseInt(storageU))
        }
    })


    let data = {
        "proceso": "cycle_count_transfer",
        "storage_type": `${storage_type.innerHTML}`,
        "storage_bin": `${storage_bin.value.toUpperCase()}`,
        "user_id": user_id.innerHTML,
        "listed_storage_units": listed_storage_units,
        "unlisted_storage_units": unlisted_storage_units,
        "not_found_storage_units": not_found_storage_units
    }
    axios({
        method: 'post',
        url: "/postCycleSU",
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
                btn_transferFG.disabled = true

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
                    setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                    setTimeout(() => { $('#modalSuccess').modal({ backdrop: 'static', keyboard: false }) }, 800);


                }
            }
        })
        .catch((err) => {
            console.error(err);
        })
})
