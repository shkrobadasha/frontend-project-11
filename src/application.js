import i18next from 'i18next';
import _ from 'lodash';
import watch from './view.js';
import dataParser from './parser.js';
import resources from './locales/index.js';
import * as yup from 'yup';
import axios from 'axios';
 
const getProxyUrl = (link) => {
  return `https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`;
}
 
const getUrl = (arrayOfFeeds) => {
  return arrayOfFeeds.map((item) => item.url);
}
 
const beforeParser = (url) => {
  return new Promise((resolve, reject) => {
    const newUrl = getProxyUrl(url);
    axios.get(newUrl)
    .then(response => {
      const parsedData = dataParser(response.data.contents);
      resolve(parsedData);
 
    })
    .catch((error) => {
      reject(error)
    })
  })
};
 
//нужно разобраться с обработкой ошибок и использованием финали 
 
 
export default () => {
  const i18n = i18next.createInstance();
  const initI18n = () => new Promise((resolve, reject) => {
    i18next.init({
      lng: 'ru',
      resources,
    })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: () => i18next.t('errors.exists'),
        },
        string: {
          url: () => i18next.t('errors.notUrl'),
        },
      });
      resolve(i18next);
    })
    .catch((error) => {
      reject(error);
    });
  });
 
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
    form: {},
    loadingProcess: {
      error: [],
      status: 'notLoad'
    },
    uiState: {
      seenPosts: [],//там айди просмотренных постов
      status: 'typical',
    },
    feeds: [], //хранится их ссылка + id - поменять мб только на ссылки(?) зачем id 
    readPosts: [],
  };
 
 
  const checker = (watchedState, checkNewPosts, timeout = 5000) => {
    const check = () => {
      const promises = watchedState.feeds.map((feed) => {
        beforeParser(feed)
        .then((parsedData) => {
          checkNewPosts(parsedData.postsArray, elements)
        }).catch((error) => {
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
      .then(() => {
        setTimeout(check, timeout)
      })
      .catch(() => {
        setTimeout(check, timeout)
      })
    };
    check()
  }
 
  const linkProcessing = (i18n, watchedState, renderContent) => (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const originalFeedName = formData.get('url');
 
 
    const schema = yup.string().url().trim().required().notOneOf(getUrl(watchedState.feeds));
    watchedState.loadingProcess.error = [];
    schema.validate(originalFeedName, { abortEarly: false })
      .then(() => {
        beforeParser(originalFeedName)
        .then((parsedData) => {
          renderContent(elements, parsedData)
          watchedState.feeds.push(originalFeedName);
          watchedState.feeds.push({url: originalFeedName, id: _.uniqueId()} );
          form.reset();
          form.querySelector('input').focus();
        }).catch((error) => {
          //вот здесь не отрабатывает ошибка 
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
       // нужно будет убрать что типа пока грузится сразу ошибка выпадает 
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
      const { watchedState, renderForm, renderContent, checkNewPosts } = watch(elements, i18nInstance, state);
      renderForm();
      checker(watchedState, checkNewPosts);
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState, renderContent));
    });
};