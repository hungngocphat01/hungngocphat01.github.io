$(window).on("load", function(){
    // Fade-in animation
    $(".container-fluid").addClass("w3-animate-top");
    $(".container-fluid").attr("style", "display:block;");
});

$.getJSON(
    'https://openexchangerates.org/api/latest.json?app_id=7cf43d775b3e429f84db937b459ef543',
    function(data) {
        // Check money.js has finished loading:
        if ( typeof fx !== "undefined" && fx.rates ) {
            fx.rates = data.rates;
            fx.base = data.base;
        } else {
            // If not, apply to fxSetup global:
            var fxSetup = {
                rates : data.rates,
                base : data.base
            }
        }
    }
);

var rate = [];
const QUANTITY = 0;
const PRICE = 1;

function setRateByRegion(region) {
    if (region == 'jp') {
        rate = [
            [1, 1.12],
            [5, 3.46],
            [12, 8.05],
            [26, 16.11],
            [50, 28.66],
            [86, 48.13]
        ];
    }
    else if (region == 'en') {

    }
    else {
        console.log("Wrong region: " + String(region));
    }
}

function setCustomRate() {

}

function sortRateArrDec(arr) {
    var size = arr.length;
    for (var i = 0; i < size - 1; i++) {
        for (var j = i + 1; j < size; j++) {
            if (arr[i][QUANTITY] < arr[j][QUANTITY]) {
                var t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            }
        }
    }
}

// Hàm chuyển đổi được gọi khi nhấn nút "Chuyển đổi"
$("#btn-submit").click(function () {
    // Default rate: JP
    setRateByRegion('jp');

    $("#result-div").attr("style", "display: block;");
    var n_lovegem = parseInt($("#inp-lovegem").val());
    var n_value = 0;
    sortRateArrDec(rate);
    while (n_lovegem != 0) {
        for (var i = 0; i < rate.length; i++) {
            if (rate[i][QUANTITY] <= n_lovegem) {
                n_value += rate[i][PRICE];
                n_lovegem -= rate[i][QUANTITY];
                break;
            }
        }
    }

    $("#result-span-usd").html(String(n_value.toFixed(2)));    
    $("#result-span-vnd").html(String(fx(n_value).from("USD").to("VND").toFixed(2)));   
});
