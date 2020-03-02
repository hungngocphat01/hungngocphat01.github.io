// Điểm các môn
var toan, van, anh, th1, th2, th3, tongket, kkhich, uutien, diem, diemToHop;
// Hệ số các bài thi
var hsBaiThi = 0.5, hsTrongNam = 0.5;
// Lấy năm hiện tại
var d = new Date;
var year = d.getFullYear();

$(window).on("load", function(){
    // Fade-in animation
    $(".container-fluid").addClass("w3-animate-top");
    $(".container-fluid").attr("style", "display:block;");
    // Cảnh báo nếu không còn là năm 2020
    // Để >= để test dialog
    if (year > 2020){
        $("#alert2021").modal("show");
        $("#btn2021").click(function(){
            $("#settingsModal").modal("show");
            settingsModalInit();
        });
    }
});

$("#utkkLaGi").click(function(){
    $("#chuThichModal").modal("show");
});

// Click button KHTN
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

// Click button KHXH
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

// Click button Cài đặt
$("#btnSettings").click(function(){
    $("#settingsModal").modal("show");
    settingsModalInit();
});

// Khởi tạo modal Cài đặt
function settingsModalInit(){
    var slider = document.getElementById("ratioSelectSlider");
    // Lấy hệ số hiện tại
    slider.value = hsBaiThi * 100;
    // Gán giá trị slider cho span ratioBaiThi và ratioTrongNam
    $("#ratioBaiThi").html(slider.value);
    $("#ratioTrongNam").html(100 - slider.value);
    // Sự kiện trượt thanh slider
    slider.oninput = function() {
        // Cập nhật dữ liệu trong js
        hsBaiThi = this.value/100;
        hsTrongNam = 1 - this.value/100;
        // Cập nhật dữ liệu trong HTML
        $("#ratioBaiThi").html(this.value);
        $("#ratioTrongNam").html(100 - this.value);
    }
}


// Hàm lấy giá trị của ô input
function getValue(id){
    var value = parseFloat($(id).val());
    // Nếu ô input rỗng, trả về 0
    if (isNaN(value)) return 0;
    return value;
}

// Nhấn button Tính điểm
$("#btnSubmit").click(function(){
    // Thông báo linh tinh, vài easter egg
    var tbao = $("#linhtinh");
    tbao.attr("style", "display: hidden;");
    tbao.html("");
    var lacquan = 0, biquan = 0, diem10 = false;

    $("#duoi1").attr("style", "display:none;");
    // Lấy điểm đã nhập
    toan = getValue("#toan");
    van = getValue("#van");
    anh = getValue("#anh");
    th1 = getValue("#th1");
    th2 = getValue("#th2");
    th3 = getValue("#th3");
    tongket = getValue("#tongket");
    kkhich = getValue("#kkhich");
    uutien = getValue("#uutien");
    // Tính điểm
    diemToHop = (th1 + th2 + th3) / 3;
    diem = (toan + van + anh + diemToHop + kkhich)/4*hsBaiThi + tongket*hsTrongNam + uutien;
    diem = diem.toFixed(2);
    
    if (diem > 10) {
        thongBaoKQ(false, diem);
        tbao.append("Điểm của bạn lớn hơn 10. Có ăn gian không đấy?");
        tbao.attr("style", "display: block;");
        return;
    }

    // Nếu có môn nào <= 1 coi như rớt
    var arr = [toan, van, anh, th1, th2, th3];
    for (var i = 0; i < 6; i++){
    	if (arr[i]<=1){
    	    thongBaoKQ(false, diem);
            $("#duoi1").attr("style", "display:block;");
            return;
        }
        // Vài easter egg
        // Cà khịa nếu có môn 10 điểm
        if (arr[i] == 10 && diem10 == false){
            // Flag tránh append điểm 10 2 lần
            tbao.append("Cơ mà 10 điểm hả? Có tự tin quá hông vậy :v <br>");
            tbao.attr("style", "display: block;");
            diem10 = true;
        }
        // Dưới 5: bi quan. Nếu nhiều hơn 3 môn dưới 5 sẽ thông báo
        if (arr[i] < 5) biquan++;
        // Trên 8: lạc quan. Nếu nhiều hơn 3 môn trên 8 sẽ cà khịa
        if (arr[i] >= 8) lacquan++;
    } 

    if(lacquan >=3){
        tbao.append("Có 3 môn trên 8 luôn :v <br/>");
        tbao.attr("style", "display: block;");
        if (diem10){
            tbao.append("Mà điểm có vẻ cao phết đấy :v");
        }
    }

    if(biquan >=3){
        tbao.append("Có bi quan quá hông vậy :v <br/>");
        tbao.attr("style", "display: block;");
        if (diem10){
            tbao.append("Cơ mà sao có môn 10đ mà còn lại bi quan vậy :v");
        }
    }

    if (diem >= 5){
        thongBaoKQ(true, diem);
	}
    else{
        thongBaoKQ(false, diem);
	}
});

// Hàm điền dữ liệu mẫu để test
function test(){
    showTable();
    $("#btnToHop").text("KHTN");
    $("#toan").val(8.2);
    $("#van").val(5.5);
    $("#anh").val(9.2);
    $("#th1").val(7.75);
    $("#th2").val(5.5);
    $("#th3").val(4.75);
    $("#tongket").val(7.8);
    $("#kkhich").val(2);
}

// Khi nhấn nút Reset trong modal Cài đặt
$("#btnResetSettings").click(function(){
    hsBaiThi = 0.5;
    settingsModalInit();
});

// Hiện form nhập liệu
function showTable(){
    $("form").addClass("w3-animate-top");
    $("form").attr("style", "dislay:block;");
}

// Hàm thông báo kết quả
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