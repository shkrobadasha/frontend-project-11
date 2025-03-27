import i18next from 'i18next';

export default (data) => {
    const parser = new DOMParser();
    const currentData = parser.parseFromString(data, "text/xml");
    const rssElement = currentData.querySelector("parsererror");
    if (rssElement) {
        throw new Error(i18next.t('errors.noRss'));
    };

    const feedTitle = currentData.querySelector("channel > title").textContent;
    const feedDescription = currentData.querySelector("channel > description").textContent;

    const feedItems = currentData.querySelectorAll("channel > item");
    const postsArray = Array.from(feedItems).map((item) => ({
        name: item.querySelector('title').textContent,
        url: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
    }));

    
    return {feedTitle, feedDescription, postsArray};
};