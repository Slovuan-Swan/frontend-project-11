// Было: import { proxy } from 'valtio';
// Стало:
import { proxy } from "valtio/vanilla";
import * as yup from "yup";
import watch from "./view.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

const state = proxy({
  form: {
    status: "filling",
    error: null,
  },
  feeds: [],
});

const validateUrl = (url, feeds) => {
  const schema = yup
    .string()
    .required("Не должно быть пустым")
    .url("Ссылка должна быть валидным URL")
    .notOneOf(feeds, "RSS уже существует");

  return schema.validate(url);
};

const app = () => {
  const elements = {
    form: document.querySelector(".rss-form"),
    input: document.querySelector("#url-input"),
  };

  let feedbackEl = document.querySelector(".feedback");
  if (!feedbackEl) {
    feedbackEl = document.createElement("div");
    // Используем валидный класс Bootstrap, чтобы текст ошибки был виден при .is-invalid
    feedbackEl.className = "feedback invalid-feedback";
    elements.input.parentNode.appendChild(feedbackEl);
    elements.feedback = feedbackEl;
  } else {
    elements.feedback = feedbackEl;
  }

  watch(elements, state);

  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get("url").trim();

    validateUrl(url, state.feeds)
      .then((validUrl) => {
        state.feeds.push(validUrl);
        state.form.error = null;
        state.form.status = "valid";
        state.form.status = "filling";
      })
      .catch((error) => {
        state.form.error = error.message;
        state.form.status = "invalid";
      });
  });
};

app();
