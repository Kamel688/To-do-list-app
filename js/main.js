let todoBox;
let todoBtn; //Przycisk z logo todo - wysuwa inne przyciski
let todoBtns;
let removeBtn;
let leftToolArea; //Przyciski z lewej strony
let rightToolArea; //Przyciski z prawej strony
let searchEngineBox;
let searchEngine;
let tableBody;
let table;
let addBtn;
let sortBtn;
let findBtn;
let confirmBtn;
let cancelBtn;
let manNumber = 1;
let womanNumber = 1;
let imgSrc; //Scieżka do obrazka - pobieramy do edycji
let oldName; // Zmienna przechowuje stare dane osoby aby sprawdzić doszlo do jakiejś zmiany czy nie (w celu zmiany obrazka)
let oldPriority; //Ustaw stary priorytet do okna edycji
let paginationText;
let paginationList;
let pageNumberItems;
let previous;
let next;
let oldTableRow;
let toolBtns;
let popup;
let shadow;

const paginateNumber = 4; //Ustal ilość wierszy dla stronnicowania (licz od 0)
let startNumber = 0; //rozpocznij stronnicowanie od 1 elementu
let endNumber = paginateNumber; //zakończ stronnicowanie do ostatniego elementu

let startPageNumer; //Przedział początkowy aby wyświetlić odpwiednią stronę
let endPageNumber; //Przedział końcowy aby wyświetlić odpwiednią stronę

let pageNumber = 1; //Aktualna strona wierszy - początkowo pierwsza
//let currentPageNumber = 0;
let newPageNumber;
let newActivePage = 0; //Aktywna strona dla wyszukiwania
let activePageAfterSearching;
//Zmienne do funkcji createPaginationNumber.
let dataPageNumber = 0; //Wartosc dataNumber potrzebna do stronnicowania. Zaczynamy od 0 poniewaz jest to 1 strona.
let liPageNumber = 1; //Zawartość dla elementu li czyli numer strony. Zaczynamy od 1.

let clickedPage = false; //zmienna, która mowi czy numer strony jest klikniety czy nie. Jeśli jest to nie zmieniamy aktywnego numeru po usunięciu wierszy.

let isSorting = false;

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
	addAnimation();
	observeChanges(tableBody, paginate);
};

const prepareDOMElements = () => {
	toolBtns = document.getElementsByClassName("todo__table-btn");
	todoBox = document.querySelector(".todo");
	todoBtn = document.querySelector(".todo__header-btn-logo");
	todoBtns = document.querySelectorAll(".todo__header-btn");
	leftToolArea = document.querySelector(".todo__header-btns-left");
	rightToolArea = document.querySelector(".todo__header-btns-right");
	searchEngineBox = document.querySelector(".todo__search-area-box");
	searchEngine = document.querySelector(".todo__search-engine");
	table = document.querySelector(".todo__table");
	tableBody = document.querySelector(".todo__table-body");
	addBtn = document.querySelector(".todo__header-btn--add");
	sortBtn = document.querySelector(".todo__header-btn--sort");
	findBtn = document.querySelector(".todo__header-btn--find");
	removeBtn = document.querySelector(".todo__header-btn--remove");
	confirmBtn = document.querySelector(".popup__bottom-button--confirm");
	cancelBtn = document.querySelector(".popup__bottom-button--cancel");
	paginationText = document.querySelector(".todo__pagination-text");
	paginationList = document.querySelector(".todo__pagination-list");
	pageNumberItems = document.querySelectorAll("[data-page-number]");
	previous = document.querySelector(".todo__pagination-list-item-previous");
	next = document.querySelector(".todo__pagination-list-item-next");
	popup = document.querySelector(".popup");
	shadow = document.querySelector(".shadow");
};

const prepareDOMEvents = () => {
	todoBtn.addEventListener("click", showToolsArea);
	addBtn.addEventListener("click", manageShowInputs);
	sortBtn.addEventListener("click", manageSortingRows);
	//tableBody.addEventListener("click", checkClick);
	todoBox.addEventListener("click", checkClick);
	removeBtn.addEventListener("click", togglePopup);
	//table.addEventListener('change', paginate);
	previous.addEventListener("click", previousPage);
	next.addEventListener("click", nextPage);
	findBtn.addEventListener("click", toggleSearchEngine);
	searchEngine.addEventListener("keyup", manageSearchEngine);
	confirmBtn.addEventListener("click", removeAllTasks);
	cancelBtn.addEventListener("click", togglePopup);
	todoBtns.forEach(btn => {
		if (!btn.classList.contains("todo__header-btn--sort")) {
			btn.addEventListener("click", showButtonAnimation);
		}
	});
};

//----------------------------------
const rotateSortBtn = () => {
	sortBtn.classList.toggle("todo__rotate");
};
const showButtonAnimation = e => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		const animatedBtn = e.target.closest("button"); // kliknięty przycisk
		animatedBtn.classList.add("todo__resize"); // dodanie animacji do przycisku

		const duration = window
			.getComputedStyle(animatedBtn)
			.getPropertyValue("animation-duration"); //czas trwania animacji - musi byc taki sam jak czas opóźnienia setTimeout

		//SetTimeout zostanie wywołany po takim czasie w jakim został nadany transiiton na animacji
		setTimeout(() => {
			animatedBtn.classList.remove("todo__resize"); //usunięcie klasy po skończeniu animacji - aby na nowo mozna było ją dodać do odtworzenia animacji
		}, parseFloat(duration) * 1000);
	}
};

const addAnimation = () => {
	const completeBtns = document.getElementsByClassName(
		"todo__table-btn--complete"
	);

	//Dodanie animacji do wszystkich przycisków
	for (const completeBtn of completeBtns) {
		completeBtn.addEventListener("click", showButtonAnimation);
	}
};
//Wysuń wyszukiwarkę
const toggleSearchEngine = () => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		const activePageNumber = newPageNumber || dataPageNumber;
		searchEngineBox.classList.toggle("todo__search-area-box-show");
		searchEngine.value = "";
		//Wróc do wyświetlanej strony przed wyszukiwaniem (jeśli w inpucie nie ma tekstu)
		showAllPages();
		//Jeśli input zostanie schowany to ustaw poprzednią strone (przed wyszukiwaniem) oraz ustaw aktywną stronę
		if (!searchEngineBox.classList.contains("todo__search-area-box-show")) {
			selectPage(activePageNumber);
			setActivePages();
		}
	}
};
//Funkcja, która wysuwa wszystkie przyciski
const showToolsArea = () => {
	[leftToolArea, rightToolArea].forEach(toolArea =>
		toolArea.classList.toggle("todo__header-btns-show")
	);
	todoBtn.classList.toggle("todo__header-btn-stop-animation");
};

//Funkcja, która uniemożliwia kliknięcie przycisku previous, next
const disabledButtons = () => {
	const pageNumberItems = document.querySelectorAll(
		"[data-page-number]:not(.todo__pagination-list-item-hide)"
	);
	const firstPageNumberItem = pageNumberItems[0];
	const lastPageNumberItem = pageNumberItems[pageNumberItems.length - 1];

	//Wyłącz atrybut disabled dla przycisków jeśli przycisk go posiada
	[previous, next].forEach(btn => {
		if (btn.hasAttribute("disabled")) {
			btn.removeAttribute("disabled");
		}
	});

	//Jeśli aktywna jest 1 strona lub ostatnia to zablokuj dalsze przesuwanie atrybutem disabled
	if (pageNumberItems.length > 1) {
		if (
			firstPageNumberItem.classList.contains(
				"todo__pagination-list-item-active"
			)
		) {
			previous.setAttribute("disabled", "");
		} else if (
			lastPageNumberItem.classList.contains("todo__pagination-list-item-active")
		) {
			next.setAttribute("disabled", "");
		}
	} else {
		previous.setAttribute("disabled", "");
		next.setAttribute("disabled", "");
	}
};

//Funkcja, która służy do wyświetlania aktualnej daty
const setDate = () => {
	const date = new Date();
	const currentYear = date.getFullYear();
	const currentMonth = date.getMonth();
	const currentDay = date.getDate();
	const currentDate = `${currentDay} ${selectMonth(
		currentMonth
	)} ${currentYear}`;
	return currentDate;
};

//Funkcja, która sprawdza długość tekstu (imię, nazwisko i zadanie)
const checkLength = (text, min, max) => {
	let result;

	if (text) {
		if (text.length < min || text.length > max) {
			result = false;
		} else {
			result = true;
		}
	}

	return result;
};

//Sprawdzamy czy argumenty nie są puste - jeśli nie są to zwracamy wartość true (Funkcja używana jest do sprawdzenia czy inputy dla zadan nie są puste)
const checkExistance = (...agrs) => {
	let result;
	if (agrs.some(arg => !arg)) {
		result = false;
	} else {
		result = true;
	}

	return result;
};

const showInputs = () => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		const currentDate = setDate();
		const tableRow = document.createElement("tr");
		newPageNumber = null;
		isSorting = false;
		selectPage(dataPageNumber); //Pokaz inputa na ostatniej stronie

		tableRow.classList.add("todo__table-row-inputs");
		//<div class="todo__table-cell-name-box"><img src="/img/woman1.png" alt="" class="todo__table-cell-img"><p>Adam Nowak</p></div>
		tableRow.innerHTML = `<tr class="todo__table-row-inputs">
		<td class="todo__table-cell-name todo__table-input-name">
	 <div class="todo__table-cell-name-box"><img src="/img/question-mark.png" alt="" class="todo__table-cell-img">
		<input type="text">
		<p class="todo__error-name">Podaj imię i nazwisko</p>
		</div>
		</td>
		<td class="todo__table-input-task">
			<input type="text">
			<p class="todo__error-task">Podaj zadanie</p>
		</td>
		<td class="todo__table-input-date">${currentDate}</td>
		<td class="todo__table-input-priority">
			<select name="priority" id="priority">
				<option value="low">Niski</option>
				<option value="medium">Średni</option>
				<option value="high">Wysoki</option>
			</select>
		</td>
		<td class="todo__table-cell-input-tools">
			<button class="todo__table-btn todo__table-btn--add"><i class="fa-solid fa-check" aria-hidden="true"></i></button>
			<button class="todo__table-btn todo__table-btn--remove"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
		</td></tr>`;

		tableBody.append(tableRow);
	}
};

const addTask = () => {
	const tableRow = document.querySelector(".todo__table-row-inputs"); //obrazek i input

	//Kontenery z inputami lub przyciskami
	const inputNameBox = document.querySelector(".todo__table-input-name"); //obrazek i input
	const inputTaskBox = document.querySelector(".todo__table-input-task");
	const priorityBox = document.querySelector(".todo__table-input-priority");
	const prioritySelect = document.getElementById("priority");
	const dateBox = document.querySelector(".todo__table-input-date");
	const actionBox = document.querySelector(".todo__table-cell-input-tools");

	//Inputy - potrzebne do pobrania z nich tekstu
	const img = inputNameBox.querySelector("img");
	const inputName = inputNameBox.querySelector("input");
	const inputTask = inputTaskBox.querySelector("input");
	const priorityIndex = prioritySelect.selectedIndex;
	const priorityValue = prioritySelect.value; //Wybrana wartość z elementu select
	const prorityName = prioritySelect.options[prioritySelect.selectedIndex].text;

	const splitName = inputName.value.split(" "); //Imię i nazwisko
	const firstName = splitName[0]; //Imię
	const lastName = splitName[1]; //Nazwisko

	//Error message
	const errorName = document.querySelector(".todo__error-name");
	const errorTask = document.querySelector(".todo__error-task");

	//Zmienne do instrukcji warunkowej
	const isExistInputsValue = checkExistance(
		firstName,
		lastName,
		inputTask.value,
		prorityName
	); // Sprawdzamy czy wszystkie pola istnieją
	const nameLength =
		checkLength(firstName, 3, 12) && checkLength(lastName, 2, 12); // Minimalna i maksymalna ilośc znaków dla imienia i nazwiska
	const taskLength = checkLength(inputTask.value, 10, 20); // Minimalna i maksymalna ilośc znaków dla zadania

	//Podmiana inputa na tekst (który został wprowadzony z inputa) - znikają wtedy inputy
	if (isExistInputsValue && nameLength && taskLength) {
		const firstLetterOfFirstName = firstName.charAt(0); //Pierwsza litera imienia
		const firstLetterofLastName = lastName.charAt(0); //Pierwsza litera imienia
		const lastLetterOfName = firstName.charAt(firstName.length - 1); // Ostatnia litera imienia - do określenia czy osoba jest osobą czy kobietą

		const firstLetterOfTask = inputTask.value.charAt(0);

		const capitalizeName =
			firstLetterOfFirstName.toUpperCase() +
			firstName.slice(1).toLowerCase() +
			" " +
			firstLetterofLastName.toUpperCase() +
			lastName.slice(1).toLowerCase(); // Imię i nazwisko pisane dużymi literami
		const capitalizeTask =
			firstLetterOfTask.toUpperCase() + inputTask.value.slice(1).toLowerCase(); // Zadanie pisane dużą literą

		//Usuń pola z errorami
		errorName.remove();
		errorTask.remove();

		//Inicjalizacja danych z inputów
		inputName.outerHTML = `<p>${capitalizeName}</p>`;
		inputTask.outerHTML = capitalizeTask;
		prioritySelect.outerHTML = `<td class="todo__table-cell-priority"><button class="todo__btn todo__btn--${priorityValue}" data-priority="${priorityValue}" data-priority-number="${priorityIndex}">${prorityName}</button></td>`;
		actionBox.outerHTML = `<td class="todo__table-cell-tools">
        <button class="todo__table-btn todo__table-btn--complete"><i class="fa-solid fa-check"></i></button>
        <button class="todo__table-btn todo__table-btn--edit"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="todo__table-btn todo__table-btn--remove"><i class="fa-regular fa-trash-can"></i></button>
        </td>`; //dodanie przyciskow

		//zmiana klas
		tableRow.className = "todo__table-row";
		inputNameBox.className = "todo__table-cell-name";
		inputTaskBox.className = "todo__table-cell-task";
		dateBox.className = "todo__table-cell-date";
		priorityBox.className = "todo__table-cell-priority";

		//Sprawdzenie czy zostało wprowadzone imię męskie czy imię damskie
		if (lastLetterOfName === "a") {
			img.src = `/img/woman${womanNumber}.png`;
		} else {
			img.src = `/img/man${manNumber}.png`;
		}
		//Sprawdzanie czy nie została przekroczona ilośc obrazków - jeśli tak to umieszczamy je od początku dla każdej osoby
		if (manNumber < 10) {
			manNumber++;
		} else {
			manNumber = 1;
		}

		if (womanNumber < 10) {
			womanNumber++;
		} else {
			womanNumber = 1;
		}

		addAnimation();
	} else {
		errorName.classList.toggle("todo__error-task-show", !nameLength);
		errorTask.classList.toggle("todo__error-task-show", !taskLength);
	}
	//https://www.freakyjolly.com/how-to-get-selected-value-in-dropdown-list-using-jquery-javascript/
};

//Funkcja, która wyświetla wszystkie stworzone strony (ukryte przez wyszukiwarkę) - potrzebna do wywołania funkcji showInputs
const showAllPages = () => {
	const pageNumberItems = document.querySelectorAll("[data-page-number]");
	pageNumberItems.forEach(pageNumberItem => {
		if (pageNumberItem.classList.contains("todo__pagination-list-item-hide")) {
			pageNumberItem.classList.remove("todo__pagination-list-item-hide");
		}
	});
};

//Funkcja zarządzająca wyświetlaniem inputów do wprowadzenia zadania
const manageShowInputs = () => {
	// Wyczyść wyszukiwarkę (jeśli znajduje się w niej tekst)
	if (searchEngine.value) {
		searchEngine.value = "";
	}

	if (searchEngineBox.classList.contains("todo__search-area-box-show")) {
		toggleSearchEngine();
	}
	showAllPages(); //Pokaż wszystkie dostępne strony - jeśli zostały ukryte przez wyszukiwarkę względem ilości wyszukanych osób
	showInputs(); //Pokaz pola do wprowadzenia nazwy zadania przez daną osobę
	//showAllPages(); //Pokaż wszystkie dostępne strony - jeśli zostały ukryte przez wyszukiwarkę względem ilości wyszukanych osób
};

//Funkcja, tworzy inputy i pobiera do nich dane z wiersza (do edycji w kolejnej funkcji)
const getDataToEdit = tableRow => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		//td
		const nameBox = tableRow.querySelector(".todo__table-cell-name");
		const taskBox = tableRow.querySelector(".todo__table-cell-task");
		const priorityBox = tableRow.querySelector(".todo__table-cell-priority");
		const actionBox = tableRow.querySelector(".todo__table-cell-tools");
		const dateBox = tableRow.querySelector(".todo__table-cell-date");
		const priorityBtn = priorityBox.querySelector("button");

		const name = nameBox.textContent; //Imię i nazwisko
		const task = taskBox.textContent; //Nazwa zadania
		oldName = name; // Zmienna globalna służąca do zapamiętania starego imienia i nazwiska (do edycji)
		//obrazek
		const img = nameBox.querySelector("img");
		imgSrc = img.getAttribute("src"); //zmienna globalna służaca do ustalenia obrazka
		oldTableRow = tableRow.innerHTML;

		//Zamiana tekstu na inputy aby edytować zawartość
		// nameBox.innerHTML = `<img src="/img/question-mark.jpg" class="todo__table-cell-img"><input type="text" value="${name}">`;
		nameBox.innerHTML = `<div class="todo__table-cell-name-box"><img src="/img/question-mark.png" alt="" class="todo__table-cell-img"><input type="text" value="${name.trim()}"><p class="todo__error-name">Podaj imię i nazwisko</p></div>`;
		taskBox.innerHTML = `<input type="text" value="${task.trim()}"><p class="todo__error-task">Podaj zadanie</p>`;
		priorityBox.innerHTML = `<select name="priority" id="priority">
    	<option value="low">Niski</option>
    	<option value="medium">Średni</option>
    	<option value="high">Wysoki</option>
    	</select>`;
		actionBox.innerHTML = ` <button class="todo__table-btn todo__table-btn--save"><i class="fa-solid fa-check"></i></button>
    	<button class="todo__table-btn todo__table-btn--cancel"><i class="fa-solid fa-xmark"></i></button>`;

		tableRow.className = "todo__table-row-inputs";
		const prioritySelect = priorityBox.querySelector("select");
		prioritySelect.value = priorityBtn.dataset.priority; //Ustawienie takiego samego priorytetu jak przed edycją

		//Zmiana klas
		nameBox.className = "todo__table-cell-name todo__table-input-name";
		taskBox.className = "todo__table-input-task";
		dateBox.className = "todo__table-input-date";
		priorityBox.className = "todo__table-input-priority";
		actionBox.className = "todo__table-cell-input-tools";
	}
};

const editTableRow = tableRow => {
	//td
	const nameBox = tableRow.querySelector(".todo__table-input-name"); //obrazek i input
	const taskBox = tableRow.querySelector(".todo__table-input-task");
	const priorityBox = document.querySelector(".todo__table-input-priority");
	const prioritySelect = document.getElementById("priority");
	const actionBox = tableRow.querySelector(".todo__table-cell-input-tools");
	const dateBox = tableRow.querySelector(".todo__table-input-date");
	const currentDate = setDate();

	//inputy
	const inputName = nameBox.querySelector("input");
	const inputTask = taskBox.querySelector("input");

	//Tekst z inputów
	const name = inputName.value;
	const task = inputTask.value;
	const priorityIndex = prioritySelect.selectedIndex;
	const priorityValue = prioritySelect.value; //Wybrana wartość z elementu select
	const prorityName = prioritySelect.options[prioritySelect.selectedIndex].text;

	const splitName = name.split(" "); //Imię i nazwisko
	const firstName = splitName[0]; //Imię
	const lastName = splitName[1]; //Nazwisko

	//Error message
	const errorName = document.querySelector(".todo__error-name");
	const errorTask = document.querySelector(".todo__error-task");

	//Zmienne do instrukcji warunkowej
	const isExistInputsValue = checkExistance(
		firstName,
		lastName,
		inputTask.value,
		prorityName
	); // Sprawdzamy czy wszystkie pola istnieją
	const nameLength =
		checkLength(firstName, 3, 12) && checkLength(lastName, 2, 12); // Minimalna i maksymalna ilośc znaków dla imienia i nazwiska
	const taskLength = checkLength(inputTask.value, 10, 20); // Minimalna i maksymalna ilośc znaków dla zadania

	//Podmiana inputa na tekst (który został wprowadzony z inputa) - znikają wtedy inputy
	if (isExistInputsValue && nameLength && taskLength) {
		const firstLetterOfFirstName = firstName.charAt(0); //Pierwsza litera imienia
		const firstLetterofLastName = lastName.charAt(0); //Pierwsza litera imienia
		const lastLetterOfName = firstName.charAt(firstName.length - 1); // Ostatnia litera imienia - do określenia czy osoba jest osobą czy kobietą

		const firstLetterOfTask = task.charAt(0);

		const capitalizeName =
			firstLetterOfFirstName.toUpperCase() +
			firstName.slice(1).toLowerCase() +
			" " +
			firstLetterofLastName.toUpperCase() +
			lastName.slice(1).toLowerCase(); // Imię i nazwisko pisane dużymi literami
		const capitalizeTask =
			firstLetterOfTask.toUpperCase() + task.slice(1).toLowerCase(); // Zadanie pisane dużą literą

		//Usuń pola z errorami
		errorName.remove();
		errorTask.remove();
		//Jeśli imię i nazwisko nie zostało zmienione to obrazek nie zostanie zmieniony
		//<td class="todo__table-cell-name todo__table-input-name"><div class="todo__table-cell-name-box"><img src="/img/woman1.png" alt="" class="todo__table-cell-img"><input type="text"></div></td>
		if (name === oldName) {
			//nameBox.innerHTML = `<img src="${imgSrc}" class="todo__table-cell-img">${capitalizeName}`;
			nameBox.innerHTML = `<div class="todo__table-cell-name-box"><img src="${imgSrc}" alt="" class="todo__table-cell-img"><p>${capitalizeName}</p></div>`;
		} else {
			//Sprawdzenie czy zostało wprowadzone imię męskie czy imię damskie
			if (lastLetterOfName === "a") {
				//nameBox.innerHTML = `<img src="/img/woman${womanNumber}.png" class="todo__table-cell-img">${capitalizeName}`;
				nameBox.innerHTML = `<div class="todo__table-cell-name-box"><img src="/img/woman${womanNumber}.png" alt="" class="todo__table-cell-img"><p>${capitalizeName}</p></div>`;
			} else {
				nameBox.innerHTML = `<div class="todo__table-cell-name-box"><img src="/img/man${manNumber}.png" alt="" class="todo__table-cell-img"><p>${capitalizeName}</p></div>`;
			}
		}

		//Sprawdzanie czy nie została przekroczona ilośc obrazków - jeśli tak to umieszczamy je od początku dla każdej osoby
		if (manNumber < 10) {
			manNumber++;
		} else {
			manNumber = 1;
		}

		if (womanNumber < 10) {
			womanNumber++;
		} else {
			womanNumber = 1;
		}

		dateBox.textContent = currentDate;
		taskBox.innerHTML = capitalizeTask;
		prioritySelect.outerHTML = `<td class="todo__table-cell-priority"><button class="todo__btn todo__btn--${priorityValue}" data-priority="${priorityValue}" data-priority-number="${priorityIndex}">${prorityName}</button></td>`;
		actionBox.outerHTML = `<td class="todo__table-cell-tools">
        <button class="todo__table-btn todo__table-btn--complete"><i class="fa-solid fa-check"></i></button>
        <button class="todo__table-btn todo__table-btn--edit"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="todo__table-btn todo__table-btn--remove"><i class="fa-regular fa-trash-can"></i></button>
        </td>`; //dodanie przyciskow

		//zmiana klas
		tableRow.className = "todo__table-row";
		nameBox.className = "todo__table-cell-name";
		taskBox.className = "todo__table-cell-task";
		dateBox.className = "todo__table-cell-date";
		priorityBox.className = "todo__table-cell-priority";

		addAnimation();
	} else {
		errorName.classList.toggle("todo__error-task-show", !nameLength);
		errorTask.classList.toggle("todo__error-task-show", !taskLength);
	}
};

//Funkcja, ktorą anuluje zmiany w momencie kiedu użytkownik anuluje edycję (chowanie inputów w edytowanym wierszu).
const cancelEditTableRow = tableRow => {
	tableRow.innerHTML = oldTableRow;
	tableRow.className = "todo__table-row";
};

const removeTask = tableRow => {
	if (
		!document.querySelector(".todo__table-row-inputs") ||
		tableRow.classList.contains("todo__table-row-inputs")
	) {
		tableRow.remove();
	}
};

const removeFirstPage = () => {
	const tableRows = document.querySelectorAll(".todo__table-row");
	const pageNumberItem = document.querySelector("[data-page-number='0']");

	if (tableRows.length === 0) {
		pageNumberItem.remove();
		dataPageNumber = -1;
		liPageNumber = 0;
	}
};

//Funkcja, która pokazuje / ukrywa popup - modal, który informuje o usunięciu wszystkich wierszy
const togglePopup = () => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		const allTableRows = document.querySelectorAll(".todo__table-row");
		if (allTableRows.length > 0) {
			popup.classList.toggle("popup-show");
			shadow.classList.toggle("shadow-show");
		}
	}
};

//Funkcja, która usuwa wszystkie wiersze
const removeAllTasks = () => {
	if (!document.querySelector(".todo__table-row-inputs")) {
		const pageNumberItems = document.querySelectorAll("[data-page-number]");
		const tasks = document.querySelectorAll(".todo__table-row");
		if (searchEngine.value) {
			toggleSearchEngine();
		}
		togglePopup();
		tasks.forEach(task => task.remove());
		pageNumberItems.forEach(pageNumberItem => {
			pageNumberItem.remove();
		});
		startNumber = 0;
		endNumber = paginateNumber;
		startPageNumer = 0;
		endPageNumber = paginateNumber;
		dataPageNumber = -1;
		liPageNumber = 0;
		disabledButtons();
		showNumberOfRows();
	}
};

const todoTask = (priorityBtn, priorityName, priorityBtnClasses) => {
	priorityBtn.className = priorityBtnClasses;
	priorityBtn.textContent = priorityName;
};

const completeTask = tableRow => {
	const tableRowCells = tableRow.querySelectorAll("td");
	const priorityBtn = tableRow.querySelector(".todo__btn");

	priorityBtn.classList.toggle("todo__btn--complete"); //Zakreśl przycisk
	//Zakreść wszystkie komórki prócz komórki z przyciskami akcji
	tableRowCells.forEach(tableRowCell => {
		if (!tableRowCell.classList.contains("todo__table-cell-tools")) {
			tableRowCell.classList.toggle("todo__btn--complete");
		}
	});
};

const selectMonth = monthNumber => {
	let currentMonth;

	switch (monthNumber) {
		case 0:
			currentMonth = "styczeń";
			break;
		case 1:
			currentMonth = "luty";
			break;
		case 2:
			currentMonth = "marzec";
			break;
		case 3:
			currentMonth = "kwiecień";
			break;
		case 4:
			currentMonth = "maj";
			break;
		case 5:
			currentMonth = "czerwiec";
			break;
		case 6:
			currentMonth = "lipiec";
			break;
		case 7:
			currentMonth = "sierpień";
			break;
		case 8:
			currentMonth = "wrzesień";
			break;
		case 9:
			currentMonth = "październik";
			break;
		case 10:
			currentMonth = "listopad";
			break;
		case 11:
			currentMonth = "grudzień";
			break;
	}
	return currentMonth;
};

//Pokaż ilość wszystkich wierszy w tabeli oraz ilość wyświetlanych wierszy na danej stronie
const showNumberOfRows = () => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	const tableRows = document.querySelectorAll(
		".todo__table-row:not(.todo__table-row-hide)"
	);
	paginationText.textContent = `Wyświetlono ${tableRows.length} z ${allTableRows.length} zadań`;
};

//Pokaż ilość wyszukanych wierszy w tabeli oraz ilość wyświetlanych wierszy na danej stronie
const showNumberOfSearchRows = () => {
	const peopleNames = document.querySelectorAll(".todo__table-cell-name");
	const displayedNames = document.querySelectorAll(
		".todo__table-row:not(.todo__table-row-hide)"
	);
	let names = [];
	peopleNames.forEach(personName => {
		if (personName.textContent.includes(searchEngine.value)) {
			names.push(personName);
		}
	});

	paginationText.textContent = `Wyświetlono ${displayedNames.length} z ${names.length} zadań`;
};

const manageShowingNumberOfRows = () => {
	if (!searchEngine.value) {
		showNumberOfRows();
	} else {
		showNumberOfSearchRows();
	}
};

//Obserwuj zmiany w tabeli - jeśli dojdzie do zmiany to wywołana zostanie funkcja (stronnicowanie)
const observeChanges = (element, callback) => {
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.type === "childList") {
				callback();
			}
		});
	});

	observer.observe(element, { childList: true });
};

const createPaginationNumber = () => {
	const paginationList = document.querySelector(".todo__pagination-list");
	const paginationListItem = document.createElement("li");
	const nextBtn = document.querySelector(".todo__pagination-list-item-next");
	const activePageNumberItem = document.querySelector(
		".todo__pagination-list-item-active"
	);
	const tableRows = document.querySelectorAll(".todo__table-row");

	let number = endNumber + 1;

	//activePageNumberItem.classList.remove('todo__pagination-list-item-active');
	dataPageNumber++;
	liPageNumber++; //Zwiekszamy przed dodaniem

	paginationListItem.classList.add("todo__pagination-list-item");
	paginationListItem.setAttribute(`data-page-number`, `${dataPageNumber}`);
	paginationListItem.textContent = `${liPageNumber}`;
	paginationList.insertBefore(paginationListItem, nextBtn); //Dodanie elementu do listy przed przyciskiem next
};

const removePageNumbers = () => {
	const activePageNumberItem = document.querySelector(
		`[data-page-number='${dataPageNumber}']`
	);
	activePageNumberItem.remove();

	dataPageNumber--;
	liPageNumber--;
};

const createActivePage = () => {
	if (!searchEngine.value) {
		const pageNumberItems = document.querySelectorAll(["[data-page-number]"]);
		let pageNumberToActive;
		if (newPageNumber && newPageNumber < dataPageNumber) {
			pageNumberToActive = newPageNumber || dataPageNumber;
		} else {
			pageNumberToActive = dataPageNumber;
		}
		const activePageNumberItem = document.querySelector(
			`[data-page-number='${pageNumberToActive}']`
		);

		pageNumberItems.forEach(pageNumberItem => {
			if (
				pageNumberItem.classList.contains("todo__pagination-list-item-active")
			) {
				pageNumberItem.classList.remove("todo__pagination-list-item-active");
			}
		});
		activePageNumberItem.classList.add("todo__pagination-list-item-active");
	}
};

//Dodaj pierszą stronę
const createFirstPage = () => {
	const pageNumberItems = document.querySelectorAll(["[data-page-number]"]);
	if (pageNumberItems.length === 0) {
		createPaginationNumber();
		setActivePages();
	}
};

// Funkcja zwrotna, która zostanie wywołana po dodaniu nowego wiersza do tabeli
const paginate = () => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	const tableRows = document.querySelectorAll(
		".todo__table-row:not(.todo__table-row-hide)"
	);
	let number = endNumber + 1;
	const activePageNumberItem = document.querySelector(
		`[data-page-number='${dataPageNumber}']`
	);

	if (allTableRows.length > 0) {
		//Jeśli jest więcej wierszy od ustalonego stronnicowania to warunek zostaje spełniony i wiersze zostaną ukryte (tworzymy następną stronę z wierszami)
		if (allTableRows.length > endNumber && !isSorting) {
			for (let i = startNumber; i <= endNumber; i++) {
				allTableRows[i].classList.add("todo__table-row-hide");
			}

			startNumber = allTableRows.length;
			endNumber = startNumber + paginateNumber;
			//createPaginationNumber();
			createPaginationNumber();
			createActivePage();
			clickedPage = false;
		} else if (allTableRows.length === startNumber) {
			//Jeśli na liście został usunięty ostatni wiersz to wracamy do poprzedniej strony
			startNumber = startNumber - paginateNumber - 1;
			endNumber = endNumber - paginateNumber - 1;
			//tableRows.length === 0
			if (
				activePageNumberItem.classList.contains(
					"todo__pagination-list-item-active"
				)
			) {
				allTableRows.forEach(tableRow => {
					tableRow.classList.add("todo__table-row-hide");
				}); // Ukryj wszystkie wiersze

				for (let i = startNumber; i <= endNumber; i++) {
					allTableRows[i].classList.remove("todo__table-row-hide");
				}
			}

			//selectPage(newPageNumber);
			removePageNumbers();
			clickedPage = false;
			// removePageNumber();
			//removePaginationNumber();
		}
		manageShowingNumberOfRows();
		createActivePage();
		disabledButtons();
	}
};

//Funkcja, która służy do wybrania numeru strony po kliknięciu numeru i wyświetlenia konkretnej listy wierszy
const selectPage = pageNumber => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	const tableRows = document.querySelectorAll(
		".todo__table-row:not(.todo__table-row-hide)"
	);
	startPageNumer = pageNumber * (paginateNumber + 1);
	endPageNumber = startPageNumer + paginateNumber;

	allTableRows.forEach(tableRow => {
		tableRow.classList.add("todo__table-row-hide");
	}); // Ukryj wszystkie wiersze

	for (let i = startPageNumer; i <= endPageNumber; i++) {
		//Warunek, który sprawdza czy wiersz istnieje (usuwamy klase z elementów, które istnieja).
		if (allTableRows[i]) {
			allTableRows[i].classList.remove("todo__table-row-hide");
		}
	} //Pokaz wybrane wiersze
};

//Funkcja, która usuwa aktywny numer (jeśli istnieje)
const resetActivePageItem = () => {
	const activePageNumberItem = document.querySelector(
		".todo__pagination-list-item-active"
	);
	if (activePageNumberItem) {
		activePageNumberItem.classList.remove("todo__pagination-list-item-active");
	}
};

//Pobierz numer z listy aby wyświetlić daną stronę
const displayClickedPage = pageNumber => {
	const inputRow = document.querySelector(".todo__table-row-inputs");
	if (!inputRow) {
		resetActivePageItem();
		const pageNumberItem = document.querySelector(
			`[data-page-number='${pageNumber}']`
		);
		pageNumberItem.classList.add("todo__pagination-list-item-active"); //aktywny li - dodanie koloru
		if (!searchEngine.value) {
			selectPage(pageNumber);
		} else {
			findPerson(...[, pageNumber]);
		}
		clickedPage = true;
		if (!searchEngine.value) {
			newPageNumber = pageNumber;
		}
	}
};

//Poprzednia strona
const previousPage = () => {
	const activePageNumberItem = document.querySelector(
		".todo__pagination-list-item-active"
	);
	const activeNumber = activePageNumberItem.dataset.pageNumber;

	if (activeNumber > 0) {
		const previousPageNumber = parseInt(activeNumber) - 1;
		//newPageNumber = previousPageNumber.toString();
		resetActivePageItem();
		const previousPageNumberItem = document.querySelector(
			`[data-page-number='${previousPageNumber}']`
		);
		previousPageNumberItem.classList.add("todo__pagination-list-item-active");
		if (!searchEngine.value) {
			newPageNumber = previousPageNumber.toString();
			selectPage(previousPageNumber);
		} else {
			findPerson(...[, previousPageNumber]);
		}
	}
	disabledButtons();
	manageShowingNumberOfRows();
};

//Następna strona
const nextPage = () => {
	const paginationListItem = document.querySelectorAll(
		"[data-page-number]:not(.todo__pagination-list-item-hide)"
	);
	const activePageNumberItem = document.querySelector(
		".todo__pagination-list-item-active"
	);
	const activeNumber = activePageNumberItem.dataset.pageNumber;

	if (activeNumber < paginationListItem.length - 1) {
		const nextPageNumber = parseInt(activeNumber) + 1;
		//newPageNumber = nextPageNumber.toString();
		resetActivePageItem();
		const nextPageNumberItem = document.querySelector(
			`[data-page-number='${nextPageNumber}']`
		);
		nextPageNumberItem.classList.add("todo__pagination-list-item-active");
		if (!searchEngine.value) {
			newPageNumber = nextPageNumber.toString();
			selectPage(nextPageNumber);
		} else {
			findPerson(...[, nextPageNumber]);
		}
	}
	disabledButtons();
	manageShowingNumberOfRows();
};

//Funkcja, która umożłiwia soerowanie rosnąco, za pomocą funkcji sort (należy zwrócić wynik odejmowania do funkcji sort)
const sortAscendingNumber = (a, b) => {
	return a - b;
	//Sprawdzany w funkcji warunek a – b zwraca wartość mniejszą od 0, gdy a jest mniejsze od b oraz wartość większą od 0 w przeciwnym wypadku
};

//Funkcja, która umożłiwia soerowanie malejąco, za pomocą funkcji sort (należy zwrócić wynik odejmowania do funkcji sort)
const sortDescendingNumber = (a, b) => {
	return b - a;
};

const orderRows = () => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	const priorityBtns = document.querySelectorAll(".todo__btn");
	const tbody = document.querySelector("tbody");
	const activePageNumberItem = document.querySelector(
		".todo__pagination-list-item-active"
	);
	const activePageNumber = activePageNumberItem.dataset.pageNumber;

	let priorityNumbers = [];
	let sortPriorityNumbers = [];
	let uniqueSortPriorityNumbers;
	let tableRows;
	//
	//Wprowadzenie do tabelki wszystkich numerów dla trzech priorytetow (0,1,2) - niski, średni, wysoki.
	priorityBtns.forEach(priorityBtn => {
		const priorityNumber = priorityBtn.dataset.priorityNumber;
		priorityNumbers.push(priorityNumber);
	});
	sortPriorityNumbers = priorityNumbers.slice(); //Sortowanie numerow
	if (!sortBtn.classList.contains("todo__rotate")) {
		sortPriorityNumbers.sort(sortAscendingNumber);
	} else {
		sortPriorityNumbers.sort(sortDescendingNumber);
	}

	isSorting = true;
	// Posortowana tablica zawiera wszystkie numery dla priorytetow. Należy usunać wszystkie numery, które powtarzają się aby sprawdzić te numery z nieposortowaną tablicą aby nie sprawdzić 2 razy tego samego.
	uniqueSortPriorityNumbers = sortPriorityNumbers.filter(
		(uniqueNumber, index) => {
			return sortPriorityNumbers.indexOf(uniqueNumber) === index;
		}
	);
	//Dodawanie do zmiennej wiersze, które zaczynają się od początkowego priorytetu (sortuj rosnąco)

	uniqueSortPriorityNumbers.forEach(uniqueSortPriorityNumber => {
		allTableRows.forEach(tableRow => {
			const priorityBtn = tableRow.querySelector(".todo__btn");
			const priorityNumber = priorityBtn.dataset.priorityNumber;
			if (uniqueSortPriorityNumber == priorityNumber) {
				if (tableRows) {
					tableRows = tableRows + tableRow.outerHTML;
				} else {
					tableRows = tableRow.outerHTML;
				}
			}
		});
	});

	tbody.innerHTML = tableRows;

	if (!searchEngine.value) {
		selectPage(activePageNumber);
	} else {
		findPerson(...[, newActivePage]);
	}
};

//Funkcja, która uruchamia funkcje do sortowania wierszy oraz obracania przycisku sortowania.
const manageSortingRows = () => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	if (
		!document.querySelector(".todo__table-row-inputs") &&
		allTableRows.length > 0
	) {
		orderRows();
		rotateSortBtn();
		manageShowingNumberOfRows();
	}
};

//let activePage;

//Funkcja, która wyszukuje daną osobę
const findPerson = (e, personPageNumber) => {
	const allTableRows = document.querySelectorAll(".todo__table-row");
	let startPersonPageNumber;
	let endPersonPageNumber;

	allTableRows.forEach(tableRow => {
		tableRow.classList.add("todo__table-row-hide");
	}); // Ukryj wszystkie wiersze

	//Wyszukaj
	allTableRows.forEach(tableRow => {
		const name = tableRow.querySelector(
			".todo__table-cell-name-box"
		).textContent;

		if (name.includes(searchEngine.value)) {
			tableRow.classList.add("todo__table-row-found");
		} else {
			tableRow.classList.remove("todo__table-row-found");
		}
	});
	//paginacja
	const foundTableRows = document.querySelectorAll(".todo__table-row-found"); //Znalezione wiersze przez użytkownika

	startPersonPageNumber = personPageNumber * (paginateNumber + 1);
	endPersonPageNumber = startPersonPageNumber + paginateNumber;

	newActivePage = personPageNumber;

	//Pokaż dany przedział po wyszukaniu
	for (let i = startPersonPageNumber; i <= endPersonPageNumber; i++) {
		if (foundTableRows[i]) {
			//Sprawdź czy taki element istnieje (może być mniej wyszukanych elementów niz liczba - endPersonPageNumber)
			foundTableRows[i].classList.remove("todo__table-row-hide");
		}
	}

	//activePageAfterSearching = ((endPersonPageNumber + 1) / (paginateNumber + 1) - 1);
};

//Funkcja, która ustala ilość stron dla wyszukanych osób
const hidePages = () => {
	const foundTableRows = document.querySelectorAll(".todo__table-row-found");
	const pageNumberItems = document.querySelectorAll(["[data-page-number]"]);

	let number = foundTableRows.length / (paginateNumber + 1);
	let numberOfPages = Math.ceil(number) - 1;

	pageNumberItems.forEach(pageNumberItem => {
		pageNumberItem.classList.add("todo__pagination-list-item-hide");
	});

	for (let i = 0; i <= numberOfPages; i++) {
		pageNumberItems[i].classList.remove("todo__pagination-list-item-hide");
	}
};

//Stara funkcja - podczas podmeiniania tekstu za pomocą ctrl + v dochodzilo do momentu kiedy input zawsze miał jakąś wartość więc dochodzilo do aktywacji dwóch numerów.

//Funkcja, która ustawia aktywną stronę gdy wyszukujemy osobę oraz gdy kończymy wyszukiwanie ustala stronę, która była wczensiej ustawiona
// const setActivePages = () => {
// 	const activePageNumber = newPageNumber || dataPageNumber;
// 	const activePageNumberItem = document.querySelector([
// 		`[data-page-number='${activePageNumber}']`,
// 	]);
// 	const pageNumberItemToActive = document.querySelector([
// 		`[data-page-number='${newActivePage}']`,
// 	]);

// 	if (activePageNumber != newActivePage) {
// 		if (searchEngine.value) {
// 			pageNumberItemToActive.classList.add("todo__pagination-list-item-active");
// 			activePageNumberItem.classList.remove(
// 				"todo__pagination-list-item-active"
// 			);
// 		} else {
// 			pageNumberItemToActive.classList.remove(
// 				"todo__pagination-list-item-active"
// 			);
// 			activePageNumberItem.classList.add("todo__pagination-list-item-active");
// 		}
// 	}

// 	//Wróc do wyświetlanej strony przed wyszukiwaniem (jeśli w inpucie nie ma tekstu)
// 	if (!searchEngine.value) {
// 		selectPage(activePageNumber);
// 	}
// };

//Funkcja, która ustawia aktywną stronę gdy wyszukujemy osobę oraz gdy kończymy wyszukiwanie ustala stronę, która była wczensiej ustawiona
// const setActivePages = () => {
// 	const pageNumberItems = document.querySelectorAll('[data-page-number]');
// 	const activePageNumber = newPageNumber || dataPageNumber;
// 	const activePageNumberItem = document.querySelector(`[data-page-number='${activePageNumber}']`)

// 	const pageNumberItemToActive = document.querySelector(`[data-page-number='${newActivePage}']`);

// 	//Usuń aktywny numer - jeśli istnieje
// 	pageNumberItems.forEach(pageNumberItem => {
// 		if(pageNumberItem.classList.contains('todo__pagination-list-item-active')){
// 			pageNumberItem.classList.remove('todo__pagination-list-item-active')
// 		}
// 	})

// 	//Dodaj aktywny numer dla wyszukiwania oraz w momencie kiedy użytkownik zakończy wyszukiwanie
// 	if(searchEngine.value){
// 		pageNumberItemToActive.classList.add('todo__pagination-list-item-active');
// 	}else{
// 		activePageNumberItem.classList.add('todo__pagination-list-item-active');
// 	}

// 	//Wróc do wyświetlanej strony przed wyszukiwaniem (jeśli w inpucie nie ma tekstu)
// 	if (!searchEngine.value) {
// 		selectPage(activePageNumber);
// 	}
// }

const setActivePages = activePage => {
	const pageNumberToActive = activePage || newActivePage;
	const pageNumberItems = document.querySelectorAll("[data-page-number]");

	//Jeżeli aktywny numer przed wyszukiwaniem jest większy od ostatniego numeru to znaczy że nie istnieje.
	//Po usunięciu tekstu nie wrocimy do strony przed wyszukiwaniem bo jej nie ma
	//Dlatego ustawiamy ostatni wiersz po usunięciu tekstu z inputa
	if (pageNumberItems.length > 0) {
		const lastPageNumber =
			pageNumberItems[pageNumberItems.length - 1].dataset.pageNumber;
		let activePageNumber = newPageNumber || dataPageNumber;
		if (activePageNumber > lastPageNumber) {
			activePageNumber = lastPageNumber;
		}
		const activePageNumberItem = document.querySelector(
			`[data-page-number='${activePageNumber}']`
		);

		const pageNumberItemToActive = document.querySelector(
			`[data-page-number='${pageNumberToActive}']`
		);
		//Usuń aktywny numer - jeśli istnieje
		pageNumberItems.forEach(pageNumberItem => {
			if (
				pageNumberItem.classList.contains("todo__pagination-list-item-active")
			) {
				pageNumberItem.classList.remove("todo__pagination-list-item-active");
			}
		});

		if (searchEngine.value) {
			pageNumberItemToActive.classList.add("todo__pagination-list-item-active");
		} else {
			activePageNumberItem.classList.add("todo__pagination-list-item-active");
		}

		//Wróc do wyświetlanej strony przed wyszukiwaniem (jeśli w inpucie nie ma tekstu)
		if (!searchEngine.value) {
			selectPage(activePageNumber);
		}
	}
};

//Ustaw stronę oraz aktywną stronę po usunięciu wiersza w tabeli
const setPreviousPage = () => {
	const pageNumberItem = document.querySelectorAll(
		"[data-page-number]:not(.todo__pagination-list-item-hide)"
	);
	const activePage = pageNumberItem[pageNumberItem.length - 1];
	if (activePage) {
		const activeNumber = activePage.dataset.pageNumber;
		if (newActivePage < activeNumber) {
			findPerson(...[, newActivePage]);
			setActivePages(newActivePage);
		} else {
			findPerson(...[, activeNumber]);
			setActivePages(activeNumber);
		}
	}
};

//Funkcja, która zarządza wyszukiwarką (wyszukuje daną osobę, ustala ilość stron względem wyszukanych osób oraz aktywną stronę)
const manageSearchEngine = () => {
	findPerson(...[, newActivePage]);
	setActivePages();
	hidePages();
	disabledButtons();
	showNumberOfSearchRows();
	newActivePage = 0; //Wroc do pierwszej strony po każdej zmianie w wyszukiwarce
};

const checkClick = e => {
	const tableRow = e.target.closest("tr");

	if (e.target.closest(".todo__table-btn--add")) {
		addTask();
		if (!document.querySelector(".todo__table-row-inputs")) {
			createFirstPage();
			showNumberOfRows();
		}
	} else if (
		e.target.closest(".todo__table-btn--edit") &&
		!tableRow.querySelector("td").classList.contains("todo__btn--complete")
	) {
		getDataToEdit(tableRow);
	} else if (e.target.closest(".todo__table-btn--save")) {
		editTableRow(tableRow);
	} else if (e.target.closest(".todo__table-btn--cancel")) {
		cancelEditTableRow(tableRow);
	} else if (e.target.closest(".todo__table-btn--remove")) {
		const activePageNumberItem = document.querySelector(
			".todo__pagination-list-item-active"
		);
		removeTask(tableRow);
		removeFirstPage();
		//removePageNumber();
		manageShowingNumberOfRows();

		const pageNumberItems = document.querySelectorAll("[data-page-number]");
		if (pageNumberItems.length != 0) {
			const lastPageNumber =
				pageNumberItems[pageNumberItems.length - 1].dataset.pageNumber;
			const activePageNumber = activePageNumberItem.dataset.pageNumber;
			let pageNumberToSelect = newPageNumber || activePageNumber;
			//Jeżeli aktywny numer przed wyszukiwaniem jest większy od ostatniego numeru to znaczy że nie istnieje.
			//Po usunięciu tekstu nie wrocimy do strony przed wyszukiwaniem bo jej nie ma
			//Dlatego ustawiamy ostatni wiersz po usunięciu tekstu z inputa
			if (pageNumberToSelect > lastPageNumber) {
				pageNumberToSelect = lastPageNumber;
			}
			if (!searchEngine.value) {
				selectPage(pageNumberToSelect); //Ustaw odpowiednia stronę po usunięciu wiersza (niezbędne w momencie gdy użytkownik usuwa wiersz, ktory nie jest na ostatniej stronie)
				showAllPages();
			} else {
				//findPerson(...[, newActivePage]);

				//setActivePages();
				hidePages();
				setPreviousPage();
				showNumberOfSearchRows();
			}
		}
	} else if (e.target.closest("[data-page-number]")) {
		const clickedPageNumber = e.target.dataset.pageNumber;
		displayClickedPage(clickedPageNumber);
		//Pokaz ilośc wierszy
		manageShowingNumberOfRows();
		disabledButtons();
	} else if (e.target.closest(".todo__table-btn--complete")) {
		completeTask(tableRow);
	}
};

document.addEventListener("DOMContentLoaded", main);
