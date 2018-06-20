function show_change(scode) {
  console.log('in show_change: ' + scode);
  table_div  = document.getElementById('sub_table');
  var args   = {};
  args.scode = scode;

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", '/submissions/get_table', true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4) {
      console.log('Were Back');
      table_div.innerHTML = JSON.parse(xmlhttp.response);
    }
  };
  xmlhttp.send(JSON.stringify(args));

}

$("button[name='Download as Spreadsheet']").on('click',
  function (event) {
    alert('TTT1');

  });
//					$.ajax({
// 						type: 'POST',
// 						data: JSON.stringify(data),
// 				        contentType: 'application/json',
//                         url: 'http://localhost:3000/endpoint',
//                         success: function(data) {
//                             console.log('success');
//                             console.log(JSON.stringify(data));
//                         }
//                     });