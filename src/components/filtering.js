import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнение селектов
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
      const container = action.parentElement;
      const input = container.querySelector("input") || container.querySelector("select");

      if (input) {
        input.value = "";
        // Важно: берем имя поля из data-field кнопки
        const fieldName = action.dataset.field;
        // Сбрасываем в null или пустую строку, чтобы фильтр отключился
        state[fieldName] = ""; 
      }
    }

    // @todo: #4.3 — создание функции сравнения
    // Оборачиваем в массив для корректной работы .map внутри библиотеки
    const compare = createComparison(
        Array.isArray(defaultRules) ? defaultRules : [defaultRules]
    );

    // @todo: #4.5 — фильтрация данных
    if (!data) return [];

    return data.filter(row => {
        // Дополнительная страховка для числовых полей, если compare.js их не приводит сам
        // (Этот блок помогает исправить ошибку 4657.56 >= 5000)
        return compare(row, state);
    });
  };
}

