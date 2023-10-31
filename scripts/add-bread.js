const saveBreadTypeButton = document.getElementById("bread-type-save-btn");
const cancelBreadEditButton = document.getElementById("cancel-bread-edit");
const popup = document.getElementById("popup");
const deleteBreadTypeButton = document.getElementById("delete-bread-type-button");
const popupSaveButton = document.getElementById("popup-save-button");
const breadNameUpdated = document.getElementById("bread-name-updated");
const breadRetailPriceUpdated = document.getElementById("bread-retail-price-updated");
const breadTypesQtyUpdated = document.getElementById("bread-types-qty-updated");

var breadTypeForEdit

saveBreadTypeButton.addEventListener( "click", () => {
    const breadTypeName = document.getElementById("bread-type-name");
    const breadTypeRetailPrice = document.getElementById("bread-type-retail-price");

    let name = breadTypeName.value;
    let retailPrice = breadTypeRetailPrice.value*100;
    let breadType = { name: name, retailPrice: retailPrice };

    if (name === "" || name === undefined){
        breadTypeName.placeholder = "Enter a bread name";
        document.getElementById("bread-name-label").style.color = "red";
        
    } else {
        window.electronAPI.saveBreadType(breadType)

        breadTypeName.placeholder = "";
        document.getElementById("bread-name-label").style.color = "black";
        breadTypeName.value = "";
        breadTypeRetailPrice.value = "";
    }
})

window.electronAPI.updateBreadList(( event, fetchedBreadTypes ) => {   
    updateBreadList(fetchedBreadTypes);
})

function updateBreadList(fetchedBreadTypes) {
    // Stops the list items being displayed more than once when they are updated
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
       
        let newListItem = document.createElement("li");
        newListItem.classList.add("bread-types-list-item");
        breadTypesList.appendChild(newListItem);
      
        let breadTypeLabel = document.createElement("label");
        breadTypeLabel.innerText = `${breadTypes[i].name}, Retail Price: £${(breadTypes[i].retailPrice/100).toFixed(2)}`;
        newListItem.appendChild(breadTypeLabel);
        
        let editBreadTypeButton = document.createElement("button");
        editBreadTypeButton.id = breadTypes[i].name;
        editBreadTypeButton.innerText = "Edit";
        editBreadTypeButton.classList.add("edit-button");
        newListItem.appendChild(editBreadTypeButton);
       
        let editBreadTypeButtonGotFromHtml = document.getElementById(breadTypes[i].name);
        editBreadTypeButtonGotFromHtml.addEventListener( "click", () => {editBreadType(breadTypes[i])});
  
        cancelBreadEditButton.addEventListener("click", () => cancelEdit(popup));
        // creates list item for bread type quantity input on ADD ORDER PAGE
        let breadTypeQtyListItem = document.createElement("li");
        breadTypeQtyListItem.classList.add("bread-type-list-item");
        breadTypesQtyInput.appendChild(breadTypeQtyListItem);
     
        let breadTypeQtyLabel = document.createElement("label");
        breadTypeQtyLabel.innerText = breadTypes[i].name;
        breadTypeQtyLabel.classList.add("input-box-label");
        breadTypeQtyListItem.appendChild(breadTypeQtyLabel);

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
    // onclick used to stop multiple click listeners being added to button every time the popup is opened
    deleteBreadTypeButton.onclick = () => {deleteBreadType(breadType.id)};
    popupSaveButton.onclick = () => {updateBreadType(breadType.id)};
    
}

function cancelEdit (popup) {
    popup.classList.remove("show-popup");

}

function deleteBreadType(breadTypeId){
    window.electronAPI.deleteBreadType(breadTypeId);
    popup.classList.remove("show-popup");
}

function updateBreadType(breadTypeId) {
    const name = breadNameUpdated.value;
    const retailPrice = breadRetailPriceUpdated.value * 100;
    const updatedBreadTypeValues = { 
        id: breadTypeId,
        name: name, 
        retailPrice: retailPrice,
        };
    window.electronAPI.updateBreadType(updatedBreadTypeValues);
    popup.classList.remove("show-popup");
}
