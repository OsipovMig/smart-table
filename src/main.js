import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const { data, ...indexes } = initData(sourceData);

/**
 * Сбор данных из полей (поиск, фильтры, пагинация)
 */
function collectState() {
  const formData = new FormData(sampleTable.container);
  const state = processFormData(formData);

  // ПРИНУДИТЕЛЬНОЕ ПРИВЕДЕНИЕ ТИПОВ ДЛЯ АВТОТЕСТОВ
  return {
    ...state,
    // Превращаем строки в числа, чтобы сравнение 4657.56 >= 5000 работало математически
    totalFrom: state.totalFrom ? parseFloat(state.totalFrom) : 0,
    totalTo: state.totalTo ? parseFloat(state.totalTo) : Infinity,
    rowsPerPage: parseInt(state.rowsPerPage || 10),
    page: parseInt(state.page ?? 1)
  };
}

/**
 * Перерисовка состояния таблицы
 */
function render(action) {
  const state = collectState(); 
  let result = [...data];

  // СТРОГИЙ ПОРЯДОК: Поиск -> Фильтр -> Сортировка -> Пагинация
  result = applySearch(result, state, action);
  result = applyFiltering(result, state, action);
  result = applySorting(result, state, action);
  result = applyPagination(result, state, action);

  sampleTable.render(result);
}

// Инициализация таблицы
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render
);

// Инициализация модулей
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
  }
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

// Добавление в DOM
const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
}

// Первый запуск
render();
