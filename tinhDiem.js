var toHop = "";
var toan, van, anh, th1, th2, th3, tongket, kkhich, uutien, diem, diemToHop;
var hsBaiThi = 0.5, hsTrongNam = 0.5;
var d = new Date;
var year = d.getFullYear();
$(window).on("load", function(){
    $(".container-fluid").addClass("w3-animate-top");
    $(".container-fluid").attr("style", "display:block;");
    if (year >= 2020){
        $("#alert2021").modal("show");
        $("#btn2021").click(function(){
            $("#settingsModal").modal("show");
            settingsModalIint();
        });
    }
});

$("#btnKHTN").click(function(){
    // Đổi placeholder
    $("#th1").attr("placeholder", "Lý").val("");
    $("#th2").attr("placeholder", "Hoá").val("");
    $("#th3").attr("placeholder", "Sinh").val("");
    // Đổi label của dropdown
    $("#btnToHop").text("KHTN");
    //Hiện table
    showTable();
});

$("#btnKHXH").click(function(){
    // Đổi placeholder
    $("#th1").attr("placeholder", "Sử").val("");
    $("#th2").attr("placeholder", "Địa").val("");
    $("#th3").attr("placeholder", "GDCD").val("");
    // Đổi label của dropdown
    $("#btnToHop").text("KHXH");
    //Hiện table
    showTable();
});

var slider = $("#ratioSelectSlider");

$("#btnSettings").click(function(){
    $("#settingsModal").modal("show");
    settingsModalIint();
});

function settingsModalIint(){
    var slider = document.getElementById("ratioSelectSlider");
    var ratioBaiThi = document.getElementById("ratioBaiThi");
    var ratioTrongNam = document.getElementById("ratioTrongNam");
    slider.value = hsBaiThi * 100;
    ratioBaiThi.innerHTML = slider.value;
    ratioTrongNam.innerHTML = 100 - slider.value;

    slider.oninput = function() {
        hsBaiThi = this.value/100;
        hsTrongNam = this.value/100;
        ratioBaiThi.innerHTML = this.value;
        ratioTrongNam.innerHTML = 100 - this.value;
    }
}
$("#btnSubmit").click(function(){
	$("#duoi1").attr("style", "display:none;");
    toan = getValue("#toan");
    van = getValue("#van");
    anh = getValue("#anh");
    th1 = getValue("#th1");
    th2 = getValue("#th2");
    th3 = getValue("#th3");
    tongket = getValue("#tongket");
    kkhich = getValue("#kkhich");
    uutien = getValue("#uutien");
    diemToHop = (th1 + th2 + th3) / 3;
    diem = ((toan + van + anh + diemToHop + kkhich)/4)*hsBaiThi + tongket*hsTrongNam + uutien;
    diem = diem.toFixed(2);
    var arr = [toan, van, anh, th1, th2, th3];
    for (var i = 0; i < 6; i++){
    	if (arr[i]<=1){
    	    thongBaoKQ(false, diem);
            $("#duoi1").attr("style", "display:block;");
            return;
         }
     } 
    if (diem >= 5){
        thongBaoKQ(true, diem);
	}
    else{
        thongBaoKQ(false, diem);
	}
});

function test(){
    $("#toan").val(8);
    $("#van").val(2);
    $("#anh").val(8.5);
    $("#th1").val(8);
    $("#th2").val(2);
    $("#th3").val(2);
    $("#tongket").val(8.5);
    showTable();
}

function showTable(){
    $("form").addClass("w3-animate-top");
    $("form").attr("style", "dislay:block;");
}

function thongBaoKQ(dau, diem){
    if (dau){
        txt = "đậu";
        $("#txtKQ").attr("class", "text-success");
    }
    else{
        txt = "rớt";
        $("#txtKQ").attr("class", "text-danger");
    }
    $("#txtKQ").html(txt);
    $("#diemKQ").text(diem);
    $("#alertModal").modal("show");
}

function getValue(id){
    var value = parseInt($(id).val());
    if (isNaN(value)) return 0;
    return value;
}