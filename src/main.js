import { proxy } from "valtio/vanilla";
import * as yup from "yup";
import i18next from "i18next";
import axios from "axios";
import watch from "./view.js";
import parseRss from "./parser.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

const resources = {
  ru: {
    translation: {
      errors: {
        required: "Не должно быть пустым",
        url: "Ссылка должна быть валидным URL",
        notOneOf: "RSS уже существует",
        network: "Ошибка сети",
        invalidRss: "Ресурс не содержит валидный RSS",
      },
      success: "RSS успешно добавлен",
      interface: {
        feeds: "Фиды",
        posts: "Посты",
      },
    },
  },
};

yup.setLocale({
  string: { url: "errors.url" },
  mixed: { required: "errors.required", notOneOf: "errors.notOneOf" },
});

// Расширяем состояние для хранения списков фидов и постов
const state = proxy({
  form: {
    status: "filling", // filling, loading, invalid, valid
    error: null,
  },
  feeds: [],
  posts: [],
});

// Массив добавленных ссылок для валидации уникальности
const addedUrls = [];

const validateUrl = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url);
};

// Функция сборки URL для прокси allorigins с отключением кэша
const buildProxyUrl = (url) => {
  const proxyUrl = new URL("https://allorigins.win");
  proxyUrl.searchParams.set("disableCache", "true");
  proxyUrl.searchParams.set("url", url);
  return proxyUrl.toString();
};

const app = () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: "ru",
      resources,
    })
    .then(() => {
      const elements = {
        form: document.querySelector(".rss-form"),
        input: document.querySelector("#url-input"),
        feedsContainer: document.querySelector(".feeds"),
        postsContainer: document.querySelector(".posts"),
      };

      let feedbackEl = document.querySelector(".feedback");
      if (!feedbackEl) {
        feedbackEl = document.createElement("div");
        feedbackEl.className = "feedback invalid-feedback";
        elements.input.parentNode.appendChild(feedbackEl);
        elements.feedback = feedbackEl;
      } else {
        elements.feedback = feedbackEl;
      }

      watch(elements, state, i18nInstance);

      elements.form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get("url").trim();

        state.form.status = "loading";

        validateUrl(url, addedUrls)
          .then((validUrl) => {
            // Выполняем HTTP запрос через axios
            return axios
              .get(buildProxyUrl(validUrl))
              .then((response) => ({ response, validUrl }));
          })
          .then(({ response, validUrl }) => {
            // Парсим полученный XML контент
            const { feed, posts } = parseRss(response.data.contents);

            const feedId = crypto.randomUUID();

            // Добавляем фид
            state.feeds.push({ ...feed, id: feedId, url: validUrl });
            addedUrls.push(validUrl);

            // Добавляем посты
            posts.forEach((post) => {
              state.posts.push({ ...post, id: crypto.randomUUID(), feedId });
            });

            state.form.error = null;
            state.form.status = "valid";
            state.form.status = "filling";
          })
          .catch((error) => {
            // Дифференцируем типы возникших ошибок
            if (error.isParserError) {
              state.form.error = "errors.invalidRss";
            } else if (axios.isAxiosError(error)) {
              state.form.error = "errors.network";
            } else {
              state.form.error = error.message;
            }
            state.form.status = "invalid";
          });
      });
    });
};

app();
