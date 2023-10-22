const saveBreadTypeButton = document.getElementById("bread-type-save-btn");
const cancelBreadEditButton = document.getElementById("cancel-bread-edit");
const popup = document.getElementById("popup");
const deleteBreadTypeButton = document.getElementById("delete-bread-type-button");
const popupSaveButton = document.getElementById("popup-save-button");
const breadNameUpdated = document.getElementById("bread-name-updated");
const breadTradePriceUpdated = document.getElementById("bread-trade-price-updated");
const breadRetailPriceUpdated = document.getElementById("bread-retail-price-updated");
const breadTypesQtyUpdated = document.getElementById("bread-types-qty-updated");

var breadTypeForEdit

saveBreadTypeButton.addEventListener( "click", () => {
    const breadTypeName = document.getElementById("bread-type-name");
    const breadTypeTradePrice = document.getElementById("bread-type-trade-price");
    const breadTypeRetailPrice = document.getElementById("bread-type-retail-price");

    let name = breadTypeName.value;
    let tradePrice = breadTypeTradePrice.value*100;
    let retailPrice = breadTypeRetailPrice.value*100;
    let breadType = { name: name, tradePrice: tradePrice, retailPrice: retailPrice };

    if (name === "" || name === undefined){
        breadTypeName.placeholder = "Enter a bread name";
        document.getElementById("bread-name-label").style.color = "red";
        
    } else {
        window.electronAPI.saveBreadType(breadType)

        breadTypeName.placeholder = "";
        document.getElementById("bread-name-label").style.color = "black";
        breadTypeName.value = "";
        breadTypeTradePrice.value = "";
        breadTypeRetailPrice.value = "";
    }
})

//Updates the bread list when it is recieved
window.electronAPI.updateBreadList(( event, fetchedBreadTypes ) => {
    
    updateBreadList(fetchedBreadTypes);

})

function updateBreadList(fetchedBreadTypes) {
    //Removes all list items before building them to allow updating of the list
    const breadTypesListItems = document.getElementsByClassName("bread-types-list-item");
    const breadTypesListItemsLength = breadTypesListItems.length;
    breadTypeQtyListItemsFetched = document.getElementsByClassName("bread-type-list-item");
    const breadTypeQtyListItemsLength = breadTypeQtyListItemsFetched.length;

    if (breadTypesListItems !== undefined) {
        for ( let i = 0; i < breadTypesListItemsLength; i++){
            breadTypesListItems[0].remove();
        }
    }

    if (breadTypeQtyListItemsFetched !== undefined){
        for ( let i = 0; i < breadTypeQtyListItemsLength; i++){
            breadTypeQtyListItemsFetched[0].remove();
        }
    }

    const breadTypesList = document.getElementById("bread-types-list");
    const breadTypesQtyInput = document.getElementById("bread-types-qty-input");
    breadTypes = fetchedBreadTypes;

    //builds bread type list item 
    for ( let i = 0; i < breadTypes.length; i++) {
        //Creates list item name
        let newListItem = document.createElement("li");
        newListItem.classList.add("bread-types-list-item");
        breadTypesList.appendChild(newListItem);
        //Creates list item label
        let breadTypeLabel = document.createElement("label");
        breadTypeLabel.innerText = `${breadTypes[i].name}, Retail Price: £${(breadTypes[i].retailPrice/100).toFixed(2)}, Trade Price: £${(breadTypes[i].tradePrice/100).toFixed(2)}`;
        newListItem.appendChild(breadTypeLabel);
        //Creates delete button
        let editBreadTypeButton = document.createElement("button");
        editBreadTypeButton.id = breadTypes[i].name;
        editBreadTypeButton.innerText = "Edit";
        editBreadTypeButton.classList.add("edit-button");
        newListItem.appendChild(editBreadTypeButton);
        //Gets edit button and adds onclick event listner
        let editBreadTypeButtonGotFromHtml = document.getElementById(breadTypes[i].name);
        editBreadTypeButtonGotFromHtml.addEventListener( "click", () => {editBreadType(breadTypes[i])});
        // adds event listener to a cancel bread edit button
        cancelBreadEditButton.addEventListener("click", cancelBreadEdit);
        // creates list item for bread type quantity input
        let breadTypeQtyListItem = document.createElement("li");
        breadTypeQtyListItem.classList.add("bread-type-list-item");
        breadTypesQtyInput.appendChild(breadTypeQtyListItem);
        //Creates bread type label
        let breadTypeQtyLabel = document.createElement("label");
        breadTypeQtyLabel.innerText = breadTypes[i].name;
        breadTypeQtyLabel.classList.add("input-box-label");
        breadTypeQtyListItem.appendChild(breadTypeQtyLabel);
        //Creates input box for bread type quantity input 
        let breadTypeQtyInputBox = document.createElement("input");
        breadTypeQtyInputBox.classList.add("input-box");
        breadTypeQtyInputBox.type = "number";
        breadTypeQtyInputBox.id = `${breadTypes[i].name}-qty-input`;
        breadTypeQtyInputBox.placeholder = "Quantity";
        breadTypeQtyListItem.appendChild(breadTypeQtyInputBox);
    }
    }

// shows popup for editing bread type
function editBreadType(breadType) {
    breadTypeForEdit = breadType
    popup.classList.add("show-popup");
    document.getElementById("bread-name-updated").value = breadType.name;
    document.getElementById("bread-retail-price-updated").value = (breadType.retailPrice / 100).toFixed(2);
    document.getElementById("bread-trade-price-updated").value = (breadType.tradePrice / 100).toFixed(2);
    deleteBreadTypeButton.onclick = () => {deleteBreadType(breadType.id)};
    popupSaveButton.onclick = () => {updateBreadType(breadType.id)};
    
}

// Cancels popup for editing bread type
function cancelBreadEdit () {
    popup.classList.remove("show-popup");

}

//Deletes bread type 
function deleteBreadType(breadTypeId){
    window.electronAPI.deleteBreadType(breadTypeId);
    popup.classList.remove("show-popup");
}

//Saves changes to the bread type
function updateBreadType(breadTypeId) {
    const name = breadNameUpdated.value;
    const tradePrice = breadTradePriceUpdated.value * 100;
    const retailPrice = breadRetailPriceUpdated.value * 100;
    const updatedBreadTypeValues = { 
        id: breadTypeId,
        name: name, 
        tradePrice: tradePrice, 
        retailPrice: retailPrice,
        };
    window.electronAPI.updateBreadType(updatedBreadTypeValues);
    popup.classList.remove("show-popup");
}
