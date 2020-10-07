// $(document).ready(function () {

//   titulo = $('.csvTitulo').text()
//   $('#myTable').dataTable({
//     "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
//     dom: 'Blfrtip',
//     buttons: [
//       {
//         extend: 'copyHtml5',
//         title: titulo
//       },
//       {
//         extend: 'csvHtml5',
//         title: titulo
//       },
//       {
//         extend: 'excelHtml5',
//         title: null,
//         filename: titulo
//       },
//       // {
//       //   text: 'My button',
//       //   action: function ( e, dt, node, config ) {
//       //       alert( 'Button activated' );
//       //   }
//       // }
//     ]
//   });
// });


$("#menu-toggle").click(function (e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
  $("#menu-toggle").toggleClass("fa-angle-double-left fa-angle-double-right");
});


$(document).ready(function(){
  $('.hide_show').hide();  
  $('.hide_show2').hide(); 
})

$('#click_hide_show').click(function(){
  $('.hide_show').toggle(500);
})

$('#click_hide_show2').click(function(){
  $('.hide_show2').toggle(500);
})

bottomWrapper = document.getElementById("back-to-top-wrapper");

var myScrollFunc = function () {
    var y = window.scrollY;
    if (y >= 800) {
        bottomWrapper.className = "bottomMenu wrapper-show"
    } else {
        bottomWrapper.className = "bottomMenu wrapper-hide"
    }
};

window.addEventListener("scroll", myScrollFunc);