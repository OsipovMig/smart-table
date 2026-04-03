import { sortMap } from "../lib/sort.js"; // sortCollection больше не нужен

export function initSorting(columns) {
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === "sort") {
      // @todo: #3.1 — обновить переменные и состояние нажатой кнопки
      // Используем карту переходов для циклического переключения: none -> asc -> desc -> none
      action.dataset.value = sortMap[action.dataset.value || "none"];

      field = action.dataset.field; // Поле берем из data-field кнопки (date или total)
      order = action.dataset.value; // Новое направление берем из обновленного датасета

      // @todo: #3.2 — сбросить состояние остальных кнопок сортировки
      columns.forEach((column) => {
        // Если поле этой кнопки не совпадает с тем, на которое нажал пользователь
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none"; // сбрасываем иконку и значение в начальное
        }
      });
    } else {
      // @todo: #3.3 — получить выбранный режим сортировки из state (для пагинации/фильтров)
      columns.forEach((column) => {
        // Перебираем все наши кнопки сортировки
        if (column.dataset.value !== "none") {
          // Ищем ту, что активна (не в состоянии none)
          field = column.dataset.field; // Запоминаем, по какому полю фильтруем
          order = column.dataset.value; // Запоминаем направление (asc или desc)
        }
      });
    }

    const sort = field && order !== "none" ? `${field}:${order}` : null; // сохраним в переменную параметр сортировки в виде field:direction

    return sort ? Object.assign({}, query, { sort }) : query; // по общему принципу, если есть сортировка, добавляем, если нет, то не трогаем query
  };
}
