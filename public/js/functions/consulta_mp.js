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
let material = ""
let serial = ""
let errorText = document.getElementById("errorText")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let storage_type =document.getElementById("storage_type").innerText
let successText = document.getElementById("successText")
let user_id = document.getElementById("user_id")

let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];

serial_num.focus()

serial_num.addEventListener("keyup", check_qualifier)

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

function check_qualifier() {

    serial = serial_num.value;
    material = serial_num.value;

    if (material.charAt(0) === "P" || material.charAt(0) === "p") {
        if ((material.substring(1)).length > 11) {
            soundOk()
            consultarMaterial();
        }
    } else if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s") {
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
    value = false
}

function consultarMaterial() {


    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    serial_num.disabled = true
    let material_ =  material.substring(1)

    let data = { "proceso": "location_mp_material", "material": `${material_}`, "user_id": user_id.innerHTML, "storage_type": `${storage_type}` };
    axios({
        method: 'post',
        url: "/getUbicaciones",
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
                errorText.innerHTML = response.error
                setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
            } else {

                let storage_bins = []
                let arregloFinal = []
                tabla_consulta.innerHTML = ""
                soundOk()
                let result = response.result

                for (let i = 0; i < result.length; i++) {
                    if (storage_bins.indexOf(result[i].storage_bin) === -1) {
                        storage_bins.push(`${result[i].storage_bin}`)
                    }
                }


                for (let i = 0; i < storage_bins.length; i++) {
                    let count = 0
                    let recentDate = ""
                    for (let y = 0; y < result.length; y++) {
                        if (storage_bins[i] == result[y].storage_bin) {
                            count++
                            if (recentDate < result[y].gr_date) {
                                recentDate = result[y].gr_date
                            }
                        }
                    }
                    let push = { "storage_bin": `${storage_bins[i]}`, "count": `${count}`, "recentDate": `${recentDate}` }
                    arregloFinal.push(push)

                }

                const arregloFinalSortDate = arregloFinal.sort((a, b) => b.recentDate - a.recentDate)
                arregloFinalSortDate.forEach(element => {
                    row = `
                        <tr>
                            <td>${element.storage_bin}</td>
                            <td>${element.count}</td>
                            <td>${element.recentDate}</td>
                        </tr>
                        `

                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    return newRow.innerHTML = row;
                });

                $('#modalSpinner').modal('hide')
                $('#myModal').modal({ backdrop: 'static', keyboard: false })

            }

        })
        .catch((err) => { console.error(err) })

}


submitSerial.addEventListener("submit", function (e) {
    e.preventDefault()

    if (value == true) {
        $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
        serial_num.disabled = true
        let serial_

        if (serial.substring(1).length < 10) {
            serial_ = `0${serial.substring(1)}`
        } else {
            serial_ = serial.substring(1)
        }

        let data = { "proceso": "location_mp_serial", "serial": `${serial_}`, "user_id": user_id.innerHTML ,"storage_type": `${storage_type}`};
        axios({
            method: 'post',
            url: "/getUbicaciones",
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
                    errorText.innerHTML = response.error
                    setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                } else {

                    let storage_bins = []
                    let arregloFinal = []
                    tabla_consulta.innerHTML = ""
                    soundOk()
                    let result = response.result

                    for (let i = 0; i < result.length; i++) {
                        if (storage_bins.indexOf(result[i].storage_bin) === -1) {
                            storage_bins.push(`${result[i].storage_bin}`)
                        }
                    }


                    for (let i = 0; i < storage_bins.length; i++) {
                        let count = 0
                        let recentDate = ""
                        for (let y = 0; y < result.length; y++) {
                            if (storage_bins[i] == result[y].storage_bin) {
                                count++
                                if (recentDate < result[y].gr_date) {
                                    recentDate = result[y].gr_date
                                }
                            }
                        }
                        let push = { "storage_bin": `${storage_bins[i]}`, "count": `${count}`, "recentDate": `${recentDate}` }
                        arregloFinal.push(push)

                    }

                    const arregloFinalSortDate = arregloFinal.sort((a, b) => b.recentDate - a.recentDate)
                    arregloFinalSortDate.forEach(element => {
                        row = `
                        <tr>
                            <td>${element.storage_bin}</td>
                            <td>${element.count}</td>
                            <td>${element.recentDate}</td>
                        </tr>
                        `

                        let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                        return newRow.innerHTML = row;
                    });

                    $('#modalSpinner').modal('hide')
                    $('#myModal').modal({ backdrop: 'static', keyboard: false })

                }

            })
            .catch((err) => { console.error(err) })
    }
})



