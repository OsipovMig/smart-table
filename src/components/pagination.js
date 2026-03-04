import { getPages } from "../lib/utils.js";

export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage,
) => {
  // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
  // Делаем это один раз при инициализации модуля
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.innerHTML = "";

  /**
   * Возвращаемая функция (applyPagination), которая вызывается в render()
   */
  return (data, state, action) => {
    // @todo: #2.1 — рассчитать переменные и константы
    const rowsPerPage = state.rowsPerPage;
    const pageCount = Math.ceil(data.length / rowsPerPage);
    let page = state.page;

    // @todo: #2.6 — обработать действия кнопок навигации
    if (action) {
      switch (action.name) {
        case "first":
          page = 1;
          break;
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          page = Math.min(pageCount, page + 1);
          break;
        case "last":
          page = pageCount;
          break;
      }
    }

    // @todo: #2.4 — получить список видимых страниц и вывести их кнопки
    const visiblePages = getPages(page, pageCount, 5);

    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        // Заполняем клон шаблона через колбэк из main.js
        return createPage(el, pageNumber, pageNumber === page);
      })
    );

    // @todo: #2.5 — вывести статус пагинации (Showing X to Y of Z)
    // Если данных нет, показываем 0, иначе считаем по формуле
    fromRow.textContent = data.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    toRow.textContent = Math.min(page * rowsPerPage, data.length);
    totalRows.textContent = data.length;

    // @todo: #2.2 — вернуть срез данных для текущей страницы
    const skip = (page - 1) * rowsPerPage;
    return data.slice(skip, skip + rowsPerPage);
  };
};
