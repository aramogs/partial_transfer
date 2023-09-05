$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})

let excelFile = document.getElementById("excelFile")
let btnBorrarContinuar = document.getElementById("btnBorrarContinuar")
let btnCancelar = document.querySelectorAll(".btnCancelar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let btn_excel = document.getElementById("btn_excel")
let formData = new FormData()
let selectedTurno = document.getElementById("selectedTurno")
let cardExcel = document.getElementById("cardExcel")
let selectedFecha = document.getElementById("selectedFecha")
let myDateString
let turno
let turnos_programados = []
let modal_errorText = document.getElementById("modal_errorText")
let modal_btnCerrar_Error = document.getElementById("modal_btnCerrar_Error")
let destino = document.getElementById("destino")

btnCancelar.forEach(element => {
    element.addEventListener('click', clearAll)
});



excelFile.addEventListener("change", () => {
    if (document.getElementById("excelFile").files.length == 0) {
        btn_excel.disabled = true;
        btn_excel.classList.remove("animate__flipInX")
        btn_excel.classList.add("animate__flipOutX")
    } else {
        btn_excel.disabled = false;
        btn_excel.classList.remove("animate__flipOutX")
        btn_excel.classList.add("animate__flipInX")
    }
});

selectedTurno.addEventListener("change", () => {
    cardExcel.hidden = false
    cardExcel.classList.add("animate__animated", "animate__backInUp")
    turno = (selectedTurno.options[selectedTurno.selectedIndex].value).substring(0, 2);

    turnos_programados.forEach(element => {
        if (turno === element.turno) {
            $('#modalError').modal({ backdrop: 'static', keyboard: false })
            modal_errorText.innerHTML = " Solicitud previamente realizada para este turno"
        }
    });
})

modal_btnCerrar_Error.addEventListener("click", () => { clearAll() })



const picker = datepicker('#selectedFecha', {
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: true,
    minDate: new Date(2021, 0, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        if (mm <= 9) mm = '0' + mm;
        if (dd <= 9) dd = '0' + dd;
        myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString
        enableTurno()
    }
})

function enableTurno() {
    getProgramacion()
    selectedTurno.disabled = false
    axios({
        method: 'get',
        url: `/getTurnos`,
        data: "",
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
        turnos = response.data
        selectedTurno.innerHTML = ""
        option = document.createElement('option')
        option.text = "Seleccionar"
        selectedTurno.add(option)
        turnos.forEach(element => {
            turno = element.turno_descripcion
            option = document.createElement('option')
            option.text = turno
            selectedTurno.add(option)
        });
    })
}

function getProgramacion() {
    let data = { "fecha": `${myDateString}` }
    axios({
        method: 'post',
        url: `/getListado`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((response) => {

        let result = response.data
        result.forEach(tur => {
            turnos_programados.push(tur)
        });



    })
}

function sendData() {


    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    formData.delete('excelFile')
    formData.append('excelFile', excelFile.files[0])
    formData.append("data", JSON.stringify({ "fecha": myDateString, "turno": turno }));
    axios({
        method: 'post',
        url: `/verificarSAP/${destino.innerHTML}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((response) => {
            if (!response.data.message) {
                setTimeout(function () { $('#modalSpinner').modal('hide') }, 1000);

                window.location = `/editarListado/?fecha=${myDateString}`
            } else {
                setTimeout(function () { $('#modalSpinner').modal('hide') }, 500);
                $('#modalError').modal({ backdrop: 'static', keyboard: false })
                modal_errorText.innerHTML = response.data.message
            }

        })
        .catch((err) => {
            setTimeout(function () { $('#modalSpinner').modal('hide') }, 500);
            $('#modalError').modal({ backdrop: 'static', keyboard: false })
            modal_errorText.innerHTML = err.data.message
        })
}



function clearAll() {
    turnos_programados = []
    selectedFecha.value = ""
    selectedTurno.value = "Seleccionar"
    selectedTurno.disabled = true
    cardExcel.hidden = true
    formData = new FormData()
    modal_errorText.innerHTML = ""


}