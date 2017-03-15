angular.module('starter')
 
.service('AuthService', function($q, $http, API_ENDPOINT,$ionicLoading) {
  $http.defaults.headers.post['My-Header']='value';
  $http.defaults.headers.post["Content-Type"] = "text/plain";
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;
 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }
 
  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }
 
  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common.auth_token = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }
 

 
  var login = function(user) {  
     $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });
    return $q(function(resolve, reject) {
      // var params = {user, "app_id": "demo_fidelty","date_stamp": "1433203820","hash": "4C50012CB6410FBAA8BDC63ADA4B43F5DF0D0392C9444F23DB42612BD22A0EA4"}
      $http.post(API_ENDPOINT.url + '/authenticate?app_id=fidelity&date_stamp=1433203820&email='+ user.email+ '&password=' + user.Password + '&hash=b14c16d0ceb0ce7275159906ab59f449f6c4691a1c33cd5047e3e2afd7b8bbe3').then(function(result) {        console.log(result)
        if (result.data.result = 'Success') {
          storeUserCredentials(result.data.response.auth_token);
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });


    });
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  loadUserCredentials();
 
  return {
    login: login,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
  };
})
 
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});