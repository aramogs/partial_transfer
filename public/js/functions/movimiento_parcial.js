let value = false
let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let submitSerial = document.getElementById("submitSerial")


let submitCantidad = document.getElementById("submitCantidad")
let cantidadSubmit = document.getElementById("cantidadSubmit")
let alerta_cantidad = document.getElementById("alerta_cantidad")
let Bserial = document.getElementById("Bserial")
let Bmaterial = document.getElementById("Bmaterial")
let Bstock = document.getElementById("Bstock")
let Bdescription = document.getElementById("Bdescription")
let Bweigth = document.getElementById("Bweigth")


let errorText = document.getElementById("errorText")
let btnCerrar = document.querySelectorAll(".btnCerrar")

let successText = document.getElementById("successText")
let btnTransferir = document.getElementById("btnTransferir")
let user_id = document.getElementById("user_id")

serial_num.focus()

serial_num.addEventListener("keyup", check_qualifier)
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

function check_qualifier() {
     serial = serial_num.value;
    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s" ) {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

    } else {
        value = true
        soundOk()
        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")

    }
}

function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
}


cantidadSubmit.addEventListener("keyup", function (e) {
    if (this.value !== "") {
        if (this.value > parseInt(Bstock.innerText) || this.value <= 0) {
            soundWrong()
            alerta_cantidad.classList.remove("animate__flipOutX", "animate__animated")
            alerta_cantidad.classList.add("animate__flipInX", "animate__animated")
            this.value = ""
            setTimeout(() => {
                alerta_cantidad.classList.remove("animate__flipInX", "animate__animated")
                alerta_cantidad.classList.add("animate__flipOutX", "animate__animated")
            }, 2000);
        }
    }
})

submitSerial.addEventListener("submit", function (e) {
    e.preventDefault()
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    if (value == true) {
        serial_num.disabled = true
        let data = { "proceso": "partial_transfer", "serial": `${serial.substring(1)}`,"user_id": user_id.innerHTML };
        axios({
            method: 'post',
            url: "/getInfo",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        })
            .then((result) => {
                response = JSON.parse(result.data)
                // console.log(response);

                if (response.error !== "N/A") {
                    soundWrong()
                    errorText.innerHTML = response.error
                    $('#modalSpinner').modal('hide')
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                } else {
                    soundOk()
                    Bserial.innerHTML = response.serial
                    Bmaterial.innerHTML = response.material
                    Bstock.innerHTML = response.cantidad
                    Bdescription.innerHTML = response.material_description
                    Bweigth.innerHTML = response.material_w
                    $('#modalSpinner').modal('hide')
                    $('#myModal').modal({ backdrop: 'static', keyboard: false })
                    
                }

            })
            .catch((err) => { console.error(err) })
    }
})



submitCantidad.addEventListener("submit", function (e) {
    e.preventDefault()
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    $('#myModal').modal('hide')
    btnTransferir.disabled = true

    let data = { "proceso": "partial_transfer_confirmed", "serial": `${Bserial.innerText}`, "material": `${Bmaterial.innerText}`, "material_description": `${Bdescription.innerText}` , "cantidad": `${cantidadSubmit.value}`, "cantidad_restante": `${(parseInt(Bstock.innerText) - cantidadSubmit.value )}`, "user_id": user_id.innerHTML };
    axios({
        method: 'post',
        url: "/transferenciaMaterial",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {
            cantidadSubmit.value = ""

            response = JSON.parse(result.data)
            // console.log(response);

            if (response.error !== "N/A") {
                soundWrong()
                btnTransferir.disabled = false
                errorText.innerHTML = response.error
                $('#modalSpinner').modal('hide')
                // $('#myModal').modal('hide')
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            } else {
                soundOk()
                btnTransferir.disabled = false
                successText.innerHTML = response.result
                $('#modalSpinner').modal('hide')
                // $('#myModal').modal('hide')
                $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
                // printLabel(response.material, Bdescription.innerText, response.serial, (parseInt(Bstock.innerText) - response.cantidad))
            }


        })
        .catch((err) => { console.error(err) })
})

