import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const { data, ...indexes } = initData(sourceData);

// 1. Сначала определяем вспомогательные функции
function collectState() {
  const formData = new FormData(sampleTable.container);
  const state = processFormData(formData);

  return {
    ...state,
    // ОБЯЗАТЕЛЬНО: преобразуем в числа через parseFloat
    totalFrom: state.totalFrom ? parseFloat(state.totalFrom) : 0,
    totalTo: state.totalTo ? parseFloat(state.totalTo) : Infinity,
    
    rowsPerPage: parseInt(state.rowsPerPage || 10),
    page: parseInt(state.page ?? 1),
  };
}


function render(action) {
  const state = collectState(); 
  let result = [...data];

  // Вызываем модули в строгом порядке
  result = applySearch(result, state, action);
  result = applyFiltering(result, state, action);
  result = applySorting(result, state, action);
  result = applyPagination(result, state, action);

  sampleTable.render(result);
}

// 2. Инициализируем таблицу
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

// 3. Инициализируем модули (ОБЯЗАТЕЛЬНО ПОСЛЕ initTable)
const applySearch = initSearching("search");

const applyPagination = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

// 4. Запуск
const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
}

// Первый запуск
render();
