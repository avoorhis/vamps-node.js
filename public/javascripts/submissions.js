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



// $("button[name='Add datasets']").on('click',
//   function (event) {
//     event.preventDefault();
//     event.stopPropagation();
//     var form = $(this).parents('form:first');
//     var formData = $(form).serialize();
//     alert(formData);
//     console.log("formData", formData);
//
//     var d_region = $('input:checked[name=d_region]').val().split("#");
//     $.ajax({
//       type: "POST",
//       url: "/submissions/submission_request",
//       dataType: "html",
//       //   $.post("/",$(this).serialize(), function( data ) {
//       //   console.log(data);
//       // });
//       //   var formData = {
//       //     'name'              : $('input[name=name]').val(),
//       //     'email'             : $('input[name=email]').val(),
//       //     'superheroAlias'    : $('input[name=superheroAlias]').val()
//       //   };
//       data: {
//         button_name: "Weird name",
//         // $('input:checked[name=d_region]').val()
//         // "Bacterial#v4#Bv4"
//         d_region: d_region,
//         // domain_regions: req.session.domain_regions,
//         funding_code: $('input:checked[name=funding_code]').val(),
//         // hostname: req.CONFIG.hostname,
//         // pi_list: req.session.pi_list,
//         //$('select[name=pi_id] option:selected').val()
//         // "425"
//         pi_id: $('select[name=pi_id] option:selected').val(),
//         // pi_name: req.form.pi_name,
//         // // previous_submission
//         project_description: $('input[name=project_description]').val(),
//
//         project_name1: $('input[name=project_name1]').val(),
//         project_name2: $('input[name=project_name2]').val(),
//         project_name3: d_region,
//         project_title: $('input[name=project_title]').val(),
//         submit_code: $('input[name=submit_code]').val(),
//         samples_number: $('input[name=samples_number]').val(),
//         title: 'VAMPS: Submission Request',
//         // user: req.user,
//         // user_submits: req.session.user_submits
//       }
//     })
//       .done(function (result) {
//         alert("UUU");
//         $("button#submissions_edit_form_btn").attr('name', 'New name');
//         changeCategories(result);
//       })
//       .fail(function (fail) {
//         console.log(fail);
//       });
//   });
//
// var changeCategories = function (rr) {
//   alert("RRR");
//   alert(rr);
// };

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
