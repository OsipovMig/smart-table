

import {cloneTemplate} from "../lib/utils.js";

export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // #1.2 — Выводим шаблоны "до". 
    // ВАЖНО: используем [...before], чтобы не испортить оригинальный массив
    [...before].reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Шаблоны "после"
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // #1.3 — Обработка событий
    root.container.addEventListener('change', () => onAction());

    root.container.addEventListener('reset', () => {
        setTimeout(onAction);
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // #1.1 — Преобразование данных в строки
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);

            // Проверяем наличие elements, чтобы избежать ошибок
            if (row.elements) {
                Object.keys(item).forEach(key => {
                    if (key in row.elements) {
                        // ВАЖНО: записываем данные как есть, без лишнего форматирования
                        row.elements[key].textContent = item[key];
                    }
                });
            }

            return row.container;
        });

        // Очищаем и вставляем новые строки
        if (root.elements && root.elements.rows) {
            root.elements.rows.replaceChildren(...nextRows);
        }
    }

    return {...root, render};
}
