function uploadFile(route,file,progress,done) {
    let req = new XMLHttpRequest();
    let formData = new FormData();
    formData.append("video", file);
    req.upload.addEventListener("progress", function(event) {
        progress(event);
    }, false);
    req.open("POST", '/'+route);
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
        if (req.status == 200) {
          done(JSON.parse(req.response));
        }
      }
    };
    req.send(formData);
}

function post(route,body,callback,error_cb){
    $.ajax({
      url:'/'+route,
      type:'POST',
      contentType: 'application/json',
      data: JSON.stringify(body) ,
      dataType:'json',
      success: (res) => {
        callback(res);
      },
      error: (xhr,status) => {
        error_cb();
      },
      complete: (xhr,status) => {
        
      }
    });
  }

  function get(route,param='',callback,error_cb){
    $.ajax({
      url:'/' + route + param,
      type:'GET',
      contentType: 'application/json',
      data:'',
      dataType:'json',
      success: (res) => {
        callback(res);
      },
      error: (xhr,status) => {
        error_cb();
      },
      complete: (xhr,status) => {
        
      }
    });
  }