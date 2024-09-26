document.addEventListener('DOMContentLoaded', (event) => {
    var uniqueCodeElement = document.getElementById('uniqueCode');
    var uniqueCode = generateUniqueCode();
    uniqueCodeElement.textContent = uniqueCode;

    fetch('Resources.csv')
        .then(response => response.text())
        .then(csvData => {
            items = csvData.split('\n').filter(row => row.length > 0).map(row => row.split(','));
            headers = items[0];
            skuIndex = headers.indexOf('SKU');
            categoryIndex = headers.indexOf('Category');
            subcategoryIndex = headers.indexOf('Subcategory');

            const categories = new Set(items.slice(1).map(item => item[categoryIndex]));
            const galleryContainer = document.getElementById('galleryContainer');
            const categorySelect = createDropdown('categorySelect', categories);

            categorySelect.addEventListener('change', displayGallery);

            // Create labels for the dropdowns
            const categoryLabel = document.createElement('label');
            categoryLabel.textContent = 'Category:';
            categoryLabel.htmlFor = 'categorySelect';

            // Insert labels and dropdowns
            galleryContainer.insertBefore(categoryLabel, galleryContainer.firstChild);
            galleryContainer.insertBefore(categorySelect, categoryLabel.nextSibling);

            displayGallery(items);
            document.getElementById('csvGallery').style.display = 'flex';
        })
        .catch(error => console.error('Error fetching CSV:', error));
});

function generateUniqueCode() {
    var timestamp = Date.now();
    var yearEndNumber = new Date().getFullYear().toString().substr(-1);
    var mapping = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J'};
    var secondChar = mapping[yearEndNumber];
    var randomNum = Math.floor(Math.random() * 10000);
    return 'E' + secondChar + randomNum.toString().padStart(4, '0');
}

function createDropdown(id, options) {
    const select = document.createElement('select');
    select.id = id;

    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All';
    select.appendChild(allOption);

    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        select.appendChild(option);
    });

    return select;
}

function displayGallery() {
    const selectedCategory = document.getElementById('categorySelect').value;
    let filteredSubcategories = new Set();

    // Populate filteredSubcategories based on all items
    for (let i = 1; i < items.length; i++) {
        if (selectedCategory === 'All' || items[i][categoryIndex] === selectedCategory) {
            filteredSubcategories.add(items[i][subcategoryIndex]);
        }
    }

    // Update subcategory dropdown options
    const subcategorySelect = document.getElementById('subcategorySelect');
    subcategorySelect.innerHTML = '';
    subcategorySelect.appendChild(createOption('All'));
    filteredSubcategories.forEach(subcategory => {
        subcategorySelect.appendChild(createOption(subcategory));
    });

    // Display gallery
    const gallery = document.getElementById('csvGallery');
    gallery.innerHTML = '';
    for (let i = 1; i < items.length; i++) {
        if ((selectedCategory === 'All' || items[i][categoryIndex] === selectedCategory)) {
            const div = createCard(items[i]);
            gallery.appendChild(div);
        }
    }
}

function createOption(value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
}

function createCard(dataRowItems) {
    const div = document.createElement('div');
    div.classList.add('card');
    const contentDiv = createContentDiv(dataRowItems);
    div.appendChild(contentDiv);
    return div;
}

function createContentDiv(dataRowItems) {
    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    let img, title, sku, quantity;

    dataRowItems.forEach((cell, cellIndex) => {
        if (headers[cellIndex] === 'Title') {
            title = document.createElement('p');
            title.textContent = cell;
            contentDiv.appendChild(title);
        } else if (headers[cellIndex] === 'SKU') {
            sku = document.createElement('p');
            sku.textContent = `SKU: ${cell}`;
            contentDiv.appendChild(sku);
        } else if (headers[cellIndex] === 'Quantity') {
            quantity = document.createElement('p');
            quantity.textContent = `Quantity: ${cell}`;
            contentDiv.appendChild(quantity);
        } else if (cellIndex === 0) {
            img = document.createElement('img');
            img.src = cell;
            img.alt = 'Thumbnail';
            contentDiv.appendChild(img);
        }
    });

    return contentDiv;
}


// Create option for dropdown
function createOption(value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
}

// Add reset button
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.style.display = 'block'; // Add this line
resetButton.addEventListener('click', function() {
    document.getElementById('categorySelect').value = 'All';
    document.getElementById('subcategorySelect').value = 'All';
    displayGallery();
});
galleryContainer.insertBefore(resetButton, galleryContainer.firstChild);


let timeout = null;

function liveSearch() {
    clearTimeout(timeout);

    const input = document.getElementById("myInput");
    const filter = input.value.toUpperCase();
    const gallery = document.getElementById('csvGallery');
    const cards = gallery.getElementsByClassName('card');

    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByClassName("title")[0];
        let sku = cards[i].getElementsByClassName("sku")[0];
        if (title || sku) {
            let txtValueTitle = title ? title.textContent || title.innerText : '';
            let txtValueSku = sku ? sku.textContent || sku.innerText : '';
            if (txtValueTitle.toUpperCase().indexOf(filter) > -1 || txtValueSku.toUpperCase().indexOf(filter) > -1) {
                cards[i].style.display = "";
            } else {
                cards[i].style.display = "none";
            }
        }       
    }

    timeout = setTimeout(function () {
        input.value = '';
    }, 1500); // Clear the input field 2 seconds after the user stops typing
}

function createContentDiv(dataRowItems) {
    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    let img, title, sku, quantity;
    dataRowItems.forEach((cell, cellIndex) => {
        if (items[0][cellIndex] === 'Title') {
            title = createParagraph(cell, cellIndex, dataRowItems);
            title.classList.add('title');
        } else if (['SKU', 'ID'].includes(items[0][cellIndex])) {
            sku = createParagraph(cell, cellIndex, dataRowItems);
            sku.classList.add('sku');
        } else if (items[0][cellIndex] === 'Quantity') {
            quantity = createParagraph(cell, cellIndex, dataRowItems);
            quantity.classList.add('quantity');
        } else if (cellIndex === 0) {
            img = createImage(cell);
        }
    });
    contentDiv.appendChild(img);
    contentDiv.appendChild(title);
    contentDiv.appendChild(quantity);
    contentDiv.appendChild(sku);
    return contentDiv;
}


function createCard(dataRowItems) {
    const div = document.createElement('div');
    div.classList.add('card');
    const itemKey = dataRowItems.join(',');
    if (selectedItems.has(itemKey)) {
        div.classList.add('selected');
    }
    div.addEventListener('click', function() {
        toggleSelection(div, itemKey);
    });
    const contentDiv = createContentDiv(dataRowItems);
    div.appendChild(contentDiv);

    // Add quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.max = '99';
    quantityInput.value = '1';
    quantityInput.classList.add('quantity-input');
    quantityInput.style.display = 'none'; // Hide the input by default
    quantityInput.style.top = '30%'; // Center it vertically
    quantityInput.style.left = '50%'; // Center it horizontally
    quantityInput.style.transform = 'translate(-50%, -50%)'; // Adjust the position so it's centered properly

    // Add event listener to stop propagation
    quantityInput.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    div.appendChild(quantityInput); // Append the input to the card

    return div;
}

function toggleSelection(element, itemKey) {
    const cart = document.getElementById('cart'); // assuming 'cart' is the id of your cart element

    if (selectedItems.has(itemKey)) {
        selectedItems.delete(itemKey);
        element.classList.remove('selected');
    } else {
        selectedItems.add(itemKey);
        element.classList.add('selected');
    }

    // Show or hide quantity input
    const quantityInput = element.querySelector('.quantity-input');
    if (element.classList.contains('selected')) {
        quantityInput.style.display = 'block'; // Show the input
    } else {
        quantityInput.style.display = 'none'; // Hide the input
    }

    // Show or hide cart
    if (selectedItems.size > 0) {
        cart.style.display = 'block'; // Show the cart
    } else {
        cart.style.display = 'none'; // Hide the cart
    }

    updateClearSelectionButton();
    updateTableSelections(); // Add this line
}

function createImage(cell) {
    const img = document.createElement('img');
    img.src = cell;
    img.alt = 'Thumbnail';
    img.classList.add('thumbnail');
    return img;
}

function createParagraph(cell, cellIndex, dataRowItems) {
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.style.fontWeight = 'bold';
    if (items[0][cellIndex] === 'Title') {
        p.textContent = cell;
        p.classList.add('title');
    } else if (['SKU', 'ID'].includes(items[0][cellIndex])) {
        p.textContent = cell; // Only include the number
        p.classList.add('sku');
    } else if (items[0][cellIndex] === 'Quantity') {
        const quantityContainer = document.createElement('div');
        quantityContainer.classList.add('quantity-container');
        const quantity = document.createElement('p');
        quantity.textContent = cell;
        quantity.style.fontSize = '1.5em';
        quantity.classList.add('quantity');
        const availability = document.createElement('p');
        availability.textContent = 'Available';
        availability.classList.add('availability');
        quantityContainer.appendChild(quantity);
        quantityContainer.appendChild(availability);
        p.appendChild(quantityContainer);
    }
    return p;
}

document.getElementById('durationType').addEventListener('change', function() {
    if (this.checked) {
      // The checkbox is checked, handle accordingly
      console.log('Switched to Days');
    } else {
      // The checkbox is not checked, handle accordingly
      console.log('Switched to Hours');
    }
  });
  
  $(document).ready(function(){
    $("#menuButton").click(function(event){
        event.stopPropagation();
        if ($("#leftColumn").width() > 0) {
            $("#leftColumn").width(0);
        } else {
            $("#leftColumn").width(300); // or whatever width you want
        }
    });

    $("#leftColumn").click(function(event) {
        event.stopPropagation();
    });
});
