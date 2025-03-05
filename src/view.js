import onChange from 'on-change';
//почему-то ссылки добавля.тся в фиды со второго раза 

const renderFeeds = (elements, t, state) => {
  elements.feedsContainer.innerHTML = '';
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('card', 'border-0');
  const secondDivTitle = document.createElement('div');
  secondDivTitle.classList.add('card-body');
  const hFeedsTitle = document.createElement('h2');
  hFeedsTitle.classList.add('card-title', 'h4');
  hFeedsTitle.textContent = t('interface.feedsTitle');
  secondDivTitle.append(hFeedsTitle);
  const ulElem = document.createElement('ul');
  ulElem.classList.add('list-group', 'border-0', 'rounded-00');
  //пока что в фидс будем хранить только введенную ссылку
  state.feeds.forEach((feed) => {
    const liElem = document.createElement('li');
    liElem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const hThreeElem = document.createElement('h3');
    hThreeElem.classList.add('h6', 'm-0');
    hThreeElem.textContent = `${feed}`;
    const pElem = document.createElement('p');
    pElem.classList.add('m-0', 'small', 'text-black-50');
    pElem.textContent = `${feed} - little feed`;
    liElem.append(hThreeElem, pElem);
    ulElem.prepend(liElem);
  });
  firstDiv.append(secondDivTitle, ulElem);
  elements.feedsContainer.append(firstDiv);
}

//Сделать функцию,отрисовывающую ссылки фидов

export default (elements, i18n, state) => {
  const { t } = i18n;
  const watchedState = onChange(state, (path, value) => {

    console.log({path});

    if (path === 'feeds'){
      //найти как отрисовывается зеленый текст
      elements.form.querySelector('input').classList.remove('is-invalid');
      elements.feedbackContainer.classList.add('text-sucessful');
      elements.feedbackContainer.classList.remove('text-danger');
      elements.feedbackContainer.textContent = t('sucсess.successMessage');
      renderFeeds(elements, t, watchedState);

    }else if (path === 'loadingProcess.error'){
      elements.form.querySelector('input').classList.add('is-invalid');
      elements.feedbackContainer.classList.add('text-danger');
      elements.feedbackContainer.classList.remove('text-sucessful');
      let strOfErrors = '';
      watchedState.loadingProcess.error.forEach((error) => {
        strOfErrors += `${error} `
      });
      elements.feedbackContainer.textContent = `${strOfErrors.trim()}`
    }

  });


  const renderForm = () => {
    const { mainContainer, form } = elements;
    const littleTitle = document.createElement('p');
    littleTitle.classList.add('lead');
    littleTitle.textContent = t('initialization.littleTitle');
    mainContainer.prepend(littleTitle);

    const title = document.createElement('h1');
    title.classList.add('display-3', 'mb-0');
    title.textContent = t('initialization.title');
    mainContainer.prepend(title);

    const inputText = document.createElement('label');
    inputText.setAttribute('for', 'url-input');
    inputText.textContent = t('initialization.inputText');
    form.querySelector('.form-floating').append(inputText);

    const addButton = document.createElement('button');
    addButton.classList.add('h-100', 'btn', 'btn-lg', 'btn-primary', 'px-sm-5');
    addButton.setAttribute('type', 'submit');
    addButton.setAttribute('aria-label', 'add');
    addButton.textContent = t('initialization.buttonText');
    form.querySelector('.col-auto').append(addButton);

    const exampleText = document.createElement('p');
    exampleText.classList.add('mt-2', 'mb-0', 'text-muted');
    exampleText.textContent = t('initialization.exampleText');
    const textDanger = mainContainer.querySelector('.text-danger');
    mainContainer.insertBefore(exampleText, textDanger);

  };

  return {
    watchedState,
    renderForm,
  };
};