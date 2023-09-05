let btn_cl_1 = document.getElementById("btn_cl_1")
let btn_cl_2 = document.getElementById("btn_cl_2")
let btn_cl_3 = document.getElementById("btn_cl_3")

btn_cl_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transfer_MP_FIFO/MP")
})

btn_cl_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transfer_MP_FIFO/MP1/DEL")
})

btn_cl_3.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transfer_MP_FIFO/MP1/DELX")
})