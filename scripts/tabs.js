function openTab(event, tabName){
    let i, tablinks, tabcontent;

    tabcontent = document.getElementsByClassName("tab-content");
    for( i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for ( i = 0; i < tablinks.length; i++ ){
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";

}

// clicks on view orders tab when the page is loaded
window.onload = () => {
    document.getElementById("dashboard-tablink").click();

}

