

import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 — вывести дополнительные шаблоны до и после таблицы
    
    // Обрабатываем шаблоны "до" (в обратном порядке для корректного prepend)
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Обрабатываем шаблоны "после"
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // @todo: #1.3 — обработать события и вызвать onAction()

    // Изменение полей
    root.container.addEventListener('change', () => {
        onAction();
    });

    // Сброс формы (с задержкой для очистки полей)
    root.container.addEventListener('reset', () => {
        setTimeout(onAction);
    });

    // Отправка формы
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        
        const nextRows = data.map(item => {
            // Клонируем шаблон строки (получаем объект с container и elements)
            const row = cloneTemplate(rowTemplate);

            // Автоматически заполняем элементы данными по ключам
            Object.keys(item).forEach(key => {
                if (key in row.elements) {
                    row.elements[key].textContent = item[key];
                }
            });

            // Возвращаем сам DOM-узел строки
            return row.container;
        });

        // Очищаем старые строки и вставляем новые
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}
