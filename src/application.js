
console.log('hello')
import i18next from 'i18next';
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
        resolve(i18n); 
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


  initI18n()
    .then((i18nInstance) => {
      const { renderForm } = watch(elements, i18nInstance, state);
      renderForm();
    });
};
