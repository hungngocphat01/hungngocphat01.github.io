const naviSectionHeaders = document.querySelectorAll("#section-navigation li");
const sectionArticles = document.querySelectorAll("article");

// Clicking on nav item shows the corresponding article
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

// Click on portfolio -> redirect
document.querySelector("li.port").addEventListener("click", function(event) {
    window.location.href = "portfolio.html";
});

// Easter egg ;)
document.addEventListener("keypress", function(event) {
    const keyPressed = event.key;
    if (!isNaN(keyPressed)) {
        const num = Number.parseInt(keyPressed);
        const li = document.querySelector(`#section-navigation li:nth-child(${num})`);
        if (!li) {
            return; 
        }

        const liHovered = document.querySelectorAll(".hovered");
        for (const hovered of liHovered) {
            hovered.classList.remove("hovered");
        }

        li.classList.add("hovered");

        showArticle(li.innerText);
    }
});