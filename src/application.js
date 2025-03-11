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

// Нужна функция, которая запускается каждые 5 секунд, пробегается по массиву фидов, делает запросы(запустим через промис олл)
// когда делает запрос, то запускает функцию из вью, которая отрисовывает данные для фидов и для постов (ее запускает парсер)
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
      seenPosts: [],//там айди просмотренных постов
      status: 'typical',
    },
    feeds: [], //хранится их ссылка + id 
    feedsLinks: [],
  };

  const linkProcessing = (i18n, watchedState) => (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const originalFeedName = formData.get('url');

    const schema = yup.string().url().trim().required().notOneOf(getUrl(watchedState.feeds));
    //watchedState.loadingProcess.status = 'loading'; //см надо ли оно 
    //надо но из-за этого показывает, что отрабатывает
    //можно сделать валидацию по различным состояниям формы
    watchedState.loadingProcess.error = [];
    schema.validate(originalFeedName, { abortEarly: false })
      .then(() => {
        //здесь будем вызывать наш новый парсер
        const newUrl = getProxyUrl(originalFeedName);
        axios.get(newUrl)
        .then(response => {
          dataParser(response.data.contents);
          watchedState.feeds.push({url: originalFeedName, id: _.uniqueId()} );
          form.reset();
          form.querySelector('input').focus();
        }).catch((error) => {

          watchedState.loadingProcess.status = 'failed'
          let errorMessageKey = 'errors.unknownError'; 
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
      
        //будем менять статус на загрузку, пока без запросов так
        //watchedState.loadingProcess.status = 'successful';
        //делаем запрос,проверяем валидность, скачиваем поток, отправляем в парсер и только потом все отрисовываем
        
        //буду делать запрос на сервер + проверять валидность + парсить(отдел. функция)
        //запросы будем делать через ахиос 

        //здесь делаем функцию, которая получает из воч стейт перечень фидов 
        //то есть если все ок, то получаем промис из всех фидов 


        //переходим по ссылке, введенной пользователем, используем ахиос и гет
        //потом скачиваем этот поток и парсим (передаем полученное в функцию)


        //watchedState.feeds.push(feedName)
    
      })
      .catch((error) => {
        watchedState.loadingProcess.status = 'failed'
       // поменять
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
      const { watchedState, renderForm } = watch(elements, i18nInstance, state);
      renderForm();
      elements.form.addEventListener('submit', linkProcessing(i18nInstance, watchedState));
    });
};

//как сделано у него: мы получаем ссылку, переходим по ней, 
// закидываем полученное в парсер (внутри парсера есть проверка на ошибки самого контента)
//если все ок закидываем в фиды эту ссылку

//есть функция, которая каждые 5 секунд ходит по всем фидам и отрисовывает фиды (то есть парсит, достает данные и все).
// Вот в ней используем промис олл