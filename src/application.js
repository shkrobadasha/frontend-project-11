
const renderFeeds = (elements, initialState) => {
  elements.feedsContainer.innerHTML = '';
  const firsDiv = document.createElement('div');
  firsDiv.classList.add('card', 'border-0'); 
  const secondDiv = document.createElement('div');
  secondDiv.classList.add('card-body');
  secondDiv.innerHTML = '<h2 class="card-title h4"›Фиды</h2>';
  const ulForFeeds = document.createElement('ul');
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

  firsDiv.append(secondDiv, ulForFeeds);
};


export default () => {
  const elements = {
    form: document.querySelector('[class="form-floating"]'),
    link: document.getElementById('url-input'),
    addButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    feedsLinksContainer: document.querySelector('.posts'),
  };

  // Model
  const initialState = {
    feeds: [],
    feedsLinks: [],
  };


  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('preventDefault called');
    const form = e.target;
    const formData = new FormData(form);
    const feedName = formData.get('url');
    const exist = initialState.feeds.find(({ name }) => name === feedName);
    if (exist) {
      return;
    }
    form.reset();
    form.querySelector('input').focus();
    initialState.feeds.push(feedName);
    renderFeeds(initialState, elements);
  });
};
