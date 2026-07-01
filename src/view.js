import { subscribe } from "valtio/vanilla";

const buildCard = (titleText) => {
  const card = document.createElement("div");
  card.className = "card border-0";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const title = document.createElement("h2");
  title.className = "card-title h4";
  title.textContent = titleText;

  cardBody.appendChild(title);
  card.appendChild(cardBody);

  const ul = document.createElement("ul");
  ul.className = "list-group border-0 rounded-0";
  card.appendChild(ul);

  return { card, ul };
};

const renderFeeds = (container, feeds, i18n) => {
  if (!container) return; // Защита от null
  container.innerHTML = "";
  if (feeds.length === 0) return;

  const { card, ul } = buildCard(i18n.t("interface.feeds"));

  feeds.forEach((feed) => {
    const li = document.createElement("li");
    li.className = "list-group-item border-0 border-end-0";

    const h3 = document.createElement("h3");
    h3.className = "h6 m-0";
    h3.textContent = feed.title;

    const p = document.createElement("p");
    p.className = "m-0 small text-black-50";
    p.textContent = feed.description;

    li.append(h3, p);
    ul.appendChild(li);
  });

  container.appendChild(card);
};

const renderPosts = (container, posts, i18n) => {
  if (!container) return; // Защита от null
  container.innerHTML = "";
  if (posts.length === 0) return;

  const { card, ul } = buildCard(i18n.t("interface.posts"));

  posts.forEach((post) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-start border-0 border-end-0";

    const a = document.createElement("a");
    a.setAttribute("href", post.link);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.className = "fw-bold";
    a.textContent = post.title;

    li.appendChild(a);
    ul.appendChild(li);
  });

  container.appendChild(card);
};

export default (elements, state, i18n) => {
  const { input, form, feedback, feedsContainer, postsContainer } = elements;

  // Слушаем изменения состояния
  subscribe(state, () => {
    input.classList.remove("is-invalid");
    feedback.classList.remove("text-danger", "text-success");
    feedback.textContent = "";

    if (state.form.status === "invalid") {
      input.classList.add("is-invalid");
      feedback.classList.add("text-danger");
      feedback.textContent = i18n.t(state.form.error);
    }

    if (state.form.status === "valid") {
      form.reset();
      input.focus();
      feedback.classList.add("text-success");
      feedback.textContent = i18n.t("success");
    }

    // Рендерим контент при любых изменениях в массивах данных
    renderFeeds(feedsContainer, state.feeds, i18n);
    renderPosts(postsContainer, state.posts, i18n);
  });
};
