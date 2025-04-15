import _ from 'lodash';
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

  const synchronizePosts = (postsArray) => {
      const currentPosts = postsArray.map((post) => post.name);
      const existsPosts = watchedState.posts.map((post) => post.name);
      if (_.isEqual(currentPosts, existsPosts)) {
        const differArray = postsArray.filter(elem => !existsPosts.includes(elem.name));
        watchedState.posts = [...differArray, ...watchedState.posts];
     }
  }

  const renderPosts = (elements, postsArray) => {
  
    if(elements.postsContainer.querySelector('.card') === null){
      const firstPostsEl = renderTemplate(`${i18n.t('interface.postsTitle')}`);
      elements.postsContainer.append(firstPostsEl);
    }

    const newPostsContainer = elements.postsContainer.querySelector('ul');
    const arrayOfPostsEl = postsArray.map((post) => {
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
    newPostsContainer.innerHTML = ''
    arrayOfPostsEl.forEach(postElement => newPostsContainer.append(postElement));
  }

  const renderContent = (elements, feed) => {
    if(elements.feedsContainer.querySelector('.card') === null){
      const firstFeedsEl = renderTemplate(`${i18n.t('interface.feedsTitle')}`);
      elements.feedsContainer.append(firstFeedsEl);
    }
    const liFeedElem = document.createElement('li');
    liFeedElem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const hThreeElem = document.createElement('h3');
    hThreeElem.classList.add('h6', 'm-0');
    hThreeElem.textContent = `${feed.feedTitle}`;
    const pElem = document.createElement('p');
    pElem.classList.add('m-0', 'small', 'text-black-50');
    pElem.textContent =  `${feed.feedDescription}`;
    liFeedElem.append(hThreeElem, pElem);
    elements.feedsContainer.querySelector('ul').prepend(liFeedElem);
  }

  const renderWindow = (currentId) => {
   const aPostElem = elements.postsContainer.querySelector(`[data-id="${currentId}"]`);
    const modalWindow = document.getElementById('modal');
    modalWindow.querySelector('.modal-title').textContent = `${aPostElem.textContent}`;
    const pElem = document.createElement('p');
    const currentDescription = watchedState.posts.filter((elem) => (elem.id === currentId));
    pElem.textContent = `${currentDescription[0].description}`;
    document.querySelector('.modal-body').innerHTML = '';
    document.querySelector('.modal-body').append(pElem);
    const closeButton = elements.modalWindow.querySelector('.btn-secondary');
    closeButton.textContent = `${i18n.t('interface.closeButton')}`;
    const followButton = elements.modalWindow.querySelector('.btn-primary');
    followButton.textContent = `${i18n.t('interface.followButton')}`;
  };

  const openFollowWindow = (elemId) => {
    const aPostElem = elements.postsContainer.querySelector(`[data-id="${elemId}"]`);
    window.open(`${aPostElem.getAttribute('href')}`, '_blank'); 
  }

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
        strOfErrors += `${i18n.t(error)} `
      });
      elements.feedbackContainer.textContent = `${strOfErrors.trim()}`
    } else if (path === 'loadingProcess.status'){
      if (value === 'sucessful') {
        state.feeds.forEach((feed) => renderContent(elements, feed));
        renderPosts(elements, state.posts);
      } 
    } else if (path === 'uiState.seenPosts') {
      const addViewedClass = (postId) => {
        const postElement = elements.postsContainer.querySelector(`[data-id="${postId}"]`);
        if (postElement) {
          postElement.classList.remove('fw-bold');
          postElement.classList.add('fw-normal', 'link-secondary');
        }
      };
        value.forEach(postId => addViewedClass(postId));
    } else if (path === 'uiState.status') {
      if (value === 'window'){
        renderWindow(watchedState.uiState.viewedButtonId);
      }
    } else if (path === 'posts') {
      renderPosts(elements, watchedState.posts)
    } else if (path === 'uiState.followPostId') {
      openFollowWindow(watchedState.uiState.followPostId);
    }
  });

  return {
    watchedState,
    renderForm,
    synchronizePosts,
  };
};
