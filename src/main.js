import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js"; // <-- Импорт уже на месте

// 1. Инициализация исходных данных
const { data, ...indexes } = initData(sourceData);

/**
 * 2. Инициализация таблицы
 */
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"], // <-- 'search' уже в списке
    after: ["pagination"],
  },
  render,
);

/**
 * 3. Инициализация модулей расширения
 */

// === NEW: Инициализация поиска ===
// Передаем 'search', так как это имя поля в HTML-шаблоне
const applySearch = initSearching("search");

// Настройка пагинации
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

// Настройка сортировки
const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// Настройка фильтрации
const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

/**
 * 4. Функция перерисовки состояния таблицы
 */
/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
  const state = collectState(); // 1. Собираем значения всех полей и кнопок
  let result = [...data]; // 2. Берем копию исходных данных

  // --- ШАГ 1: ПОИСК (если модуль подключен) ---
  result = applySearch(result, state, action);

  // --- ШАГ 2: ФИЛЬТРАЦИЯ ---
  // Убираем строки, не подходящие под фильтры колонок
  result = applyFiltering(result, state, action);

  // --- ШАГ 3: СОРТИРОВКА ---
  // Сортируем ВЕСЬ отфильтрованный список (например, от дорогих к дешевым)
  result = applySorting(result, state, action);

  // --- ШАГ 4: ПАГИНАЦИЯ ---
  // Отрезаем 10-25 строк для текущей страницы от уже отсортированного списка
  result = applyPagination(result, state, action);

  // --- ШАГ 5: ОТРИСОВКА ---
  // Отправляем финальный результат в DOM
  sampleTable.render(result);
}

/**
 * 5. Сбор данных из полей
 */
function collectState() {
  const formData = new FormData(sampleTable.container);
  const state = processFormData(formData);

  return {
    ...state,
    rowsPerPage: parseInt(state.rowsPerPage || 10),
    page: parseInt(state.page ?? 1),
    // ВАЖНО: приводим лимиты суммы к числам
    totalFrom: state.totalFrom ? parseFloat(state.totalFrom) : 0,
    totalTo: state.totalTo ? parseFloat(state.totalTo) : Infinity,
  };
}

/**
 * 6. Запуск приложения
 */
const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
}

render();
