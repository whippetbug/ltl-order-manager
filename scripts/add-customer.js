const customerNameField = document.getElementById("customer-name");
const tradePriceFormulaField = document.getElementById("trade-price-formula");
const nameInputLabel = document.getElementById("customer-name-label");
const formulaInputLabel = document.getElementById("trade-price-formula-label");
const customerSaveButton = document.getElementById("customer-save-btn");
const savedCustomersList = document.getElementById("saved-customers");
const editCustomerPopup = document.getElementById("edit-customer-popup");
const cancelEditCustomerButton = document.getElementById("cancel-customer-edit");
const deleteCustomerButton = document.getElementById("delete-customer-button");
const saveCustomerEditButton = document.getElementById("customer-edit-save-button");
const editedCustomerName = document.getElementById("customer-name-updated");
const editedTradePriceFormula = document.getElementById("trade-price-formula-updated");
var globalCustomerData;

customerSaveButton.addEventListener("click", () => saveCustomer());

function saveCustomer() {
    const customerName = customerNameField.value;
    const tradePriceFormula = (tradePriceFormulaField.value) / 100;

    window.electronAPI.saveCustomer(customerName, tradePriceFormula);
}

window.electronAPI.addCustomerStatus((event, status) => {
    if (status == "ok") {
        nameInputLabel.style.color = "black";
        customerNameField.placeholder = "";
        formulaInputLabel.style.color = "black";
        tradePriceFormulaField.placeholder = "";

        customerNameField.value = "";
        tradePriceFormulaField.value = "";
    }

    if (status == "no-name") {
        formulaInputLabel.style.color = "black";
        tradePriceFormulaField.placeholder = "";

        nameInputLabel.style.color = "red";
        customerNameField.placeholder = "Enter a customer name";

    }

    if (status == "no-formula") {
        nameInputLabel.style.color = "black";
        customerNameField.placeholder = "";

        formulaInputLabel.style.color = "red";
        tradePriceFormulaField.placeholder = "Enter a formula";

    }

    if(status == "empty") {
        formulaInputLabel.style.color = "red";
        tradePriceFormulaField.placeholder = "Enter a formula";

        nameInputLabel.style.color = "red";
        customerNameField.placeholder = "Enter a customer name";
    }
})

function createCustomerDataListItem(customerData){
    const savedCustomersListContainerFromHtml = document.getElementById("saved-customers-list-container");
    // For trade customer select element in add order page
    createCustomerSelectOptions(customerData);

    // Needed to acces the trade price formula in the add order page
    globalCustomerData = customerData;

    if(savedCustomersListContainerFromHtml !== null){
        savedCustomersListContainerFromHtml.remove();
    }

    const savedCustomersListContainer = document.createElement("div");
    savedCustomersListContainer.id = "saved-customers-list-container";
    savedCustomersList.appendChild(savedCustomersListContainer);

    for (let i = 0; i < customerData.length; i++){
        const formula = (customerData[i].tradePriceFormula) * 100;

        const listItem = document.createElement("li");
        listItem.classList.add("saved-customers-list-items");
        listItem.innerText = `${customerData[i].name}, -${formula}%`;
        savedCustomersListContainer.appendChild(listItem);

        const editCustomerDataButton = document.createElement("button");
        editCustomerDataButton.classList.add("edit-button");
        editCustomerDataButton.id = "edit-customer-data-button";
        editCustomerDataButton.innerText = "Edit";
        editCustomerDataButton.onclick = () => editCustomer(customerData[i]);
        listItem.appendChild(editCustomerDataButton);

    }
}


async function updateCustomersList() {
    await window.electronAPI.fetchCustomerData();   
}

window.electronAPI.returnCustomerData((event, customerDataRecieved) => {
    createCustomerDataListItem(customerDataRecieved);
}) 

function editCustomer(customerData) {
    editCustomerPopup.classList.add("show-popup");
    editedCustomerName.value = customerData.name;
    editedTradePriceFormula.value = (customerData.tradePriceFormula) * 100;

    cancelEditCustomerButton.onclick = () => {
        // editCustomerPopup.classList.remove("show-popup");
        cancelEdit(editCustomerPopup);
    } 

    deleteCustomerButton.onclick = () => deleteCustomer(customerData.id);

    saveCustomerEditButton.onclick = () => {
        updateCustomer(
            customerData.id, 
            editedCustomerName.value, 
            (editedTradePriceFormula.value) / 100 
            );       
    }
    
}

function deleteCustomer(customerId) {
    window.electronAPI.deleteCustomer(customerId);
    editCustomerPopup.classList.remove("show-popup");
} 

function updateCustomer(customerId, customerName, tradePriceFormula) {
    window.electronAPI.updateCustomer(customerId, customerName, tradePriceFormula);
    editCustomerPopup.classList.remove("show-popup");
}


