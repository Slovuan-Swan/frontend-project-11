export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Проверяем наличие ошибки парсинга в DOM-дереве
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const error = new Error("Invalid RSS");
    error.isParserError = true;
    throw error;
  }

  const feedTitle = doc.querySelector("channel > title").textContent;
  const feedDescription = doc.querySelector(
    "channel > description",
  ).textContent;

  const items = doc.querySelectorAll("item");
  const posts = Array.from(items).map((item) => {
    const title = item.querySelector("title").textContent;
    const link = item.querySelector("link").textContent;
    const description = item.querySelector("description").textContent;
    return { title, link, description };
  });

  return {
    feed: { title: feedTitle, description: feedDescription },
    posts,
  };
};
