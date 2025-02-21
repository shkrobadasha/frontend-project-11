// нужно сделать запрос чтобы получить контент (ассинхронные операции на промисах + yup)
// нужно сделать через вотчеры
// нужно сделать проверку на валидацию(но сначала чем-то заполнить фиды)
// вотчеры закинуть в отдельный файл
import i18next from 'i18next';
import watch from './view.js';
// import { render } from 'sass';

// jnchange - для вью
// сейчас будем работать над ассинхронным запросом

const getFeedsLinks = (listOfFeeds) => {};

// НАДО ПОНЯТЬ СКОЛЬКО РЕНДЕР-ФУНКЦИЙ - ОНИ ВООБЩЕ В ОТДЕЛЬНОМ ФАЙЛЕ
const renderFeeds = (elements, initialState) => {
  // нужно обойти все элементы из стейта и не обязательно обнулять иннер каждый раз
  elements.feedsContainer.innerHTML = '';
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('card', 'border-0');
  const secondDiv = document.createElement('div');
  secondDiv.classList.add('card-body');
  const titleEl = document.createElement('h2');
  titleEl.classList.add('card-title', 'h4');
  titleEl.textContent = 'Фиды';
  secondDiv.append(titleEl);
  const ulForFeeds = document.createElement('ul');
  // нужно перейти по ссылке, получить для каждого название, мелкое название и список промисов

  initialState.feeds.forEach((feed) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3Element = document.createElement('h3');
    h3Element.classList.add('h6', 'm-0');
    const pElement = document.createElement('p');
    pElement.classList.add('m-0', 'small', 'text-black-50');
    liElement.append(h3Element, pElement);
    ulForFeeds.prepend(liElement);
  });

  firstDiv.append(secondDiv, ulForFeeds);
  elements.feedsContainer.append(firstDiv);
};

export default () => {
  const i18n = i18next.createInstance();

  const initI18n = () => {
    return new Promise((resolve, reject) => {
      i18n.init({
        lng: 'ru',
        resources: {
        },
      })
      .then(() => {
        console.log('i18next initialized successfully (Promises)');
        resolve(i18n); // Resolve с экземпляром i18n, если вам он нужен снаружи
      })
      .catch((error) => {
        console.error('i18next initialization failed (Promises)', error);
        reject(error); // Отклоните Promise в случае ошибки
      });
    });
  };
  


  const elements = {
    form: document.querySelector('form'),
    link: document.getElementById('url-input'),
    addButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    feedsLinksContainer: document.querySelector('.posts'),
  };

  // Model - структурированное хранение данных
  const initialState = {
    form: {
      // состояние формы()
    },
    loadingProcess: {
      error: '',

      // состояние процесса загрузки(loading, sucessful, failed)
    },
    uiState: {
      // id просмотренных ссылок
      seenPosts: [],
      // обычное и когда какое-то окно
      status: 'typical' //openWindow
    },
    // просто добавляются названия и все
    feeds: [],
    // здесь будет обьект, который содержит ссылки и их id
    feedsLinks: [],
  };

  // контроллер отвечает за действия пользователя
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const feedName = formData.get('url');
    // когда отправлена форма, мы проверяем:
    // 1.валидна ли rss
    // 2. потом делаем запрос(переходим по ней)
    // 3. потом делаем еще валидацию (чтобы там был норм ресурс)

    // валидацию делаем как в ф
    /* const exist = initialState.feeds.find(({ name }) => name === feedName);
    if (exist) {
      return;
    } */
    form.reset();
    form.querySelector('input').focus();
    initialState.feeds.push(feedName);
    // каждая функция отрисовки вызывается в отдельном слушателе
    // или смотрим все изменения, а потом все пихаем в рендер
    // или как-то поможет ончендж
    renderFeeds(elements, initialState);
  });

  // внизу нужно все передать в рендер для инициализации нач. сост
  // но мб надо для минм рендеров общую функцию
  // renderFeeds(elements, initialState);

  const {renderForm} = watch(elements, i18n, state);
};
