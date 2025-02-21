import onChange from 'on-change';
//все-таки нужна будет функция рендер форм, то есть части с текстом надо будет создавать специально
export default (elements, i18n, state) => {
 
  const watchedState = onChange(state, (path, value) => {

  });

  const {t} = i18n;

  const renderForm = () => {
    const {mainContainer, form} = elements;
    const title = document.createElement('h1');
    title.classList.add('display-3', 'mb-0');
    title.textContent = t('title');
    mainContainer.append(title)
     

  };

  return {
    watchedState,
    renderForm,
  }
};
