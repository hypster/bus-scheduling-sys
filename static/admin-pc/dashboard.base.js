'use strict'

function LoginSession () {
  return LoginSession.getSession()
}

LoginSession.setSession = function (session) {
  localStorage.setItem('__loginSession', JSON.stringify(session))
}
LoginSession.getSession = function () {
  try {
    return JSON.parse(localStorage.getItem('__loginSession'))
  } catch (error) {
    return null
  }
}

var __session = new LoginSession()
