let btnCerrar = document.querySelectorAll(".btnCerrar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let cardExcel = document.getElementById("cardExcel")
let table = $('#myTable').DataTable({"order":[[1,"asc"]]})
let midplan = document.getElementById("midplan")
let formMotivo = document.getElementById("formMotivo")
let formEditar = document.getElementById("formEditar")
let formAgregar = document.getElementById("formAgregar")
let selectFecha= document.getElementById("selectFecha")
let myDateString
let motivo= document.getElementById("motivo")
let msap= document.getElementById("msap")
let mcantidad= document.getElementById("mcantidad")
let mfecha= document.getElementById("mfecha")
let midplane = document.getElementById("midplane")
let mesap= document.getElementById("mesap")
let mecantidad= document.getElementById("mecantidad")
let mefecha= document.getElementById("mefecha")
let edit_linea= document.getElementById("edit_linea")
let edit_cantidad= document.getElementById("edit_cantidad")
let add_sap= document.getElementById("add_sap")
let add_cantidad= document.getElementById("add_cantidad")
let add_linea= document.getElementById("add_linea")
let add_turno= document.getElementById("add_turno")
let btnAgregar= document.getElementById("btnAgregar")
let msg_add_sap= document.getElementById("msg_add_sap")
let btn_save_agregar= document.getElementById("btn_save_agregar")
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const fecha = urlParams.get('fecha')




btnCerrar.forEach(element => {
    element.addEventListener('click', clearAll)
});


if (fecha != "") {
  selectFecha.value = fecha
  myDateString = fecha
  fillTable()
}


const picker = datepicker('#selectFecha', {
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: true,
    minDate: new Date(2020, 0, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        if (mm <= 9) mm = '0' + mm;
        if (dd <= 9) dd = '0' + dd;
        myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString

        btnAgregar.disabled=false;
        table.clear().draw();
        fillTable();
    }
})



function fillTable() {
   
    let data = {"fecha":`${myDateString}`}
    axios({
        method: 'post',
        url: `/tablaProgramacion`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((result)=>{ 
            
           
                for (let y = 0; y < result.data.length; y++) {
                    let cancelar
                    if (result.data[y].status=="Pendiente") {

                        cancelar= `<input type="text" name="idPlan" id="idPlan${result.data[y].plan_id}" value=${result.data[y].plan_id} hidden><button type="submit" formaction="/cancelar"
                        class="btn btn-danger  rounded-pill" name="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="cancel(this.id)" ><span class="fas fa-times"></span>
                        <button type="submit" formaction="/actualizar" class="btn btn-info  rounded-pill"
                                        nname="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="edit(this.id)"><span class="fas fa-pencil-alt">` 

                    }else{
                      cancelar=
                      `
                        <button type="button" class="btn btn-secondary  rounded-pill btn-block" disabled><span class="fas fa-ban" ></span>
                      `
                    }
                   

                    table.row.add( [
                        cancelar,
                        result.data[y].plan_id,
                        result.data[y].numero_sap,
                        result.data[y].cantidad,
                        result.data[y].linea,
                        result.data[y].sup_name,
                        new Date(result.data[y].fecha).toLocaleDateString(),
                        result.data[y].turno,
                        result.data[y].status,
                        result.data[y].motivo_cancel,
                    ] ).draw( false );

            }
        })
        .catch((err) => { console.error(err) })
}


function cancel(clicked_id)
  {
    $('#modalMotivo').modal({ backdrop: 'static', keyboard: false })
    let id = clicked_id.split('-');
    let idp = id[id.length - 1];
    midplan.value=idp;

    infoId(idp, "cancel")
    
  }

  function edit(clicked_id)
  {
    $('#modalEditar').modal({ backdrop: 'static', keyboard: false })
    let id = clicked_id.split('-');
    let idp = id[id.length - 1];
    midplane.value=idp;

    infoId(idp, "edit")
    
  }

  formMotivo.addEventListener("submit", (e)=>{
      e.preventDefault();

      let data = {"id":`${midplan.value}`, "motivo":`${motivo.value}`}

      axios({
        method: 'post',
        url: `/cancelarIdPlan`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

      reload("cancel")
        
    })
    .catch((err) => { console.error(err) })

  })


  function reload(modal){
    if(modal=="cancel"){
      motivo.value="";
      $('#modalMotivo').modal('hide');
      table.clear().draw();
      fillTable();
    }else if(modal=="edit"){
      edit_cantidad.value="";
      edit_linea.value="";
      $('#modalEditar').modal('hide');
      table.clear().draw();
      fillTable();

    }else if(modal=="add"){
      $('#modalAgregar').modal('hide');
      add_sap.value=""
      add_cantidad.value=""
      add_linea.value=""
      add_turno.value=""
      msg_add_sap.innerHTML =""
      table.clear().draw();
      fillTable();
    }
    

  }


  function infoId(idp, modal){

    let data = {"id":`${idp}`}
    axios({
        method: 'post',
        url: `/idplanInfo`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

      if(modal=="cancel"){

        msap.innerHTML=result.data[0].numero_sap
        mcantidad.innerHTML=result.data[0].cantidad
        mfecha.innerHTML=result.data[0].fecha
      } else if(modal=="edit"){
        mesap.innerHTML=result.data[0].numero_sap
        mecantidad.innerHTML=result.data[0].cantidad
        mefecha.innerHTML=result.data[0].fecha
        edit_cantidad.value=result.data[0].cantidad
        edit_linea.value=result.data[0].linea

      }

        
        
    })
    .catch((err) => { console.error(err) })

  }


  formEditar.addEventListener("submit", (e)=>{
    e.preventDefault();

    let data = {"id":`${midplane.value}`, "cantidad":`${edit_cantidad.value}`, "linea":`${edit_linea.value}`}

    axios({
      method: 'post',
      url: `/editarIdPlan`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
  })
  .then((result) => {

    reload("edit")
      
  })
  .catch((err) => { console.error(err) })

})

function agregar()
  {
    $('#modalAgregar').modal({ backdrop: 'static', keyboard: false })
    enableTurno()
    
  }


  formAgregar.addEventListener("submit", (e)=>{
    e.preventDefault();

    if(add_turno.value !="Seleccionar"){

      let turno= add_turno.value.substring(0,2);
      let data = {"sap":`${add_sap.value}`, "cantidad":`${add_cantidad.value}`, "linea":`${add_linea.value}`, "fecha":`${selectFecha.value}`, "turno":`${turno}`}
  
      axios({
        method: 'post',
        url: `/agregarIdPlan`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {
  
      reload("add")
        
    })
    .catch((err) => { console.error(err) })
      
    }


})

function checkSap()
  {

    let data = {"sap":`${add_sap.value}`}

    axios({
      method: 'post',
      url: `/checkSap`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
  })
  .then((result) => {

    if(result.data.length==0){

      msg_add_sap.innerHTML = ' Incorrecto';
      msg_add_sap.classList.remove('text-success');
      msg_add_sap.classList.add('text-danger');
      btn_save_agregar.disabled=true;

    }else{
      msg_add_sap.innerHTML = ' Correcto';
      msg_add_sap.classList.remove('text-danger');
      msg_add_sap.classList.add('text-success');
      btn_save_agregar.disabled=false;

    }

      
  })
  .catch((err) => { console.error(err) })
    
  }


  function enableTurno(){
    add_turno.disabled = false
    axios({
        method: 'get',
        url: `/getTurnos`,
        data: "",
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
    }).then((response)=>{
        
        turnos = response.data
 
        option = document.createElement('option')
        option.text = "Seleccionar"
        add_turno.add(option)
        turnos.forEach(element => {
            turno = element.turno_descripcion
            option = document.createElement('option')
            option.text = turno
            add_turno.add(option)
        });
    })
}

function clearAll() {

  add_sap.value=""
  add_cantidad.value=""
  add_linea.value=""
  motivo.value=""
  edit_cantidad.value=""
  edit_linea.value=""
  msg_add_sap.innerHTML=""


  for (i = add_turno.options.length-1; i >= 0; i--) {
    add_turno.options[i] = null;
  }



    
}
