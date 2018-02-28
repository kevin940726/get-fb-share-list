import { stringify, parse } from 'query-string';

const FB_APP_ID = '1194708157326815';
const FB_SDK_VERSION = 'v2.12';

const loadFBSDK = new Promise(resolve => {
  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/sdk.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    window.FB.init({
      appId: FB_APP_ID,
      cookie: true,
      xfbml: true,
      version: FB_SDK_VERSION,
    });

    window.FB.AppEvents.logPageView();

    resolve(window.FB);
  };
  document.head.appendChild(script);
});

const createRequest = request => loadFBSDK.then(request);

export const getAccessToken = () => {
  const { access_token: accessToken } = parse(window.location.hash);

  return accessToken;
};

export const login = () => {
  const accessToken = getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  return window.location.assign(
    `https://www.facebook.com/v2.12/dialog/oauth?${stringify({
      client_id: FB_APP_ID,
      redirect_uri: 'https://www.facebook.com/connect/login_success.html',
      response_type: 'token',
    })}`,
  );
};

export const getUsersInfo = (users, accessToken) =>
  createRequest(FB => {
    FB.api(
      `/?${stringify({
        ids: users.join(','),
        fields: ['age_range', 'birthday', 'gender'].join(','),
      })}`,
      'get',
      { access_token: accessToken },
      response => {
        console.log(response);
      },
    );
  });
