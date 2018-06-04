
function show_change(scode){
    console.log('in show_change: '+scode)
    table_div = document.getElementById('sub_table')
    var args = {}
    args.scode = scode
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/submissions/get_table', true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            console.log('Were Back')
            table_div.innerHTML = JSON.parse(xmlhttp.response)
        }
    };
    xmlhttp.send(JSON.stringify(args));

}
