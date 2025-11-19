const API_URL = 'https://tasks123.herokuapp.com';

document.addEventListener('DOMContentLoaded', function () {
    fetch(API_URL + '/getAll')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
});

document.querySelector('table tbody').addEventListener
('click', function(event){
    if(event.target.className === "delete-row-btn") {
        deleteRowById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
        handleEditRow(event.target.dataset.id);
    }
});

const updateBtn = document.querySelector('#update-row-btn');
const searchBtn = document.querySelector('#search-btn');
const loadSortedBtn = document.querySelector('#load-sorted-btn');

searchBtn.onclick = function() {
    const searchValue = document.querySelector('#search-input').value;

    fetch('http://localhost:5000/search/' + searchValue)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

loadSortedBtn.onclick = function() {
    fetch('http://localhost:5000/getTasksByDate')
    .then(response => response.json())
    .then(data => loadSortedTable(data['data']));
}

function deleteRowById(id) {
    fetch('http://localhost:5000/delete/' + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    });
}

function handleEditRow(id) {
    const updateSection = document.querySelector('#update-row');
    updateSection.hidden = false;
    document.querySelector('#update-row-btn').dataset.id = id;

    const table = document.querySelector('table tbody');
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const editBtn = row.querySelector('.edit-row-btn');
        if (editBtn && editBtn.dataset.id == id) {
            const cells = row.querySelectorAll('td');
            document.querySelector('#update-name-input').value = cells[0].textContent;
            document.querySelector('#update-description-input').value = cells[1].textContent;
            const dueDate = cells[2].textContent;
            if (dueDate && dueDate !== 'No due date') {
                const dateObj = new Date(dueDate);
                const formattedDate = dateObj.toISOString().split('T')[0];
                document.querySelector('#update-date-due-input').value = formattedDate;
            }
        }
        
    });

}

updateBtn.onclick = function() {
    const updateNameInput = document.querySelector('#update-name-input');
    const updateDescriptionInput = document.querySelector('#update-description-input');
    const updateDateDueInput = document.querySelector('#update-date-due-input');
    const id = document.querySelector('#update-row-btn').dataset.id;
    
    fetch('http://localhost:5000/update', {
        method: 'PATCH',
        headers: {
            'Content-type' : 'application/json'
        },
        body: JSON.stringify({
            id: id,
            name: updateNameInput.value,
            description: updateDescriptionInput.value,
            dateDue: updateDateDueInput.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })
}

const addBtn = document.querySelector('#add-name-btn');

addBtn.onclick = function () {
    const nameInput = document.querySelector('#name-input');
    const descriptionInput = document.querySelector('#description-input');
    const dateDueInput = document.querySelector('#date-due-input');

    const name = nameInput.value;
    const description = descriptionInput.value;
    const dateDue = dateDueInput.value;

    nameInput.value = "";
    descriptionInput.value= "";
    dateDueInput.value = "";


    fetch('http://localhost:5000/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            name : name,
            description: description,
            dateDue: dateDue
        })
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

function insertRowIntoTable(data){
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');
    let tableHtml = "<tr>";

    tableHtml += `<td>${data.name}</td>`;
    tableHtml += `<td>${data.description || 'No description'}</td>`;
    tableHtml += `<td>${data.dateDue ? new Date(data.dateDue).toLocaleDateString() : 'No due date'}</td>`;
    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</button></td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</button></td>`;
    tableHtml += "</tr>";

    if(isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function({id, name, description, due_date}){
        tableHtml += "<tr>";
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${description || 'No description'}</td>`
        tableHtml += `<td>${due_date ? new Date(due_date).toLocaleString(): 'No due date'}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</button></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

function loadSortedTable(data) {
    const table = document.querySelector('#sorted-table tbody');

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='2'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function({name, due_date}){
        tableHtml += "<tr>";
        tableHtml += `<td>${name}</td>`;
        let dateDisplay = 'No due date';
        if (due_date && due_date !== '') {
            try {
                const dateObj = new Date(due_date);
                if (!isNaN(dateObj.getTime())) {
                    dateDisplay = dateObj.toLocaleString();
                }
            } catch (e) {
                dateDisplay = 'No due date';
            }
        }
        tableHtml += `<td>${dateDisplay}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}
