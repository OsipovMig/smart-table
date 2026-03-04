import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнение селектов данными (тегами <option>)
  Object.keys(indexes).forEach((elementName) => {
    if (elements[elementName]) {
      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          return option;
        })
      );
    }
  });

  return (data, state, action) => {
    // @todo: #4.2 — обработка очистки (Clear)
    if (action && action.name === "clear") {
      const input = action.parentElement.querySelector("input") || action.parentElement.querySelector("select");
      if (input) {
        input.value = "";
        state[action.dataset.field] = "";
      }
    }

    // @todo: #4.3 — создание функции сравнения
    // ОШИБКА БЫЛА ТУТ: Мы принудительно оборачиваем правила в массив [ ... ],
    // чтобы метод .map() внутри compare.js нашел данные для перебора.
    const compare = createComparison(
        Array.isArray(defaultRules) ? defaultRules : [defaultRules]
    );

    // @todo: #4.5 — фильтрация данных
    if (!data) return [];
    return data.filter(row => compare(row, state));
  };
}
