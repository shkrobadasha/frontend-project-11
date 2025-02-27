/*import onChange from 'on-change';
import 'babel-polyfill';

export default (elements, state) => {
  const watchedState = onChange(state, (path, value) => {

  });

  //const { t } = i18n;

  const renderForm = () => {
    const { mainContainer, form } = elements;
    const littleTitle = document.createElement('p');
    littleTitle.classList.add('lead');
    //littleTitle.textContent = t('initialization.littleTitle');
    mainContainer.prepend(littleTitle);

    const title = document.createElement('h1');
    title.classList.add('display-3', 'mb-0');
    //title.textContent = t('initialization.title');
    mainContainer.prepend(title);

    const inputText = document.createElement('label');
    inputText.setAttribute('for', 'url-input');
    //inputText.textContent = t('initialization.inputText');
    form.querySelector('.form-floating').append(inputText);

    const addButton = document.createElement('button');
    addButton.classList.add('h-100', 'btn', 'btn-lg', 'btn-primary', 'px-sm-5');
    addButton.setAttribute('type', 'submit');
    addButton.setAttribute('aria-label', 'add');
    //addButton.textContent = t('initialization.buttonText');
    form.querySelector('.col-auto').append(addButton);

    const exampleText = document.createElement('p');
    exampleText.classList.add('mt-2', 'mb-0', 'text-muted');
    //exampleText.textContent = t('initialization.exampleText');
    const textDanger = mainContainer.querySelector('.text-danger');
    mainContainer.insertBefore(exampleText, textDanger);
  };

  return {
    //watchedState,
    renderForm,
  };
};*/
