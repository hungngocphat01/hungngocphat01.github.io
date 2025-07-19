// CQN - CVNSS 4.0 Converter by Hùng Ngọc Phát
// Mã nguồn có thể được tái sử dụng thoải mái, nhưng nếu dùng trong các project open-source khác phải ghi rõ nguồn.
// 04 Aqril 2020

$(window).on("load", function(){
    // Fade-in animation
    $(".container-fluid").addClass("w3-animate-top");
    $(".container-fluid").attr("style", "display:block;");
});

// Khi click button copy
$("#btnCopy").click(function() {
    var txtCvnss = document.getElementById("txtCvnss");
    txtCvnss.select();
    document.execCommand('copy');
});

// Khi click button reset
$("#btnReset").click(function() {
    $("#txtCqn").val("");
    $("#txtCvnss").val("");
});

// Hàm chèn kí tự vào chuỗi
function strIns(str, i, char) {
    return str.substring(0, i) + char + str.substring(i, str.length);
}

// Hàm xoá kí tự khỏi chuỗi
function strDel(str, i) {
    return str.substring(0, i) + str.substring(i + 1, str.length);
}

// Hàm chuyển đổi được gọi khi nhấn nút "Chuyển đổi"
$("#btnSubmit").click(function () {
    // Đọc dữ liệu từ textbox
    var text = $("#txtCqn").val();
    var resultText = "";
    // Tách dòng
    var lines = text.split("\n");
    // Xử lí từng dòng
    for (var l = 0; l < lines.length; l++) {
        var i = 0;
        // Xử lí kí tự đặc biệt thành 1 từ bằng cách thêm vào khoảng trắng
        while (i < lines[l].length) {
            if (/[~!@#$%^&*()_+[\]{};'\\:"|,/<>?/]/.test(lines[l][i])) {
                lines[l] = strIns(lines[l], i, " ");
                lines[l] = strIns(lines[l], i + 2, " ");
                i += 3;
            }
            else i++;
        }
        // Tách dòng thành nhiều từ
        var words = lines[l].split(" ");
        var n = words.length;
        var resultLine = "";
        // Xử lí từng từ
        for (var j = 0; j < words.length; j++) {
            // Giữ nguyên các "từ" là kí tự đặc biệt
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(words[j])) {
                resultLine += words[j];
            }
            // Còn không, dịch sang CVNSS 4.0
            else resultLine += convWord(words[j]) + " ";
        }
        var i = 0;
        // Xử lí kí tự đặc biệt thành như cũ bằng cách bỏ khoảng trắng đã thêm 
        while (i < resultLine.length) {
            if (/([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(resultLine[i])) {
                resultLine = strDel(resultLine, i - 1);
            }
            else i++;
        }
        // Ghép các dòng lại với nhau
        resultText += resultLine + "\n";
    }
    // Xuất kết quả
    $("#txtCvnss").val(resultText);
});

function convWord(wordArg) {
    // Chuẩn hoá NFD: tách dấu phụ, dấu và chữ cái ra riêng để dễ find & replace
    wordArg = wordArg.normalize("NFD")
    var word = wordArg;
    // Độ dài từ
    var n = word.length;
    // Bỏ bớt dấu sắc ở mọi từ có chữ cái cuối là: c, p, t, ch
    var coSac = /\u0301/.test(word);
    if (/c$|p$|t$|ch$/g.test(word) && coSac) {
        word = word.replace(/\u0301/g, "");
    }

    // I thay Y. Y thay UY. Chỉ hai vần AY, ÂY giữ nguyên AY, ÂY
    if (!(/a(.?)y|a(.?)\u0302(.?)y/i).test(word)) {
        if ((/uy(?!e)/i).test(word)) {
            word = word.replace("uy", "y");
            word = word.replace("Uy", "Y");
        }
        else if (/(?<!u)y/i.test(word)) {
            word = word.replace("y", "i");
            word = word.replace("Y", "I");
        }
    }
    // F thay PH, Q thay QU, C thay K, K thay KH, Z thay D, D thay Đ, J thay GI, G thay GH, W thay NG-NGH. 
    if (/^ph/i.test(word)) {
        word = word.replace("ph", "f");
        word = word.replace("Ph", "F")
    }
    else if (/^kh/i.test(word)) {
        word = word.replace("kh", "k");
        word = word.replace("Kh", "k")
    }
    else if (/^k/i.test(word)) {
        word = word.replace("k", "c");
        word = word.replace("K", "C")
    }
    else if (/^qu/i.test(word)) {
        word = word.replace("qu", "q");
        word = word.replace("Qu", "Q")
    }
    else if (/^ph/i.test(word)) {
        word = word.replace("k", "c");
        word = word.replace("K", "C")
    }
    else if (/^d/i.test(word)) {
        word = word.replace("d", "z");
        word = word.replace("D", "Z")
    }
    else if (/^đ/i.test(word)) {
        word = word.replace("đ", "d");
        word = word.replace("Đ", "D")
    }
    // Nếu không phải gí gì gỉ gĩ gị
    else if (/^gi(?!\u0301|\u0300|\u0309|\u0303|\u0323)/i.test(word)) {
        word = word.replace("gi", "j");
        word = word.replace("Gi", "J");
    }
    // Nếu là gí gì gỉ gĩ gị
    else if (/^gi(?=\u0301|\u0300|\u0309|\u0303|\u0323)/i.test(word)) {
        word = word.replace("g", "j");
        word = word.replace("G", "J");
    }
    else if (/^ngh/i.test(word)) {
        word = word.replace("ngh", "w");
        word = word.replace("Ngh", "W")
    }
    else if (/^ng/i.test(word)) {
        word = word.replace("ng", "w");
        word = word.replace("Ng", "W");
    }
    else if (/^gh/i.test(word)) {
        word = word.replace("gh", "g");
        word = word.replace("Gh", "G")
    }

    // Tìm các dấu phụ
    var coTrang = /\u0306/.test(word);
    var coMoc = /\u031b/.test(word);
    var coMu = /\u0302/.test(word);

    // Tìm các dấu thanh
    // Sắc = U+0301, huyền = U+0300, hỏi = U+0309, ngã = U+0303, nặng = U+0323
    coSac = /\u0301/.test(word);
    var coHuyen = /\u0300/.test(word);
    var coHoi = /\u0309/.test(word);
    var coNga = /\u0303/.test(word);
    var coNang = /\u0323/.test(word);

    /* Rút gọn các nguyên âm ghép UYÊ, IÊ-YÊ, UÔ, ƯƠ, UÂ, UƠ, OĂ, OE, OA 
    còn một nguyên âm              Y,    I,    U, Ư,   Â, Ơ,   Ă, O,  A (ở vần “oay). 
    */
   // Regex: do cách chuẩn hoá NFD đưa dấu thanh vào giữa kí tự chính và dấu phụ nên cần 0-1 kí tự ở giữa
   // ể = e + ? + ^
   if ((new RegExp("uye(.?)\u0302|ie(.?)\u0302|ye(.?)\u0302|uo(.?)\u0302|u(.?)\u031Bo(.?)\u031B|ua(.?)\u0302|uo(.?)\u031B|oa(.?)\u0306|oe|oa".normalize("NFD"), "i")).test(word)) {
        word = word.replace(/uye(.?)\u0302/, "y$1");
        word = word.replace(/Uye(.?)\u0302/, "Y$1");
        word = word.replace(/ie(.?)\u0302/, "i$1");
        word = word.replace(/ye(.?)\u0302/, "i$1");
        word = word.replace(/Ie(.?)\u0302/, "I$1");
        word = word.replace(/uo(.?)\u0302/, "u$1");
        word = word.replace(/Uo(.?)\u0302/, "U$1");
        word = word.replace(/u(.?)\u031Bo(.?)\u031B/, "ư$1");
        word = word.replace(/U(.?)\u031Bo(.?)\u031B/, "Ư$1");
        word = word.replace(/ua(.?)\u0302/, "â$1");
        word = word.replace(/Ua(.?)\u0302/, "Â$1");
        word = word.replace(/uo(.?)\u031B/, "ơ$1");
        word = word.replace(/Uo(.?)\u031B/, "Ơ$1");
        word = word.replace(/oa(.?)\u0306/, "ă$1");
        word = word.replace(/Oa(.?)\u0306/, "Ă$1");
        word = word.replace(/oe(.?)/, "e$1"); 
        word = word.replace(/Oe(.?)/, "E$1");
        word = word.replace(/oa(.?)y/, "a$1y");
        word = word.replace(/Oa(.?)y/, "A$1y");
        word = word.replace(/oa(.+)/,"o$1");
        word = word.replace(/Oa(.+)/, "O$1");
        word = word.normalize("NFD");
        /*Và cùng lúc, thay các chữ cái cuối T, P, C, N, M, NG, O-U, I-Y 
        bằng chữ cái khác là                 D, F, S, L, V, Z,   W,   J. 
        */
        word = word.replace(/t$/g, "d");
        word = word.replace(/T$/g, "D");
        word = word.replace(/p$/g, "f");
        word = word.replace(/P$/g, "F");
        word = word.replace(/c$/g, "s");
        word = word.replace(/C$/g, "S");
        word = word.replace(/n$/g, "l");
        word = word.replace(/m$/g, "v");
        word = word.replace(/ng$/g, "z");
        word = word.replace(/o$/g, "w");
        word = word.replace(/u$/g, "w");
        word = word.replace(/i$/g, "j");
        word = word.replace(/y$/g, "j");
    }

    // Phụ âm cuối chữ: G thay NG, H thay NH, K thay CH
    word = word.replace(/ng$/g, "g");
    word = word.replace(/nh$/g, "h");
    word = word.replace(/ch$/g, "k");

    // Nếu có dấu thanh 
    if (coSac || coHuyen || coHoi || coNga || coNang){
        // Nhóm X, K, V, W, H. Thay thế 5 dấu: sắc, huyền, hỏi, ngã, nặng + dấu trăng  hay dấu móc cho chữ 
        // ắ ằ ẳ ẵ ặ, ớ ờ ở ỡ ợ, ứ ừ ử ữ ự trong CQN và CVN. 
        // Dấu trăng = U+0306, dấu móc = U+031B
        if (coTrang || coMoc) {
            // Bỏ dấu trăng, móc
            word = word.replace(/\u0306/g, "");
            word = word.replace(/\u031b/g, "");

            // Bỏ dấu thanh
            // Sắc
            if (coSac) {
                word = word.replace(/\u0301/g, "");
                word += "x";
            }
            // Huyền
            else if (coHuyen) {
                word = word.replace(/\u0300/g, "");
                word += "k";
            }
            // Hỏi
            else if (coHoi) {
                word = word.replace(/\u0309/g, "");
                word += "v";
            }
            // Ngã
            else if (coNga) {
                word = word.replace(/\u0303/g, "");
                word += "w";
            }
            // Nặng
            else if (coNang) {
                word = word.replace(/\u0323/g, "");
                word += "h";
            }
        }

        /*Nhóm B, D, Q, G, F. Thay thế 5 dấu: sắc, huyền, hỏi, ngã, nặng + dấu nón ^ cho chữ 
        ấ ầ ẩ ẫ ậ, ế ề ể ễ ệ, ố ồ ổ ỗ ộ trong CQN và CVN.
        Dấu mũ = u0302*/ 
        if (coMu) {
            // Bỏ dấu mũ
            word = word.replace(/\u0302/g, "");

            // Bỏ dấu thanh
            // Sắc
            if (coSac) {
                word = word.replace(/\u0301/g, "");
                word += "b";
            }
            // Huyền
            else if (coHuyen) {
                word = word.replace(/\u0300/g, "");
                word += "d";
            }
            // Hỏi
            else if (coHoi) {
                word = word.replace(/\u0309/g, "");
                word += "q";
            }
            // Ngã
            else if (coNga) {
                word = word.replace(/\u0303/g, "");
                word += "g";
            }
            // Nặng
            else if (coNang) {
                word = word.replace(/\u0323/g, "");
                word += "f";
            }
        }
        /*Nhóm J, L, Z, S, R. Thay thế 5 dấu: sắc, huyền, hỏi, ngã, nặng 
        cho chữ không có dấu phụ nào trong CQN và CVN*/
        if (!(coTrang || coMoc || coMu)) {
            // Bỏ dấu thanh
            // Sắc
            if (coSac) {
                word = word.replace(/\u0301/g, "");
                word += "j";
            }
            // Huyền
            else if (coHuyen) {
                word = word.replace(/\u0300/g, "");
                word += "l";
            }
            // Hỏi
            else if (coHoi) {
                word = word.replace(/\u0309/g, "");
                word += "z";
            }
            // Ngã
            else if (coNga) {
                word = word.replace(/\u0303/g, "");
                word += "s";
            }
            // Nặng
            else if (coNang) {
                word = word.replace(/\u0323/g, "");
                word += "r";
            }
        }
    }
    else {
        // Chữ O thay thế dấu trăng hoặc dấu móc cho chữ có thanh ngang như ă, ơ, ư trong CQN và CVN. 
        if (/A/.test(wordArg) && coTrang) {
            word = word.replace("Ă".normalize("NFD"), "A");
            word += "o";
        }
        else if (/a/.test(wordArg) && coTrang) {
            word = word.replace("ă".normalize("NFD"), "a");
            word += "o";
        }
        else if (/O/.test(wordArg) && coMoc) {
            word = word.replace("Ơ".normalize("NFD"), "O");
            word += "o";
        }
        else if (/o/.test(wordArg) && coMoc) {
            word = word.replace("ơ".normalize("NFD"), "o");
            word += "o";
        }
        else if (/u/.test(wordArg) && coMoc) {
            word = word.replace("ư".normalize("NFD"), "u");
            word += "o";
        }
        else if (/U/.test(wordArg) && coMoc) {
            word = word.replace("Ư".normalize("NFD"), "U");
            word += "o";
        }
        
        // Chữ Y thay thế dấu nón ^ cho chữ có thanh ngang như â, ê, ô trong CQN và CVN
        if (/a/.test(wordArg) && coMu) {
            word = word.replace("â".normalize("NFD"), "a");
            word += "y";
        }
        else if (/A/.test(wordArg) && coMu) {
            word = word.replace("Â".normalize("NFD"), "A");
            word += "y";
        }
        else if (/e/.test(wordArg) && coMu) {
            word = word.replace("ê".normalize("NFD"), "e");
            word += "y";
        }
        else if (/E/.test(wordArg) && coMu) {
            word = word.replace("Ê".normalize("NFD"), "E");
            word += "y";
        }
        else if (/o/.test(wordArg) && coMu) {
            word = word.replace("ô".normalize("NFD"), "o");
            word += "y";
        }
        else if (/O/.test(wordArg) && coMu) {
            word = word.replace("Ô".normalize("NFD"), "o");
            word += "y";
        }
    }
    // Strip các dấu phụ dư thừa
    word = word.replace(/\u0306|\u031b|\u0302/g, "");

    /* Chữ P là ký hiệu dấu câm/ký hiệu chữ bỏ dấu thanh & dấu phụ. 
    Ta chỉ đặt P sau chữ không có dấu thanh và dấu phụ nào trong chữ có vần CVN 
    để không bị hiểu lầm qua chữ khác. */

    var phuamlamdau = ['x', 'k', 'v', 'w', 'h', 'b', 'd', 'q', 'g', 'f', 'j', 'l', 'z', 's', 'r'];
    
    if (phuamlamdau.includes(word[word.length - 1]) && !(coTrang || coMoc || coMu) 
        && !(coSac || coHuyen || coHoi || coNga || coNang)) {
        word += "p";
    }
    // Chuẩn hoá lại theo chuẩn NFC
    return word.normalize("NFC");
}
