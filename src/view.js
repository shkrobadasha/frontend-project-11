import onChange from 'on-change';

const renderTemplate = (title) => {
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('card', 'border-0');
  const secondDivTitle = document.createElement('div');
  secondDivTitle.classList.add('card-body');
  const hFeedsTitle = document.createElement('h2');
  hFeedsTitle.classList.add('card-title', 'h4');
  hFeedsTitle.textContent = `${title}`;
  secondDivTitle.append(hFeedsTitle);
  const ulElem = document.createElement('ul');
  ulElem.classList.add('list-group', 'border-0', 'rounded-00');
  firstDiv.append(secondDivTitle, ulElem);
  return firstDiv
}

export default (elements, i18n, state) => {

  const { t } = i18n;
  const watchedState = onChange(state, (path, value) => {

    if (path === 'feeds'){
      elements.form.querySelector('input').classList.remove('is-invalid');
      elements.feedbackContainer.classList.add('text-success');
      elements.feedbackContainer.classList.remove('text-danger');
      elements.feedbackContainer.textContent = t('sucсess.successMessage');
      elements.form.reset();
      elements.form.querySelector('input').focus();
    }else if (path === 'loadingProcess.error'){
      elements.form.querySelector('input').classList.add('is-invalid');
      elements.feedbackContainer.classList.add('text-danger');
      elements.feedbackContainer.classList.remove('text-success');
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

  const checkNewPosts = (postsArray, elements) => {
      const currentPosts = postsArray.map((post) => post.name);
      const existsPosts = watchedState.posts.map((post) => post.name);
      if (JSON.stringify(currentPosts) !== JSON.stringify(existsPosts)) {
        const differArray = postsArray.filter(elem => !existsPosts.includes(elem.name))
        renderPosts(elements, differArray)
     }
  }



  const renderPosts = (elements, postsArray) => {
    if(elements.postsContainer.querySelector('.card') === null){
      const firstPostsEl = renderTemplate(`${i18n.t('interface.postsTitle')}`);
      elements.postsContainer.append(firstPostsEl);
    }
    const arrayOfPostsEl = postsArray.map((post) => {
      post.id = _.uniqueId(),
      watchedState.posts.push(post)
      const liPostElem = document.createElement('li');
      liPostElem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const aPostElem = document.createElement('a');
      aPostElem.classList.add('fw-bold');
      aPostElem.href = `${post.url}`;
      aPostElem.setAttribute('data-id', `${post.id}`);
      aPostElem.setAttribute('target', '_blank');
      aPostElem.setAttribute('rel', 'noopener noreferrer');
      aPostElem.textContent = `${post.name}`;

      const postButton = document.createElement('button');
      postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      postButton.setAttribute('type', 'button');
      postButton.setAttribute('data-id', `${post.id}`);
      postButton.setAttribute('data-bs-toggle', 'modal');
      postButton.setAttribute('data-bs-target', '#modal');
      postButton.textContent = `${i18n.t('interface.postsPreview')}`;
      liPostElem.append(aPostElem, postButton);        
      return liPostElem
    });
    const newPostsContainer = elements.postsContainer.querySelector('ul');
    arrayOfPostsEl.forEach(postElement => newPostsContainer.append(postElement));
  }

  const renderContent = (elements, parsedData) => {
    if(elements.feedsContainer.querySelector('.card') === null){
      const firstFeedsEl = renderTemplate(`${i18n.t('interface.feedsTitle')}`);
      elements.feedsContainer.append(firstFeedsEl);
    }
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
    renderPosts(elements, parsedData.postsArray);
  }

  const changeDuringViewing = (element) => {
    element.classList.remove('fw-bold');
    element.classList.add('fw-normal', 'link-secondary');
  }

  const renderWindow = (button) => {
    const currentId = button.getAttribute('data-id');
    const aPostElem = elements.postsContainer.querySelector(`[data-id="${currentId}"]`);
    aPostElem.classList.remove('fw-bold');
    aPostElem.classList.add('fw-normal', 'link-secondary');
    const modalWindow = document.getElementById('modal');
    modalWindow.querySelector('.modal-title').textContent = `${aPostElem.textContent}`;
    const pElem = document.createElement('p');
    const currentDescription = watchedState.posts.filter((elem) => (elem.id === currentId));
    pElem.textContent = `${currentDescription[0].description}`;
    document.querySelector('.modal-body').innerHTML = '';
    document.querySelector('.modal-body').append(pElem);
    const closeButton = document.createElement('button');
    closeButton.setAttribute('type', "button");
    closeButton.classList.add('btn', 'btn-secondary');
    closeButton.setAttribute('data-bs-dismiss',"modal");
    closeButton.textContent = `${i18n.t('interface.closeButton')}`;
    const followButton = document.createElement('button');
    followButton.setAttribute('type', "button");
    followButton.classList.add('btn', 'btn-primary');
    followButton.textContent = `${i18n.t('interface.followButton')}`;
    document.querySelector('.modal-footer').innerHTML = '';
    document.querySelector('.modal-footer').append(followButton, closeButton);
    watchedState.uiState.seenPosts.push(`${button.getAttribute('data-id')}`);
    watchedState.uiState.status = 'window';
  }

  return {
    watchedState,
    renderForm,
    renderContent,
    checkNewPosts,
    renderWindow,
    changeDuringViewing
  };
};
