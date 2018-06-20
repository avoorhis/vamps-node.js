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
    event.preventDefault();
    event.stopPropagation();
    $.ajax({
      type: "POST",
      url: "submissions/submission_request",
      dataType: "html",
      data: {
        button_name: "Weird name",
        // d_region: d_region, // d_region =  [ 'Fungal', 'ITS1', 'ITS1' ]
        // domain_regions: CONSTS.DOMAIN_REGIONS,
        // funding_code: req.form.funding_code,
        // hostname: req.CONFIG.hostname,
        // pi_list: pi_list,
        // pi_id: req.form.pi_id,
        // pi_name: req.form.pi_name,
        // // previous_submission
        // project_description: req.form.project_description,
        // project_name1: req.form.project_name1,
        // project_name2: req.form.project_name2,
        // project_name3: req.body.d_region,
        // project_title: req.form.project_title,
        // submit_code: req.form.submit_code,
        // samples_number: "5",
        // title: 'VAMPS: Submission Request',
        // user: req.user,
        // user_submits: user_submits
      }
    })
      .done(function (result) {
        alert("UUU");
        changeCategories(result);
      })
      .fail(function (fail) {
        console.log(fail);
      });
  });

var changeCategories = function (rr) {
  alert("RRR");
  alert(rr);
};

//     success: function (result) {
//       alert("UUU");
//       alert(req.form);
//       alert(result);
//       console.log(req.form);
//
//       // jQuery("#proofread_bot-submit").after(proofread_result);
//       // jQuery("#proofread_bot_throbber").remove();
//     }
//   ,
//     error: function (result) {
//       console.log("result ERR", result);
//     }
//   });
// })


//     success: function (result) {
//         console.log(result);
//         if(result.status == 200){
//             self.isEditMode(!self.isEditMode());
//         }
//     },
//     error: function(result){
//         console.log(result);
//     }
// });

// jQuery("#proofread_bot-submit").click(function(event){
//   event.preventDefault();
//   jQuery("#proofread_bot-button-holder").append("<img id=\"proofread_bot_throbber\" src=\"sites/all/modules/proofread_bot/images/throbber.gif\" />");

// jQuery.ajax({
//   type: "POST",
//   url: "proofread_bot/check",
//   dataType: "html",
//   data: {"text": jQuery("#edit-' . variable_get('proofread_bot_field') . '").html()
//   },
//   success: function(proofread_result){
//     jQuery("#proofread_bot-submit").after(proofread_result);
//     jQuery("#proofread_bot_throbber").remove();
//   }
// });
// });
