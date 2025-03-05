import i18next from 'i18next';
import watch from './view.js';
import resources from './locales/index.js';
import * as yup from 'yup';

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
      console.error('i18next initialization failed (Promises)', error);
      reject(error);
    });
  });

  const elements = {
    mainContainer: document.querySelector('.text-white'),
    form: document.querySelector('form'),
    link: document.getElementById('url-input'),
    addButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    feedsLinksContainer: document.querySelector('.posts'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const state = {
    form: {},
    loadingProcess: {
      error: [],
      status: 'notLoad'
    },
    uiState: {
      seenPosts: [],
      status: 'typical',
    },
    feeds: [],
    feedsLinks: [],
  };

  const linkProcessing = (i18n, watchedState) => (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const feedName = formData.get('url');

    const schema = yup.string().url().trim().required().notOneOf(watchedState.feeds);

    //watchedState.loadingProcess.status = 'loading'; //см надо ли оно 
    watchedState.loadingProcess.error = [];

    schema.validate(feedName, { abortEarly: false })
      .then(() => {
        
        //будем менять статус на загрузку, пока без запросов так
        watchedState.loadingProcess.status = 'successful';
        
        //буду делать запрос на сервер + проверять валидность + парсить(отдел. функция)
        watchedState.feeds.push(feedName)
        form.reset();
        form.querySelector('input').focus();
      })
      .catch((error) => {
        console.log(error.message)
        watchedState.loadingProcess.status = 'failed'
       // поменять
        let errorMessageKey = 'errors.unknownError'; 
        if (error instanceof yup.ValidationError) {
          errorMessageKey = error.message === i18n.t('errors.notUrl') ? 'errors.notUrl' : 'errors.exists'; 
        } else if (error.message === 'Network response was not ok') {
          errorMessageKey = 'errors.networkError';
        } else {
          console.error("Неизвестная ошибка:", error);
        }

        watchedState.loadingProcess.error = [i18next.t(errorMessageKey)];
        watchedState.loadingProcess.status = 'failed';
      });
  };

  initI18n()
    .then((i18nInstance) => {
      const { watchedState, renderForm } = watch(elements, i18nInstance, state);
      renderForm();
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState));
    });
};