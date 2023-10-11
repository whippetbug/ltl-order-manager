function openTab(event, tabName){
    let i, tablinks, tabcontent;

    //Sets all tabs to hidden
    tabcontent = document.getElementsByClassName("tab-content");
    for( i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // removes all active classes
    tablinks = document.getElementsByClassName("tablink");
    for ( i = 0; i < tablinks.length; i++ ){
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    //displays selected tab
    document.getElementById(tabName).style.display = "block";
    //adds active to class name of selected tablink
    event.currentTarget.className += " active";

}

// clicks on view orders tab when the page is loaded
window.onload = () => {
    document.getElementById("dashboard-tablink").click();

}

