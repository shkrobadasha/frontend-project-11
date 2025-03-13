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

// Нужна функция, которая запускается каждые 5 секунд, пробегается по массиву фидов, делает запросы(запустим через промис олл)
// когда делает запрос, то ссылка закидывает в парсер, оттуда возвращает обект с данными 
// обект с данными закидываем во вью, которая отрисовывает данные для фидов и для постов 
//в идеале нужно сравнивать посты и если там что-то обновилось, то это и отрисовать, но похуй
//нужно понять, как делать бесконечный таймер, либо сделать функцию, которая отрисуется все фиды


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
    feeds: [], //хранится их ссылка + id 
    feedsLinks: [],
  };

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
          watchedState.feeds.push({url: originalFeedName, id: _.uniqueId()} );

          form.reset();
          form.querySelector('input').focus();
        }).catch((error) => {
          let errorMessageKey = ''; 
          if (error instanceof yup.ValidationError) {
            if (error.message === i18n.t('errors.noRss')) {
              errorMessageKey = 'errors.noRss';
            } else if (error.message === 'Network response was not ok') {
              errorMessageKey = 'errors.network';
            }
          } else {
            errorMessageKey = 'errors.unknown';
          }
        });
  
          watchedState.loadingProcess.error = [i18next.t(errorMessageKey)];
          watchedState.loadingProcess.status = 'failed';
    
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
      const { watchedState, renderForm, renderContent } = watch(elements, i18nInstance, state);
      renderForm();
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState, renderContent));
    });
};

//как сделано у него: мы получаем ссылку, переходим по ней, 
// закидываем полученное в парсер (внутри парсера есть проверка на ошибки самого контента)
//если все ок закидываем в фиды эту ссылку

//есть функция, которая каждые 5 секунд ходит по всем фидам и отрисовывает фиды (то есть парсит, достает данные и все).
// Вот в ней используем промис олл