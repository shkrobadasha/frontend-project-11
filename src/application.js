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

 
const checkAndLoadContent = (url) => {
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
      status: 'notLoad' //еще loading, sucess, fail
    },
    uiState: {
      seenPosts: [],
      status: 'typical',
    },
    feeds: [],
    posts: [],
  };
 
  
  const checker = (watchedState, checkNewPosts, timeout = 5000) => {
    const check = () => {
      const promises = watchedState.feeds.map((feed) => {
        checkAndLoadContent(feed)
        .then((parsedData) => {
          checkNewPosts(parsedData.postsArray, elements)
        })
        .catch((error) => {
          let errorMessageKey = ''; 
          if (error.message === i18n.t('errors.noRss')) {
            errorMessageKey = 'errors.noRss';
          } else if (error.message === 'Network response was not ok') {
            errorMessageKey = 'errors.network';
          } else {
            errorMessageKey = 'errors.unknown';
          }
        });
      })
      Promise.all(promises)
      .finally(() => {
        setTimeout(check, timeout)
      })
    };
    check()
    
  }


  const linkProcessing = (i18n, watchedState, renderContent, renderWindow, changeDuringViewing) => (e) => {
    e.preventDefault();
    watchedState.loadingProcess.status = 'loading';
    const form = e.target;
    const formData = new FormData(form);
    const originalFeedName = formData.get('url');
    validation(originalFeedName, watchedState)
    .then(() => {
      checkAndLoadContent(originalFeedName)
      .then((parsedData) => {
        renderContent(elements, parsedData);
        watchedState.feeds.push({url: originalFeedName, id: _.uniqueId()} );
        watchedState.loadingProcess.status = 'sucessful';

        const linkElements = elements.postsContainer.querySelectorAll("[target='_blank']");
        Array.from(linkElements).forEach((elem) => {
          elem.addEventListener('click', () => {
            changeDuringViewing(elem)
          })
        })

        const previewButtons = elements.postsContainer.querySelectorAll("[data-bs-target='#modal']");
        Array.from(previewButtons).forEach((button) => {
          button.addEventListener('click', () => {
            //parsed data есть
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

          })
        })
      })
      .catch((error) => {
        let errorMessageKey = ''; 
        if (error.message === i18n.t('errors.noRss')) {
          errorMessageKey = 'errors.noRss';
        } else if (error.message === 'Network response was not ok') {
          errorMessageKey = 'errors.network';
        } else {
          errorMessageKey = 'errors.unknown';
        }
        watchedState.loadingProcess.error = [i18next.t(errorMessageKey)];
        watchedState.loadingProcess.status = 'failed';
      });
    })
    .catch((error) => {
      watchedState.loadingProcess.status = 'failed'
      let errorMessageKey = 'errors.unknownError'; 
      if (error instanceof yup.ValidationError) {
        errorMessageKey = error.message === i18n.t('errors.notUrl') ? 'errors.notUrl' : 'errors.exists'; 
      } else if (error.message === 'Network response was not ok') {
        errorMessageKey = 'errors.network';
      } else {
        errorMessageKey = 'errors.unknown';
      }
      watchedState.loadingProcess.error = [i18next.t(errorMessageKey)];
      watchedState.loadingProcess.status = 'failed';
    });
  };


  initI18n()
    .then((i18nInstance) => {
      const { watchedState, renderForm, renderContent, checkNewPosts, renderWindow, changeDuringViewing} = watch(elements, i18nInstance, state);
      renderForm();
      checker(watchedState, checkNewPosts);
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState, renderContent, renderWindow, changeDuringViewing));

    });
};