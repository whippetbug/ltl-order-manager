// Runs update function when called for by main process
window.electronAPI.update((event, message) => {
    update()
})


function update() {
    // Updates unpaid orders table in dashboard tab
    window.electronAPI.updateUnpaidOrders(); 

    // Updates search results 
    searchOrdersButton.click();


}