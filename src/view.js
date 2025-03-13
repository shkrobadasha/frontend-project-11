import onChange from 'on-change';

// Нужна функция, которая запускается каждые 5 секунд, пробегается по массиву фидов, делает запросы(запустим через промис олл)
// когда делает запрос, то ссылка закидывает в парсер, оттуда возвращает обект с данными 
// обект с данными закидываем во вью, которая отрисовывает данные для фидов и для постов 
//в идеале нужно сравнивать посты и если там что-то обновилось, то это и отрисовать, но похуй
//нужно понять, как делать бесконечный таймер, либо сделать функцию, которая отрисуется все фиды

const renderTemplate = (title) => {
  //console.log('hiii')
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('card', 'border-0');
  const secondDivTitle = document.createElement('div');
  secondDivTitle.classList.add('card-body');
  const hFeedsTitle = document.createElement('h2');
  hFeedsTitle.classList.add('card-title', 'h4');
 //hFeedsTitle.textContent = i18n.t(`${title}`);
  hFeedsTitle.textContent = `${title}`;
  secondDivTitle.append(hFeedsTitle);
  const ulElem = document.createElement('ul');
  ulElem.classList.add('list-group', 'border-0', 'rounded-00');
  firstDiv.append(secondDivTitle, ulElem);
  return firstDiv
}
//для каждой ссылки мы записываем
//у каждого из элементов проверяем, если кардбордер есть, сразу переходим к рисунку контента, если нет - все делаем заново
//не вызывается

//const renderPosts = elements 

export default (elements, i18n, state) => {

  const { t } = i18n;
  const watchedState = onChange(state, (path, value) => {

    if (path === 'feeds'){
      elements.form.querySelector('input').classList.remove('is-invalid');
      elements.feedbackContainer.classList.add('text-sucessful');
      elements.feedbackContainer.classList.remove('text-danger');
      elements.feedbackContainer.textContent = t('sucсess.successMessage');
      //console.log('фид можно добавлять')
    }else if (path === 'loadingProcess.error'){
      elements.form.querySelector('input').classList.add('is-invalid');
      elements.feedbackContainer.classList.add('text-danger');
      elements.feedbackContainer.classList.remove('text-sucessful');
      let strOfErrors = '';
      watchedState.loadingProcess.error.forEach((error) => {
        strOfErrors += `${error} `
      });
      elements.feedbackContainer.textContent = `${strOfErrors.trim()}`
      //console.log('не фид, а хуйня')
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

  const renderContent = (elements, parsedData) => {

    if(elements.feedsContainer.querySelector('.card') === null){
      const firstFeedsEl = renderTemplate(`${i18n.t('interface.feedsTitle')}`);
      elements.feedsContainer.append(firstFeedsEl);
    }
    if(elements.postsContainer.querySelector('.card') === null){
      const firstPostsEl = renderTemplate(`${i18n.t('interface.postsTitle')}`);
      elements.postsContainer.append(firstPostsEl);
    }
    //добавление ссылки для фида
    const liFeedElem = document.createElement('li');
    liFeedElem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const hThreeElem = document.createElement('h3');
    hThreeElem.classList.add('h6', 'm-0');
    hThreeElem.textContent = `${parsedData.feedTitle}`;
    const pElem = document.createElement('p');
    pElem.classList.add('m-0', 'small', 'text-black-50');
    pElem.textContent =  `${parsedData.feedDescription}`;
    liFeedElem.append(hThreeElem, pElem);
    elements.feedsContainer.querySelector('ul').prepend(liFeedElem);
  
    const arrayOfPostsEl = parsedData.postsArray.map((post, index) => {
      const liPostElem = document.createElement('li');
      liPostElem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const aPostElem = document.createElement('a');
      aPostElem.classList.add('fw-bold');
      aPostElem.href = `${post.url}`;
      aPostElem.setAttribute('data-id', `${index + 2}`);
      aPostElem.setAttribute('target', '_blank');
      aPostElem.setAttribute('rel', 'noopener noreferrer');
      aPostElem.textContent = `${post.name}`;
      const postButton = document.createElement('button');
      postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      postButton.setAttribute('type', 'button');
      postButton.setAttribute('data-id', `${index + 2}`);
      postButton.setAttribute('data-bs-toggle', 'modal');
      postButton.setAttribute('data-bs-target', '#modal');
      postButton.textContent = `${i18n.t('interface.postsPreview')}`;
      liPostElem.append(aPostElem, postButton);
      return liPostElem
    });
    const newPostsContainer = elements.postsContainer.querySelector('ul');
    arrayOfPostsEl.forEach(postElement => newPostsContainer.append(postElement));
  
  }

  return {
    watchedState,
    renderForm,
    renderContent,
  };
};
