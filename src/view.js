import { subscribe } from "valtio/vanilla";

const render = (elements, state) => {
  const { input, form, feedback } = elements;

  input.classList.remove("is-invalid");
  feedback.classList.remove("text-danger", "text-success");
  feedback.textContent = "";

  if (state.form.status === "invalid") {
    input.classList.add("is-invalid");
    feedback.classList.add("text-danger");
    feedback.textContent = state.form.error;
  }

  if (state.form.status === "valid") {
    form.reset();
    input.focus();
    feedback.classList.add("text-success");
    feedback.textContent = "RSS успешно добавлен";
  }
};

export default (elements, state) => {
  subscribe(state.form, () => {
    render(elements, state);
  });
};
