

import {cloneTemplate} from "../lib/utils.js";

export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // Вывод шаблонов "до" без мутации массива
    [...before].reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Вывод шаблонов "после"
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // События
    root.container.addEventListener('change', () => onAction());
    root.container.addEventListener('reset', () => setTimeout(onAction));
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            if (row.elements) {
                Object.keys(item).forEach(key => {
                    if (key in row.elements) {
                        // Выводим данные без лишних пробелов и форматирования
                        row.elements[key].textContent = item[key];
                    }
                });
            }
            return row.container;
        });

        if (root.elements && root.elements.rows) {
            root.elements.rows.replaceChildren(...nextRows);
        }
    }

    return {...root, render};
}
