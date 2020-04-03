$(window).on("load", function(){
    // Fade-in animation
    $(".container-fluid").addClass("w3-animate-top");
    $(".container-fluid").attr("style", "display:block;");
});

// Hàm chuyển đổi được gọi khi nhấn nút "Chuyển đổi"
$("#btnSubmit").click(function () {
    var text = $("#txtCqn").val().normalize("NFD");
    var words = text.split(" ");
    var n = words.length;
    var result = "";
    for (var i = 0; i < words.length; i++) {
        result += convWord(words[i]) + " ";
    }
    $("#txtCvnss").html(result);
});

function convWord(wordArg) {
    var word = wordArg;
    // Độ dài từ
    var n = word.length;
    // Bỏ bớt dấu sắc ở mọi từ có chữ cái cuối là: c, p, t, ch
    if (word.match(/c$|p$|t$|ch$/g)) {
        word = word.replace(/\u0301/g, "");
    }

    // I thay Y. Y thay UY. Chỉ hai vần AY, ÂY giữ nguyên AY, ÂY
    if (!word.match(/ay|ây/i)) {
        if (word.match(/uy/i)) {
            word = word.replace("uy", "y");
            word = word.replace("Uy", "Y");
        }
        else if (word.match(/(?<!u)y/i)) {
            word = word.replace("y", "i");
            word = word.replace("Y", "I");
        }
    }
    // F thay PH, Q thay QU, C thay K, K thay KH, Z thay D, D thay Đ, J thay GI, G thay GH, W thay NG-NGH. 
    if (word.match(/^ph/i)) {
        word = word.replace("ph", "f");
        word = word.replace("Ph", "F")
    }
    else if (word.match(/^kh/i)) {
        word = word.replace("kh", "k");
        word = word.replace("Kh", "k")
    }
    else if (word.match(/^qu/i)) {
        word = word.replace("qu", "q");
        word = word.replace("Qu", "Q")
    }
    else if (word.match(/^ph/i)) {
        word = word.replace("k", "c");
        word = word.replace("K", "C")
    }
    else if (word.match(/^d/i)) {
        word = word.replace("d", "z");
        word = word.replace("D", "Z")
    }
    else if (word.match(/^đ/i)) {
        word = word.replace("đ", "d");
        word = word.replace("Đ", "d")
    }
    else if (word.match(/^gi/i)) {
        word = word.replace("gi", "j");
        word = word.replace("Gi", "J");
    }
    else if (word.match(/^ngh/i)) {
        word = word.replace("ngh", "w");
        word = word.replace("Ngh", "W")
    }
    else if (word.match(/^ng/i)) {
        word = word.replace("ng", "w");
        word = word.replace("Ng", "W");
    }
    else if (word.match(/^gh/i)) {
        word = word.replace("gh", "g");
        word = word.replace("Gh", "G")
    }

    // Phụ âm cuối chữ: G thay NG, H thay NH, K thay CH
    word = word.replace(new RegExp("ng$"), "g");
    word = word.replace(new RegExp("nh$"), "h");
    word = word.replace(new RegExp("ch$"), "k");

    /* Rút gọn các nguyên âm ghép UYÊ, IÊ-YÊ, UÔ, ƯƠ, UÂ, UƠ, OĂ, OE, OA 
    còn một nguyên âm              Y,    I,    U, Ư,   Â, Ơ,   Ă, O,  A (ở vần “oay). 
    */
    word = word.replace("uyê".normalize("NFD"), "y");
    word = word.replace("Uyê".normalize("NFD"), "Y");
    word = word.replace("iê".normalize("NFD"), "i");
    word = word.replace("yê".normalize("NFD"), "i");
    word = word.replace("Yê".normalize("NFD"), "I");
    word = word.replace("uô".normalize("NFD"), "u");
    word = word.replace("Uô".normalize("NFD"), "U");
    word = word.replace("ươ".normalize("NFD"), "ư".normalize("NFD"));
    word = word.replace("Ươ".normalize("NFD"), "Ư".normalize("NFD"));
    word = word.replace("uâ".normalize("NFD"), "u");
    word = word.replace("Uâ".normalize("NFD"), "Â".normalize("NFD"));
    word = word.replace("uơ".normalize("NFD"), "ơ".normalize("NFD"));
    word = word.replace("oă".normalize("NFD"), "ă".normalize("NFD"));
    word = word.replace("Oă".normalize("NFD"), "Ă".normalize("NFD"));
    word = word.replace("oe", "o");
    word = word.replace("Oe", "O");
    word = word.replace("oay", "ay");
    word = word.replace("Oay", "Ay");

     /*Và cùng lúc, thay các chữ cái cuối T, P, C, N, M, NG, O-U, I-Y 
     bằng chữ cái khác là                 D, F, S, L, V, Z,   W,   J. 
     */
    word = word.replace(new RegExp("t$"), "d");
    word = word.replace(new RegExp("T$"), "D");
    word = word.replace(new RegExp("p$"), "f");
    word = word.replace(new RegExp("P$"), "F");
    word = word.replace(new RegExp("c$"), "s");
    word = word.replace(new RegExp("C$"), "S");
    word = word.replace(new RegExp("n$"), "l");
    word = word.replace(new RegExp("m$"), "v");
    word = word.replace(new RegExp("ng$"), "z");
    word = word.replace(new RegExp("o$"), "w");
    word = word.replace(new RegExp("u$"), "w");
    word = word.replace(new RegExp("i$"), "j");
    word = word.replace(new RegExp("y$"), "j");
    
    // Nhóm X, K, V, W, H. Thay thế 5 dấu: sắc, huyền, hỏi, ngã, nặng + dấu trăng  hay dấu móc cho chữ 
    // ắ ằ ẳ ẵ ặ, ớ ờ ở ỡ ợ, ứ ừ ử ữ ự trong CQN và CVN. 
    // Dấu trăng = U+0306, dấu móc = U+031B
    // Sắc = U+0301, huyền = U+0300, hỏi = U+0309, ngã = U+0303, nặng = U+0323
    
    if (word.match(new RegExp("\u0306||\u031b"))) {
        // Bỏ dấu trăng, móc
        word = word.replace(new RegExp("\u0306"), "");
        word = word.replace(new RegExp("\u031b"), "");

        // Bỏ dấu thanh
        // Sắc
        if (word.match(new RegExp("\u0301"))) {
            word = word.replace(new RegExp("\u0301"), "");
            word += "x";
        }
        // Huyền
        else if (word.match(new RegExp("\u0300"))) {
            word = word.replace(new RegExp("\u0300"), "");
            word += "k";
        }
        // Hỏi
        else if (word.match(new RegExp("\u0309"))) {
            word = word.replace(new RegExp("\u0309"), "");
            word += "v";
        }
        // Ngã
        else if (word.match(new RegExp("\u0303"))) {
            word = word.replace(new RegExp("\u0303"), "");
            word += "w";
        }
        // Nặng
        else if (word.match(new RegExp("\u0323"))) {
            word = word.replace(new RegExp("\u0323"), "");
            word += "h";
        }
    }
    return word;
}