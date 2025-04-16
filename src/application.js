import i18next from 'i18next';
import _ from 'lodash';
import watch from './view.js';
import dataParser from './parser.js';
import resources from './locales/index.js';
import * as yup from 'yup';
import axios from 'axios';

const getProxyUrl = (link) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', link);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};
 
const getFeedsUrl = (arrayOfFeeds) => {
  return arrayOfFeeds.map((item) => item.url);
};

const validation = (url, watchedState) => {
  const schema = yup.string().url().trim().required().notOneOf(getFeedsUrl(watchedState.feeds));
  return schema.validate(url, { abortEarly: false })
}

const getParsedContent = (url) => {
  const newUrl = getProxyUrl(url);
  return axios.get(newUrl)
    .then(response => {
      const parsedData = dataParser(response.data.contents);
      return parsedData;
    });
};

export default () => {
  const i18n = i18next.createInstance();
  const initI18n  = () => {
    return i18next.init({
      lng: 'ru',
      resources,
    })
    .then(() => {
      yup.setLocale({
        mixed: {
         notOneOf: () => 'errors.exists',
         required: () => 'errors.required',
        },
        string: {
          url: () => 'errors.notUrl',
        },
      });
      return i18next;
    })
    .catch((error) => {
      throw error;
    });
  };
 
  const elements = {
    mainContainer: document.querySelector('.text-white'),
    form: document.querySelector('form'),
    link: document.getElementById('url-input'),
    addButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedbackContainer: document.querySelector('.feedback'),
    modalWindow: document.getElementById('modal'),
  };
  
  const state = {
    loadingProcess: {
      error: [],
      status: 'notLoad'
    },
    uiState: {
      seenPosts: [],
      status: 'typical',
      viewedButtonId: '',
      followPostId: '',
    },
    feeds: [],
    posts: [],
  };

  const errorHandler = (error, i18n, watchedState) => {
    let errorMessageKey = 'errors.unknown';
    if (error.message === i18n.t('errors.noRss')) {
      errorMessageKey = 'errors.noRss';
    } if (error.code === 'ERR_NETWORK') {
      errorMessageKey = 'errors.network';
    } if (error instanceof yup.ValidationError) {
      switch(error.message) {
        case 'errors.notUrl':
          errorMessageKey = 'errors.notUrl'
          break;
        case 'errors.exists':
          errorMessageKey = 'errors.exists'
          break;
        case 'errors.required':
          errorMessageKey = 'errors.required'
          break;
        default:
          errorMessageKey = 'errors.unknown'
      }
    }
    watchedState.loadingProcess.error = [errorMessageKey];
  }
  
  const checker = (watchedState, synchronizePosts, timeout = 5000) => {
    const check = () => {
      const promises = watchedState.feeds.map((feed) => {
        getParsedContent(feed.url)
        .then((parsedData) => {
          synchronizePosts(parsedData.postsArray)
        })
        .catch((error) => {
          errorHandler(error, i18n, watchedState)
        });
      })
      Promise.all(promises)
      .finally(() => {
        setTimeout(check, timeout)
      })
    };
    check()
  }

  const buttonsClick = (watchedState) => () => {
    watchedState.uiState.status = 'typical';
  }

  const linkProcessing = (i18n, watchedState) => (e) => {
    e.preventDefault();
    watchedState.loadingProcess.status = 'loading';
    const form = e.target;
    const formData = new FormData(form);
    const originalFeedName = formData.get('url');
    validation(originalFeedName, watchedState)
      .then(() => getParsedContent(originalFeedName))
      .then((parsedData) => {
        const newPostsArray = parsedData.postsArray.map((item) => {
          item.id = _.uniqueId();
          return item
        });
        parsedData.feed.id = _.uniqueId();
        parsedData.feed.url = originalFeedName;
        watchedState.feeds.push(parsedData.feed);
        watchedState.posts = [...newPostsArray, ...watchedState.posts];
        watchedState.loadingProcess.status = 'successful';
      })
      .catch((error) => {
        errorHandler(error, i18n, watchedState)
        watchedState.loadingProcess.status = 'failed'
      })
  };

  initI18n()
    .then((i18nInstance) => {
      const { watchedState, renderForm,  synchronizePosts } = watch(elements, i18nInstance, state);
      renderForm();
      checker(watchedState, synchronizePosts);
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState));

      elements.postsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'A' && target.closest('li')) {
          const postId = target.getAttribute('data-id');
          if (postId && !watchedState.uiState.seenPosts.includes(postId)) {
            watchedState.uiState.seenPosts.push(postId);
          }
        }
        if (target.tagName === 'BUTTON' && target.getAttribute('data-bs-target') === '#modal') {
          const currentId = target.getAttribute('data-id');
          watchedState.uiState.viewedButtonId = currentId;
          if (currentId && !watchedState.uiState.seenPosts.includes(currentId)) {
            watchedState.uiState.seenPosts.push(currentId);
          }
          watchedState.uiState.status = 'window';
        }
      });

      elements.modalWindow.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-primary')) {
          const postId = watchedState.uiState.viewedButtonId;
          watchedState.uiState.followPostId = postId;
        }
      });

      const closeButton = elements.modalWindow.querySelector('.btn-secondary');
      const secondCloseButton = elements.modalWindow.querySelector('.btn-close[data-bs-dismiss="modal"]');
      closeButton.addEventListener('click', buttonsClick(watchedState));
      secondCloseButton.addEventListener('click', buttonsClick(watchedState));
    });
};
