import i18next from 'i18next';
import { validate } from 'webpack';
import watch from './view.js';
import resources from './locales/index.js';

export default () => {
  const i18n = i18next.createInstance();

  const initI18n = () => new Promise((resolve, reject) => {
    i18n.init({
      lng: 'ru',
      resources,
    })
      .then(() => {
        console.log('i18next initialized successfully (Promises)');
        console.log(i18n.options.resources);
        resolve(i18n); // Resolve с экземпляром i18n, если вам он нужен снаружи
      })
      .catch((error) => {
        console.error('i18next initialization failed (Promises)', error);
        reject(error); // Отклоните Promise в случае ошибки
      });
  });

  const elements = {
    mainContainer: document.querySelector('.text-white'),
    form: document.querySelector('form'),
    link: document.getElementById('url-input'),
    addButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    feedsLinksContainer: document.querySelector('.posts'),
  };

  // Model - структурированное хранение данных
  const state = {
    form: { },
    loadingProcess: {
      error: '',
      // состояние процесса загрузки(loading, sucessful, failed)
    },
    uiState: {
      // id просмотренных ссылок
      seenPosts: [],
      // обычное и когда какое-то окно
      status: 'typical', // openWindow
    },
    // просто добавляются названия и все
    feeds: [],
    // здесь будет обьект, который содержит ссылки и их id
    feedsLinks: [],
  };

  elements.form.addEventListener('submit', (e) => {
  });

  // внизу нужно все передать в рендер для инициализации нач. сост
  // но мб надо для минм рендеров общую функцию
  // renderFeeds(elements, initialState);

  initI18n()
    .then((i18nInstance) => {
      const { renderForm } = watch(elements, i18nInstance, state);
      renderForm();
    });
};
