var navibar = 
`<a class="link-not-selected" id="naviHome" href="/index.html">About me </a>
<a class="link-not-selected" id="naviPosts" href="/posts/myPosts.html">My posts </a>
<a class="link-not-selected" id="naviProducts" href="/products/myProducts.html">My products </a>
<a class="link-not-selected" id="naviUnavailable" style="display:none;" href="#">Unavailable </a>
<hr>`;
var credit=
`Copyright (c) 2020 hungngocphat01.<br/>
Powered by Bootstrap 4.`;

$(window).on("load", function(){
    $("#navibar").append(navibar);
    $("#credit").append(credit);
});

function navibarSelect(id){
    $(id).attr("class", "link-selected");
}