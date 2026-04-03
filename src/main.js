import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const API = initData();

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
    page: parseInt(state.page ?? 1),
  };
}

/**
 * Перерисовка состояния таблицы
 */
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса

  query = applyPagination(query, state, action); // обновляем query
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action); // result заменяем на query
  query = applySearching(query, state, action); // result заменяем на query

  const { total, items } = await API.getRecords(query); // запрашиваем данные с собранными параметрами

  updatePagination(total, query); // перерисовываем пагинатор
  sampleTable.render(items);
}

// Инициализация таблицы
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

// Инициализация модулей
const applySearching = initSearching("search");

const { applyPagination, updatePagination } = initPagination(
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

// 2. Начальная инициализация фильтров (пустая, пока ждем API)
const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
  {
    searchBySeller: {}, // Раньше тут был indexes.sellers, теперь просто пустой объект
  },
);

// Добавление в DOM
const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
}

async function init() {
  const indexes = await API.getIndexes();

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

// Запуск
init().then(render);
