import 'babel-polyfill';

require('offline-plugin/runtime').install();


var isStarted;
var tokenTotalPDD;
var sumSecund;
var stateTest;
var testNumber;


async function updateTest() { 

  // дополним url параметрами номер теста + токен + номер попытки
  const clearURL = location.protocol + '//' + location.host + location.pathname;
  history.pushState(null, null, clearURL);

  yaCounter1051362.reachGoal('putevoditel-total_test-replace');

  const data = await getData(`https://www.kp.ru/best/pdd/update/${testNumber}/${tokenTotalPDD}/`).catch((e) => console.log(e));

  const durationTest = data.expire * 60;
  sumSecund = durationTest - (data.time_current - data.time_start);

  stateTest.questions = data.questions;

  let quizzQuestionArea = document.querySelector(".quizz");
  if(quizzQuestionArea) {
    quizzQuestionArea.style.display = "block";
  }
  let quizzSectionResultArea = document.querySelector(".section-result");
  if(quizzSectionResultArea) {
    quizzSectionResultArea.style.display = "none";
  }
  let quizzSectionMistakestArea = document.querySelector(".section-final");
  if(quizzSectionMistakestArea) {
    quizzSectionMistakestArea.style.display = "none";
  }

  if(data.status === "ok") {
    renderQuestions(data);
  } else {
    renderResults(data);
  }

}

function clickNextQuestion() {

  // send answer to server
  sendAnswer();

  
  const nextQuestionNumber = stateTest.counter + 1;
  stateTest.counter = stateTest.counter + 1;
  if(nextQuestionNumber > stateTest.questions.length) {
    // render result page
    localStorage.setItem("localTimeEndPrevTest", (new Date()).getTime());
    preparePage();
    
    
  } else {
    // else --> render next question
    renderQuestion(stateTest.questions, stateTest.questions[nextQuestionNumber - 1], nextQuestionNumber);

  }

  renderQuizzFooterSteps();
  

  

}


function renderQuestion(questions, question, counter) {

  const questionsArea = document.querySelector(".questions");
  questionsArea.innerHTML = `
    <div class="quizz-question" style="display: block;">
      <div class="quizz-head">
        <div class="quizz-headers">
          <span class="quizz-name">Вопрос ${counter}</span>
          <h2 class="quizz-title">${question.question}</h2>
        </div>
      </div>
      <div class="quizz-body">
        <div class="quizz-layout">
          <div class="quizz-aside">
            <div class="quizz-image-wrap" style="background-image: url(https://s2.stc.all.kpcdn.net/best/test/total/images/test${testNumber}/${question.id}.jpg)"></div>
          </div>
          <div class="answers">

          </div>
        </div>
        <div class="quizz-next">
          <button class="nextQuestion button blue">Далее</button>
        </div>
      </div>
    </div>`


  const answersArea = document.querySelector(".answers");
  const answers = question.answers.map((el,index) => {
    return (
      `<label class="answer-label">
        <input onchange=window.clickNextQuestion() class="answer-input" type="${question.type}" id="variantAnswer${index+1}" name="q_${question.id}">
        <span class="label-title answerLabel">${el}</span>
      </label>`
    )
  }).join('');


  answersArea.innerHTML = answers;


  // question.answers.map((el,index) => {
  //   const inputArea = document.querySelector(`#variantAnswer${index+1}`);
  //   inputArea.addEventListener("onchange", clickNextQuestion);
  // });


  stateTest = {
    questions, 
    question, 
    counter
  }


}



function renderQuizzFooterTime() {
  const quizzFooterArea = document.querySelector("#quizzFooterTime");

  quizzFooterArea.innerHTML = `
    <div class="quizz-time">
      <span class="quizz-time-title">Время</span>
      <span class="time" id="timeCounter"></span>
    </div>
  `
}

function renderQuizzFooterSteps() {
  const quantityQuestions = stateTest.questions.length;
  const quizzFooterArea = document.querySelector("#quizzFooterSteps");

  if(quizzFooterArea){
    let liItems = '';
    for(let i = 1; i <= quantityQuestions; i++) {
      let currentLabel = '';
      if(stateTest.counter === i) {
        currentLabel = 'current';
      }


      liItems = liItems + `
        <li class="step ${currentLabel}">
          ${i}
        </li>`
    }

    quizzFooterArea.innerHTML = `
      
      ${liItems}

    `

  }
}

function renderQuestions(data) {

  // получим пачку вопросов, отберем только те, на которые не было ответа ранее:
  const questions = data.questions.filter((el) => el.user_answers === undefined);

  if(questions.length&&questions.length>0){

    renderQuestion(questions, questions[0], 1);

    renderQuizzFooterSteps();
  
    renderQuizzFooterTime();
  
    startCounter();
  }
  
}

function getAnswer() {

  const answersAreaNodes = document.querySelectorAll('.answerLabel');

  let answerText = '';
  let index = 1;

  for (const node of answersAreaNodes) {
    const opacity = window.getComputedStyle(node,':before').opacity;
    if(opacity === "1") {
      if(answerText.length !== 0) {
        answerText = `,`;
      }
      answerText = `${answerText}${index}`; 
    }

    index++;
  }

  return answerText;
}

async function sendAnswer() {

  const answer = getAnswer();
  
  let content = '';

  const rawResponse = await fetch(`https://www.kp.ru/best/pdd/vote/${testNumber}/${tokenTotalPDD}/${stateTest.questions[stateTest.counter - 1].id}/?answers=${answer}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({a: 1, b: 'Textual content'})
    });
  content = await rawResponse.json();
  
}

async function getData(API){

  let content = '';

  const rawResponse = await fetch(API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({a: 1, b: 'Textual content'})
    });
  content = await rawResponse.json();

  return content;

}

function startCounter() {

  let timeArea = document.querySelector("#timeCounter");
  const timer = setInterval(()=> {

    if (sumSecund >= 1) {
      sumSecund = sumSecund - 1;

      var minutes = parseInt(sumSecund / 60);
      var timeRemaining = (sumSecund % 60);
        
      var seconds = parseInt(timeRemaining);
      
      timeArea.innerHTML = `${minutes}:${("0" + seconds).slice(-2)}`;
    } else {
      timeArea.innerHTML = `00:00`;
      clearInterval(timer);

      
      preparePage();
  

    }
  }, 1000);
}

async function renderCanvasForMediaSharing(allQuestions, rightAnswers, timeTest) {

  const canvas = document.getElementById('socialSharing');

  const context = canvas.getContext('2d');

  make_base_pic();

  async function make_base_pic()
  {
    const base_image = new Image();
    base_image.src = '../../images/testpass.jpg';
    base_image.opacity = 0.5;
    base_image.onload = async function(){
      context.drawImage(base_image, 0, 0);

      context.font = "50px arial";
      context.fillStyle = "#FFFFFF";
      context.strokeStyle = '#FFFFFF';
      context.fillText("ТЕСТ ПРОЙДЕН!", 480, 150);

      context.beginPath();
      context.arc(530, 210, 20, 1.5 * Math.PI, 1 * Math.PI);
      context.lineWidth=3;
      context.stroke();

      context.beginPath();
      context.arc(530, 210, 20, 0, 2 * Math.PI);
      context.lineWidth=1;
      context.stroke();

      context.font = "40px arial";
      context.fillStyle = "#FFFFFF";
      context.strokeStyle = '#FFFFFF';
      context.fillText(`${rightAnswers} из ${allQuestions}`, 560, 220);


      context.beginPath();
      context.arc(730, 210, 20, 1.5 * Math.PI, 0.5 * Math.PI);
      context.lineWidth=3;
      context.stroke();

      context.beginPath();
      context.arc(730, 210, 20, 0, 2 * Math.PI);
      context.lineWidth=1;
      context.stroke();

      context.font = "40px arial";
      context.fillStyle = "#FFFFFF";
      context.strokeStyle = '#FFFFFF';
      context.fillText(`${timeTest}`, 760, 220);



      // получим URL созданной на бэке картинки:
      var dataURL = canvas.toDataURL('image/jpeg');

      const rawResponse = await fetch(`https://www.kp.ru/best/pdd/share_image/${testNumber}/${tokenTotalPDD}/${stateTest.share_id}/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: dataURL
      });
    
      // обновим страницу, чтобы в og:image попала ссылка на созданную картинку:
      await window.location.reload();

    }
  }

}

function renderResults(data) {
  
  const mistakeStepsArea = document.querySelector("#checkMistakeSteps");
  if(mistakeStepsArea){
    mistakeStepsArea.innerHTML = data.questions.map((el,index) => {
      let classStep = '';
      if(el.user_right === false) {
        classStep = 'incorrect';
      }
      return (
        `<li class="step ${classStep}">${index+1}</li>`
      )
    }).join('');
  }  

  const mistakeQuestionsArea = document.querySelector("#mistakeQuestions");
  if(mistakeQuestionsArea){
    mistakeQuestionsArea.innerHTML = data.questions.map((el,index) => {
      if(el.user_right === false) {

        let userAnswer = '';
        if(el.user_answers && el.user_answers.length > 0) {
          userAnswer = el.answers[el.user_answers[0] - 1];
        }

        let right_answer = '';
        if(el.right_answers && el.right_answers.length > 0) {
          right_answer = el.answers[el.right_answers[0] - 1];
        }     

        return (
          `<article class="q-article">
          <h2 class="section-h2 blue">Вопрос ${index + 1}</h2>
          <div class="q-article-image" style="background-image: url(https://s2.stc.all.kpcdn.net/best/test/total/images/test${testNumber}/${el.id}.jpg)"></div>
          <div class="q-article-content">
            <p class="q-article-title">${el.question}</p> 
  
            <div class="answerbox">
              <div class="incorrect-answer"> 
                <div class="answerbox-text">${userAnswer}</div>
                <div class="answerbox-title">Ваш ответ</div>
              </div>
              <div class="correct-answer">
                <div class="answerbox-text">${right_answer}</div>
                <div class="answerbox-title">Правильный ответ</div>
              </div>
              <div class="descr">
                ${el.info}
              </div>
            </div>
          </div>
        </article>`
        )
      }
    }).join('');
  } 

  const resultArea = document.querySelector("#answeredQuantity");
  if(resultArea){
    resultArea.innerHTML = data.user_result;
  }
  const allNumbersArea = document.querySelector("#totalQuantity");
  if(allNumbersArea){
    allNumbersArea.innerHTML = data.questions.length;
  }
  const durationTestArea = document.querySelector("#durationTest");

  let durationTest = '';
  if(durationTestArea){
    const sumTestSeconds = data.user_time - data.time_start;
    const durationMinutes = parseInt(sumTestSeconds / 60);
    const durationSeconds = sumTestSeconds - durationMinutes * 60;
      
    durationTest = `${durationMinutes}:${("0" + durationSeconds).slice(-2)}`;

    durationTestArea.innerHTML = durationTest;
  }

  stateTest.share_id = data.share_id;

  // дополним url параметрами номер теста + токен + номер попытки


  const clearURL = location.protocol + '//' + location.host + location.pathname;
  const newURL = `${clearURL}?result=${testNumber}~${tokenTotalPDD}~${stateTest.share_id}`;
  history.pushState(null, null, newURL);

  // if(!data.share_image) {
  //   renderCanvasForMediaSharing(data.questions.length, data.user_result, durationTest);
  // }  

}

function getURLparam(key) {
  var p = window.location.search;
  p = p.match(new RegExp(key + '=([^&=]+)'));
  return p ? p[1] : false;
}

function showMistake() {
  $(".section-final").attr("tabindex",-1).focus();
}

function focusOnResultPic() {
  $(".section-result").attr("tabindex",-1).focus();
}

async function fb_shareButtonClick() {

  // const canvas = document.getElementById('socialSharing');
  // var dataURL = canvas.toDataURL('image/jpeg');

  // const idSocialNetwork = 'fb';

  // const rawResponse = await fetch(`https://www.kp.ru/best/pdd/share/${testNumber}/${tokenTotalPDD}/${stateTest.share_id}/?share=${idSocialNetwork}`, {
  //   method: 'POST',
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({pic: dataURL})
  // });
  //content = await rawResponse.json();


}


function startCounterButtonUpdate() {

  let counterUpdateButtonAllow = 10; // secunds for freez button update
  const timerUpdateButtonAllow = setInterval(()=> {

    const updateButton = document.querySelector("#updateButton");

    if (counterUpdateButtonAllow > 0) {
      counterUpdateButtonAllow = counterUpdateButtonAllow - 1;

      if(updateButton){
        updateButton.innerHTML = `Можно повторить через ${counterUpdateButtonAllow}`;
      }

    } else {

      clearInterval(timerUpdateButtonAllow);
      if(updateButton){
        updateButton.innerHTML = `Пройти заново`;
        updateButton.classList.add("active");
      }
      localStorage.removeItem("localTimeEndPrevTest");
      
    }
  }, 1000);

}

async function preparePage() {


  window.clickNextQuestion = clickNextQuestion;


  stateTest = {
    "questions":'',
    "question":'',
    "counter":1,
    "share_id":""
  }

  testNumber = "1";



  const updateButton = document.querySelector("#updateButton");
  if(updateButton){ 
    updateButton.addEventListener("click", updateTest);
    updateButton.classList.add("active");
  }

  const localTimeEndPrevTest = localStorage.getItem("localTimeEndPrevTest");
  if(localTimeEndPrevTest){
    const currDateTime = (new Date()).getTime();
    if(currDateTime - localTimeEndPrevTest < 10000) {
      updateButton.classList.remove("active");
      startCounterButtonUpdate();

    } else {
      if(updateButton){
        updateButton.classList.add("active");
      }
    }
  } else {
    if(updateButton){ 
      updateButton.classList.add("active");
    }
  }

  const showMistakeButton = document.querySelector("#showMistakeButton");
  if(showMistakeButton){ 
    showMistakeButton.addEventListener("click", showMistake);
  }


  const fb_shareButton = document.querySelector("#fb_share");
  if(fb_shareButton){ 
    fb_shareButton.addEventListener("click", fb_shareButtonClick);
  }


  tokenTotalPDD = localStorage.getItem("tokenTotalPDD");
  if(!tokenTotalPDD){
    tokenTotalPDD = uuidv4();
    localStorage.setItem("tokenTotalPDD", tokenTotalPDD);
  }

  let data = '';
  const result = getURLparam('result');
  if(result) {
    // номер теста + токен + номер попытки
    const params = result.split("~");
    if(params){
      data = await getData(`https://www.kp.ru/best/pdd/result/${params[0]}/${params[1]}/${params[2]}/`);
    }
  } else {
    data = await getData(`https://www.kp.ru/best/pdd/items/${testNumber}/${tokenTotalPDD}/`);
  }



  const durationTest = data.expire * 60;
  sumSecund = durationTest - (data.time_current - data.time_start);

  stateTest.questions = data.questions;

  if(data.status === "ok") {

    let quizzSectionResultArea = document.querySelector(".section-result");
    if(quizzSectionResultArea) {
      quizzSectionResultArea.style.display = "none";
    }
    let quizzSectionMistakestArea = document.querySelector(".section-final");
    if(quizzSectionMistakestArea) {
      quizzSectionMistakestArea.style.display = "none";
    }

    renderQuestions(data);
    
  } else {

    let quizzQuestionArea = document.querySelector(".quizz");
    let quizzSectionMistakestArea = document.querySelector(".section-final");
    let quizzSectionResultArea = document.querySelector(".section-result");

    // if(!data.share_image) {

    // } else {
      if(quizzQuestionArea) {
        quizzQuestionArea.style.display = "none";
      }
  
      
      if(quizzSectionMistakestArea) {
        quizzSectionMistakestArea.style.display = "block";
      }
  
      
      if(quizzSectionResultArea) {
        quizzSectionResultArea.style.display = "block";
      }
    //}
    
   
    renderResults(data);

    focusOnResultPic();

  }
  
  $( document ).ready(function() {
    $('.mask').hide();
  });

}

preparePage();