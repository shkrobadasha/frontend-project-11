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
  watchedState.loadingProcess.error = [];
  return schema.validate(url, { abortEarly: false })
}

 
const getParsedContent = (url) => {
    const newUrl = getProxyUrl(url);
    return axios.get(newUrl)
    .then(response => {
      const parsedData = dataParser(response.data.contents);
      return parsedData;
 
    })
    .catch((error) => {
      throw error
  })
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
          notOneOf: () => i18next.t('errors.exists'),
          required: () => i18next.t('errors.required'),

        },
        string: {
          url: () => i18next.t('errors.notUrl'),
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
  };
 
  const state = {
    loadingProcess: {
      error: [],
      status: 'notLoad'
    },
    uiState: {
      seenPosts: [],
      status: 'typical',
    },
    feeds: [],
    posts: [],
  };

  const errorНandler = (error, i18n, watchedState) => {
    let errorMessageKey = 'errors.unknown';
    if (error.message === i18n.t('errors.noRss')) {
      errorMessageKey = 'errors.noRss';
    } if (error.code === 'ERR_NETWORK') {
      errorMessageKey = 'errors.network';
    } if (error instanceof yup.ValidationError) {
      switch(error.message) {
        case `${i18n.t('errors.notUrl')}`:
          errorMessageKey = 'errors.notUrl'
          break;
        case `${i18n.t('errors.exists')}`:
          errorMessageKey = 'errors.exists'
          break;
        case `${i18n.t('errors.required')}`:
          errorMessageKey = 'errors.required'
          break;
        default:
          errorMessageKey = 'errors.unknown'
      }
    }
    watchedState.loadingProcess.status = 'failed'
    watchedState.loadingProcess.error = [i18next.t(errorMessageKey)];
  }
 
  
  const checker = (watchedState, checkNewPosts, timeout = 5000) => {
    const check = () => {
      const promises = watchedState.feeds.map((feed) => {
        getParsedContent(feed.url)
        .then((parsedData) => {
          checkNewPosts(parsedData.postsArray, elements)
        })
        .catch((error) => {
          errorНandler(error, i18n, watchedState)
        });
      })
      Promise.all(promises)
      .finally(() => {
        setTimeout(check, timeout)
      })
    };
    check()
    
  }

  const linkProcessing = (i18n, watchedState, renderWindow, changeDuringViewing) => (e) => {
    e.preventDefault();
    watchedState.loadingProcess.status = 'loading';
    const form = e.target;
    const formData = new FormData(form);
    const originalFeedName = formData.get('url');
    validation(originalFeedName, watchedState)
    .then(() => {
      getParsedContent(originalFeedName)
      .then((parsedData) => {
        parsedData.postsArray.forEach((item) => {
          item.id = _.uniqueId();
          watchedState.posts.push(item);
        });
        parsedData.feed.id = _.uniqueId();
        parsedData.feed.url = originalFeedName;
        watchedState.feeds.push(parsedData.feed);
        watchedState.loadingProcess.status = 'sucessful';

        /*const linkElements = elements.postsContainer.querySelectorAll("[target='_blank']");
        Array.from(linkElements).forEach((elem) => {
          elem.addEventListener('click', () => {
            changeDuringViewing(elem)
          })
        })*/

        //const previewButtons = elements.postsContainer.querySelectorAll("[data-bs-target='#modal']");
        //Array.from(previewButtons).forEach((button) => {
          /*button.addEventListener('click', () => {
            renderWindow(button);
            const modalWindow = document.getElementById('modal');
            const followButton = modalWindow.querySelector('.btn-primary')
            followButton.addEventListener('click', () => {
              const aPostElem = elements.postsContainer.querySelector(`[data-id="${button.getAttribute('data-id')}"]`);
              window.open(`${aPostElem.getAttribute('href')}`, '_blank');
            })

            const closeButton = modalWindow.querySelector('.btn-secondary')
            closeButton.addEventListener('click', () => {
              watchedState.uiState.status = 'typical';
            })

            const secondCloseButton = modalWindow.querySelector('.btn-close[data-bs-dismiss="modal"]')
            secondCloseButton.addEventListener('click', () => {
              watchedState.uiState.status = 'typical';
            });

          })*/
        //})
      })
      .catch((error) => {
        errorНandler(error, i18n, watchedState)
      });
    })
    .catch((error) => {
      errorНandler(error, i18n, watchedState)
    });
  };


  initI18n()
    .then((i18nInstance) => {
      const { watchedState, renderForm,  checkNewPosts, renderWindow, changeDuringViewing} = watch(elements, i18nInstance, state);
      renderForm();
      checker(watchedState, checkNewPosts);
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState, renderWindow, changeDuringViewing));
    });
};