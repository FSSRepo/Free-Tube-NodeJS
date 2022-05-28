let videoplayer = document.getElementById("videoplayer");
let videos = [];

function updateVideoList(res) {
    videos = res.videos;
    $("#list-videos").empty();
    for(i=0;i<videos.length;i++){
        $("#list-videos").append(`<a href="#!" name="${videos[i].id}" class="collection-item video-item">${videos[i].name}</a>`);
   }
   $(".video-item").on("click", function () {
     let id = this.name;
     videoplayer.src = "/video/" + id;
     videoplayer.play();
     $("#video-title").text(this.innerText);
   });
}

$(() => {
    
const socket = io();

socket.on("update-videolist", (msg) => {
    M.toast({html:'Nuevo video'});
  get(
    "video-list",
    "",
    (res) => {
      updateVideoList(res);
    },
    () => {}
  );
});

    let file_choose = document.createElement("input");
    file_choose.type = "file";
    file_choose.accept = "video/mp4";
    $("#choose").click(() => {
        file_choose.click();
    });
    file_choose.addEventListener("change",(e) => {
        $("#nv").css({visibility:"visible"});
        $("#upload").css({display:"inline-block"});
        let name = e.target.files[0].name;
        $("#name").val(name.substring(0,name.indexOf(".mp4")));
        M.updateTextFields();
        
    });
    get("video-list","",(res) => {
        updateVideoList(res);
    },()=>{});
    $("#upload").click(() => {
        if(file_choose.files.length == 0) {
            return;
        }
        $("#uploading-modal").modal("open");
        uploadFile("upload",file_choose.files[0],(event) => {
            let porcent = (event.loaded / event.total) * 100.0;
            $("#prog-bar").css({width:porcent + "%"});
            $("#prog-text").text(porcent.toFixed(2)+"%");
        },(res) => {
            
            post("process-upload",{id:res.id,name:$("#name").val()},(_res) => {
                get("video-list","",(res) => {
                    updateVideoList(res);
                    $("#uploading-modal").modal("close");
                    $("#nv").css({visibility:"hidden"});
                    $("#upload").css({display:"none"});
                },() => {});
                socket.emit('req-update-videolist');
            },()=>{});
        });
    });
    $("#upload-modal").modal(
        {
            dismissible:false
    }
    );
    $("#uploading-modal").modal({
        dismissible:false
    });
    $("#upload-btn").click(() => {
        $("#upload-modal").modal("open");
    });
});