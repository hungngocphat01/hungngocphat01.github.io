const naviSectionHeaders = document.querySelectorAll("#section-navigation li");
const sectionArticles = document.querySelectorAll("article");

for (const naviSectionHeader of naviSectionHeaders) {
    naviSectionHeader.addEventListener("click", function() {
        showArticle(this.innerText);
    })
}

function showArticle(section) {
    for (const article of sectionArticles) {
        if (article.getAttribute("section-name") == section) {
            article.classList.add("selected");
        }
        else {
            article.classList.remove("selected");
        }
    }
}