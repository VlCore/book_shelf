import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCWyWexh81Hei5s-IoZqhKe-k-Vd1tuqKU',
  authDomain: 'best-book-shelf.firebaseapp.com',
  databaseURL:
    'https://best-book-shelf-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'best-book-shelf',
  storageBucket: 'best-book-shelf.appspot.com',
  messagingSenderId: '342785973706',
  appId: '1:342785973706:web:ed93e4de8cbbab9e978333',
};
// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase();
// =============================================================================
const singUpLink = document.querySelector('.sing-up-link');
const singInLink = document.querySelector('.sing-in-link');
const singOutLink = document.querySelector('.sing-out-link');
const registrationForm = document.querySelector('.registration-modal-form');
const authorizationModal = document.querySelector('.registration-backdrop');
const singUpBtnModal = document.querySelector('.signup-btn');
const closeBtn = document.querySelector('.registration-close-btn');
const singUpBtn = [...document.querySelectorAll('.sign-up-btn')];
const singOutBtn = [...document.querySelectorAll('.sign-out-btn')];

singUpBtn.forEach(el => el.addEventListener('click', onOpenAuthMenu));

registrationForm.addEventListener('submit', singUp);

let isAuth = JSON.parse(localStorage.getItem('userAuth'));
let bookListRef;
let userRef;
if (isAuth) {
  userRef = ref(
    database,
    'users/' + JSON.parse(localStorage.getItem('userAuth'))
  );
  bookListRef = ref(
    database,
    'usersBookList/' + JSON.parse(localStorage.getItem('userAuth'))
  );
  singUpBtn.forEach(el => el.removeEventListener('click', onOpenAuthMenu));
  singOutBtn.forEach(el => el.addEventListener('click', singOuttt));
} else {
  singUpBtn.forEach(el => el.addEventListener('click', onOpenAuthMenu));
  // onOpenAuthMenu();
}

function singUpModalMarkup(event) {
  event.preventDefault();
  registrationForm.elements.userName.style.display = '';
  singUpBtnModal.textContent = 'Sign up';
  registrationForm.removeEventListener('submit', singIn);
  registrationForm.removeEventListener('submit', singUp);
  registrationForm.addEventListener('submit', singUp);
}

function singInModalMarkup(event) {
  event.preventDefault();
  registrationForm.elements.userName.style.display = 'none';
  singUpBtnModal.textContent = 'Sign in';
  registrationForm.removeEventListener('submit', singUp);
  registrationForm.removeEventListener('submit', singIn);
  registrationForm.addEventListener('submit', singIn);
}

function singUp(event) {
  event.preventDefault();
  const { userPassword, userEmail, userName } = event.target.elements;
  createUserWithEmailAndPassword(auth, userEmail.value, userPassword.value)
    .then(userCredential => {
      console.log('Signed up===>>>');
      const user = userCredential.user;
      localStorage.setItem('userAuth', JSON.stringify(user.uid));
      userRef = ref(database, 'users/' + user.uid);
      bookListRef = ref(database, 'usersBookList/' + user.uid);
      const userData = JSON.stringify({
        userName: userName.value,
        userEmail: userEmail.value,
        userPhoto: './somPhoto/',
      });
      set(userRef, userData);
      set(bookListRef, JSON.parse(localStorage.getItem('bookList')));
      document.querySelector('.user-info').classList.remove('is-hidden');
      registrationForm.reset();
      setUserInfo();
      onCloseAuthMenu();
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      console.log(errorCode);
    });
}

function singIn(event) {
  event.preventDefault();
  const { userPassword, userEmail } = event.target.elements;
  signInWithEmailAndPassword(auth, userEmail.value, userPassword.value, {
    remember: true,
  })
    .then(userCredential => {
      console.log('Signed in===>>>');
      const user = userCredential.user;
      bookListRef = ref(database, 'usersBookList/' + user.uid);
      localStorage.setItem('userAuth', JSON.stringify(user.uid));
      onValue(bookListRef, snapshot => {
        const data = snapshot.val();
        console.log(data);
        localStorage.setItem('bookList', data);
        document.querySelector('.user-info').classList.remove('is-hidden');
        registrationForm.reset();
      });
      setUserInfo();
      onCloseAuthMenu();
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
    });
}

function onCloseAuthMenu() {
  document.body.classList.remove('modal-open');
  authorizationModal.classList.add('is-hidden');
  singUpLink.removeEventListener('click', singUpModalMarkup);
  singInLink.removeEventListener('click', singInModalMarkup);
  closeBtn.removeEventListener('click', onCloseAuthMenu);
}
function onOpenAuthMenu() {
  document.body.classList.add('modal-open');
  authorizationModal.classList.remove('is-hidden');
  singUpLink.addEventListener('click', singUpModalMarkup);
  singInLink.addEventListener('click', singInModalMarkup);
  closeBtn.addEventListener('click', onCloseAuthMenu);
}

export function singOuttt() {
  signOut(auth)
    .then(() => {
      console.log('Signed out===>>>');
      userRef = null;
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userOption');
      localStorage.removeItem('bookList');
      document.querySelector('.user-info').classList.add('is-hidden');
      document.location.reload();
    })
    .catch(error => {
      console.log(error);
    });
}
function setUserInfo() {
  onValue(
    ref(database, 'users/' + JSON.parse(localStorage.getItem('userAuth'))),
    snapshot => {
      const data = snapshot.val();
      localStorage.setItem('userOption', data);
      const user = JSON.parse(data);
      window.setTimeout(() => document.location.reload(), 1000);
      // document.location.reload();
    }
  );
}

export function addToFierbase() {
  const cartDataFromLocalStorage = localStorage.getItem('bookList');
  set(bookListRef, cartDataFromLocalStorage);
}