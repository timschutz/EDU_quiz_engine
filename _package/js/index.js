// init scorm

pipwerks.SCORM.init();

var genClick = new Howl({src: ['audio/mfx_tic33.mp3']});
var sndCorrect = new Howl({src: ['audio/535840__evretro__8-bit-mini-win-sound-effect.mp3']});
var sndIncorrect = new Howl({src: ['audio/450616__breviceps__8-bit-error.mp3']});
var sndComplete = new Howl({src: ['audio/complete.mp3']});
var bgLoop = new Howl({src: ['audio/bg_loop2.ogg'],loop: true,});

let Qcontainer = document.getElementById('q-text');
let Acontainer = document.getElementById('a-text');
let CBcontainer = document.getElementById('cont');
let STARTbutton = document.getElementById('start');
let STARTcontainer = document.getElementById('start-container');
let ANIMcontainer = document.getElementById('q-sheet');
let Qtracker = document.getElementById('tracker');
let PROMPTcontainer = document.getElementById('prompt');
let SUMMcontainer = document.getElementById('summary');

let xml = '';
let numQuestions = 0;
let qNum = 0;
let multiClicked = false;
let inputClicked = false;
let userInput = '';
let expertInput = '';
let currScore = 0;
let passingScore = 0;
let trackerArray = [];

// =======================================================
// ===============  INGESTING THE XML  ===================
// =======================================================

document.addEventListener('DOMContentLoaded', ()=>{let url = 'question_content.xml';
  fetch(url)
  .then(response=>response.text())
  .then(data=>{
    let parser = new DOMParser();
    xml = parser.parseFromString(data, "application/xml");
    // buildQuestionElements(xml);
    startPage(xml);
    let qCount = xml.children[0].getElementsByTagName('question');
    numQuestions = qCount.length;
  });

  // inserting the header text for the summary page
  let summQuestionHeader = document.createElement('div');
  summQuestionHeader.setAttribute('id', 'summ-header'); 
  SUMMcontainer.appendChild(summQuestionHeader); 
})

// ========================================================
// =============  DISPLAY THE START PAGE  =================
// ========================================================

function startPage(xml){
  let startBtn = document.createElement('button');
  startBtn.innerHTML = "Begin";
  startBtn.className = 'btn-start';
  startBtn.addEventListener('click', function (){
    beginQuiz(xml);
  });
  startBtn.setAttribute('onmouseover', 'btnBig(this)');
  startBtn.setAttribute('onmouseout', 'btnSm(this)');
  STARTbutton.appendChild(startBtn);
}

function btnBig(btn){
  gsap.to(btn, {scale: 0.98, duration: 0.5, ease: "expo"});
}

function btnSm(btn){
  gsap.to(btn, {scale: 1.0, duration: 0.5, ease: "expo"});
}

// =======================================================================================
// =============  FUNCTIONS TO BEGIN THE QUIZ AND REMOVE THE START PAGE  =================
// =======================================================================================

function beginQuiz(xml){
  genClick.play();
  buildTracker(xml);
  buildQuestionElements(xml);
  gsap.to(STARTcontainer, {opacity: 0, duration: 2, ease: "expo", onComplete: remStart});
}

function remStart(){
  STARTcontainer.remove();
}

// =======================================================
// =============  BUILDING TRACKER DOTS  =================
// =======================================================

function buildTracker(x){
  let answerData = x.children[0].getElementsByTagName('question');

  for(let i=0; i<answerData.length; i++){
    let trackerSquare = document.createElement('div');
    trackerSquare.setAttribute('id', 'trackerSquare');
    Qtracker.appendChild(trackerSquare);
    trackerArray.push(trackerSquare);
    gsap.from(trackerSquare, {opacity: 0, duration: 1.2, delay: 1, ease: "expo"});
  }
}

// ===============================================================================
// =============  GETTING QUESTION TYPE, DISPLAYING PROMPT TEXT  =================
// =============  & DISPLAYING ANSWER BUTTONS                    =================
// ===============================================================================

function buildQuestionElements(x){
  trackerArray[qNum].setAttribute('id', 'trackerSquareComplete');
  gsap.to(trackerArray[qNum], {scale: 1.5, duration: 0.5, ease: "expo"});
  gsap.to(trackerArray[qNum], {scale: 1, duration: 0.5, delay: 0.5, ease: "expo"});

  // extract question text

  let questionData = x.children[0].getElementsByTagName('question');
  let questionBlock = document.createElement('h1');
  questionBlock.setAttribute('id', 'question');
  questionBlock.className = 'balloon balloon-right';
  questionBlock.innerText = questionData[qNum].getAttribute('txt');
  Qcontainer.appendChild(questionBlock);
  gsap.from(Qcontainer, {opacity: 0, scale: 0.2, duration: 1, delay: 1, ease: "expo", onComplete: animQuestion});

  // adding user results to summary div !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  let summQuestionContainer = document.createElement('div');
  let currQ = 'sq' + qNum;
  summQuestionContainer.setAttribute('id', currQ);
  summQuestionContainer.className = 'summ-question';
  summQuestionContainer.innerHTML = "<span id='q-style'>" + 'Q' + (qNum + 1) + "</span>" + questionData[qNum].getAttribute('txt'); 
  SUMMcontainer.setAttribute('id', 'summary');
  SUMMcontainer.appendChild(summQuestionContainer); 

  let qType = questionData[qNum].getAttribute('type'); 

  // extract prompt text

  let qPrompt = document.createElement('div');
  qPrompt.setAttribute('id', 'q-prompt');
  let qText = document.createTextNode(questionData[qNum].getAttribute('prompt'));
  qPrompt.appendChild(qText);
  PROMPTcontainer.appendChild(qPrompt);
  gsap.from(qPrompt, {opacity: 0, duration: 0.8, delay: 2.5, ease: "expo"});
  
  // extract answers text and display

  let answerData = x.children[0].children[qNum].getElementsByTagName('answer');
  let passingScore = x.children[0].getAttribute('passingScore');
  console.log('PASSING SCORE IS: ' + passingScore);

  // extracting expert answer for the user input type

  expertInput = answerData[0].innerHTML;

  // building answer buttons based on question type 

  for(let i=0; i<answerData.length; i++){
    let answerList = document.createElement('button');

    if(qType == 'single'){
      // console.log('SINGLE');
      answerList.className = 'btn-answer btn-style';
      answerList.setAttribute('id', answerData[i].getAttribute('id'));
      answerList.setAttribute('onmouseover', 'btnBig(this)');
      answerList.setAttribute('onmouseout', 'btnSm(this)');
      answerList.addEventListener('click', checkIfCorrect, false);
      answerList.innerText = answerData[i].innerHTML;
      Acontainer.appendChild(answerList);

      gsap.from(answerList, {opacity: 0, scale: 0.8, duration: 0.8, delay: 3 + (i * 0.1), ease: "expo"});
    }else if(qType == 'multi'){
      // console.log('MULTI');
      answerList.className = 'btn-answer multi-global btn-multi';
      answerList.setAttribute('id', answerData[i].getAttribute('id'));
      answerList.setAttribute('onmouseover', 'multiHover(this)');
      answerList.setAttribute('onmouseout', 'multiOut(this)');
      answerList.setAttribute('wasClicked', 'false');
      answerList.addEventListener('click', multiChoiceClicked, false);
      answerList.innerText = answerData[i].innerHTML;
      Acontainer.appendChild(answerList);
      gsap.from(answerList, {opacity: 0, scale: 0.8, duration: 0.8, delay: 3 + (i * 0.1), ease: "expo"});
    }else{
      // console.log('INPUT');
      displayInputBox();
    }
  }
  
  // scorm

  let currentQuestion = Number(qNum) + 1;
  pipwerks.SCORM.set('cmi.core.lesson_location', currentQuestion);
  pipwerks.SCORM.set('cmi.core.score.min', 0);
  pipwerks.SCORM.set('cmi.core.score.max', numQuestions);
  pipwerks.SCORM.save();

  // console.log('There are ' + numQuestions + ' questions total');
  // console.log('You are on question ' + currentQuestion + ' of ' + numQuestions);
}

// =======================================================
// ==================== SINGLE SELECT ====================
// =======================================================

function checkIfCorrect(){
  genClick.play();

  let isCorrect = this.getAttribute('id');
  let clicked = this;

  if(isCorrect == 'correct'){
    correct();
  }else{
    incorrect(clicked);
  }
}

// if correct, do this

function correct(){
  sndCorrect.play();

  let isCorrect = document.getElementById('correct');
  isCorrect.className = 'buttonCorrect btn-style btn-success btn-kill-pointer';
  isCorrect.removeAttribute('onmouseover');
  isCorrect.removeAttribute('onmouseout');

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);

    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'btn-style btn-disabled';
      remContainer.children[i].removeAttribute('onmouseover');
      remContainer.children[i].removeAttribute('onmouseout');
    }
  }

  // adding user results to summary div !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
  let currQ = 'sq' + qNum;
  let qIcon = document.getElementById(currQ);
  qIcon.classList.add('summ-correct');
  for(let i=0; i<remCount; i++){
    let cln = remContainer.children[i].cloneNode(true);
    cln.classList.add('btn-kill-pointer');
    SUMMcontainer.appendChild(cln);
  }
  let qBorder = document.createElement('div');
  qBorder.className = 'summ-border';
  qBorder.innerText = 'AAA';
  SUMMcontainer.appendChild(qBorder);

  showContButton();
  animSuccess();

  // scorm for single select correct

  currScore = currScore + 1;
  pipwerks.SCORM.set('cmi.core.score.raw', currScore);
  console.log('You have ' + currScore + ' out of ' + numQuestions + ' questions correct');
  pipwerks.SCORM.save();
}

// if incorrect, do this

function incorrect(x){
  sndIncorrect.play();

  let isCorrect = document.getElementById('correct');
  isCorrect.className = 'buttonCorrect btn-style btn-success btn-kill-pointer';
  isCorrect.removeAttribute('onmouseover');
  isCorrect.removeAttribute('onmouseout');
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);
    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'btn-style btn-disabled';
      remContainer.children[i].removeAttribute('onmouseover');
      remContainer.children[i].removeAttribute('onmouseout');
    }
  }

  x.className = 'buttonIncorrect btn-style btn-fail btn-kill-pointer';

  // adding user results to summary div !!!!!!Q1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  let currQ = 'sq' + qNum;
  let qIcon = document.getElementById(currQ);
  qIcon.classList.add('summ-incorrect');
  for(let i=0; i<remCount; i++){
    let cln = remContainer.children[i].cloneNode(true);
    cln.classList.add('btn-kill-pointer');
    SUMMcontainer.appendChild(cln);
  }
  let qBorder = document.createElement('div');
  qBorder.className = 'summ-border';
  qBorder.innerText = 'AAA';
  SUMMcontainer.appendChild(qBorder);

  showContButton();
  animFail();

  console.log('You have ' + currScore + ' out of ' + numQuestions + ' questions correct');
}

// =======================================================
// ==================== MULTI SELECT =====================
// =======================================================

function multiChoiceClicked(){
  if(multiClicked == false){
    showSubmitButton();
  }

  multiClicked = true;

  genClick.play();
  
  let cStatus = this.getAttribute('wasClicked');
  
  if(cStatus == 'false'){
    this.className = 'btn-answer multi-global btn-multi-selected multi-global-selected';
    this.setAttribute('wasClicked', 'true');
    this.removeAttribute('onmouseover');
    this.removeAttribute('onmouseout');
  }else{
    this.classList.remove('btn-multi-selected');
    this.className = 'btn-answer multi-global btn-multi';
    this.setAttribute('wasClicked', 'false');
    this.setAttribute('onmouseover', 'multiHover(this)');
    this.setAttribute('onmouseout', 'multiOut(this)');
  }
}

function showSubmitButton(){
  let submitBtn = document.createElement('button');
  submitBtn.innerHTML = "Submit";
  submitBtn.setAttribute('id', 'continueButton');
  // submitBtn.className = 'btn-util';
  submitBtn.addEventListener('click', checkMultiCorrect, false);
  submitBtn.setAttribute('onmouseover', 'btnBig(this)');
  submitBtn.setAttribute('onmouseout', 'btnSm(this)');
  CBcontainer.appendChild(submitBtn);
  gsap.from(submitBtn, {opacity: 0, scale: 0.6, duration: 0.6, ease: "expo"});
}

function checkMultiCorrect(){
  let submitBtn = document.getElementById('continueButton');
  gsap.to(submitBtn, {opacity: 0, scale: 0.6, duration: 0.6, ease: "expo", onComplete: removeSubmit});

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  let anyCorrect = true;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeAttribute('onmouseover');
    remContainer.children[i].removeAttribute('onmouseout');
    remContainer.children[i].removeEventListener('click', multiChoiceClicked); //??????????????????????????????????????????????????????????????????????

    if(remContainer.children[i].id == 'correct' && remContainer.children[i].getAttribute('wasClicked') == 'true'){
      remContainer.children[i].className = 'buttonCorrect multi-global btn-multi-selected_correct btn-kill-pointer multi-global-selected';
    }else if(remContainer.children[i].id == 'null' && remContainer.children[i].getAttribute('wasClicked') == 'true'){
      anyCorrect = false;
      remContainer.children[i].className = 'buttonIncorrect multi-global btn-multi-selected_incorrect btn-kill-pointer multi-global-selected';
    }else if(remContainer.children[i].id == 'correct' && remContainer.children[i].getAttribute('wasClicked') == 'false'){
      anyCorrect = false;
      remContainer.children[i].className = 'buttonCorrect multi-global btn-multi-up_correct btn-kill-pointer';
    }
    remContainer.children[i].classList.add('btn-kill-pointer');
  }

  let currQ = 'sq' + qNum;
  let qIcon = document.getElementById(currQ);

  if(anyCorrect == true){
    sndCorrect.play();
    animSuccess();

    qIcon.classList.add('summ-correct');

    // scorm for mutiple choice

    currScore = currScore + 1;
    pipwerks.SCORM.set('cmi.core.score.raw', currScore);
    console.log('You have ' + currScore + ' out of ' + numQuestions + ' questions correct');
    pipwerks.SCORM.save();
  }else{
    sndIncorrect.play();
    animFail();

    qIcon.classList.add('summ-incorrect');
  }

  // adding user results to summary div !!!!!!Q1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  for(let i=0; i<remCount; i++){
    let cln = remContainer.children[i].cloneNode(true);
    cln.classList.add('btn-kill-pointer');
    SUMMcontainer.appendChild(cln);
  }
  let qBorder = document.createElement('div');
  qBorder.className = 'summ-border';
  qBorder.innerText = 'AAA';
  SUMMcontainer.appendChild(qBorder);
}

function removeSubmit(){
  document.getElementById('continueButton').remove();
  showContButton();
  multiClicked = false;
}

// hover states for answer buttons

function multiHover(btn){
  btn.className = 'btn-answer multi-global btn-multi-hover';
}

function multiOut(btn){
  btn.className = 'btn-answer multi-global btn-multi';
}

// =======================================================
// ===================== USER INPUT ======================
// =======================================================

function displayInputBox(){
  let inputContainer = document.createElement('div');
  inputContainer.className = 'input-container';
  inputContainer.setAttribute('id', 'input-cont');
  Acontainer.appendChild(inputContainer);

  let inputBox = document.createElement('textarea');
  inputBox.setAttribute('type', 'text');
  inputBox.setAttribute('id', 'u-input');
  
  inputBox.className = 'user-input';
  inputBox.addEventListener('keypress', checkSubmit);
  inputContainer.appendChild(inputBox);
  
  gsap.from(inputBox, {opacity: 0, duration: 0.8, delay: 3, ease: "expo"});
}

function checkSubmit(){
  userInput = document.getElementById('u-input').value;
  if(inputClicked == false){
    showInputSubmitButton();
    inputClicked = true;
  }
}

function showInputSubmitButton(){
  let submitBtn = document.createElement('button');
  submitBtn.innerHTML = "Submit";
  submitBtn.setAttribute('id', 'continueButton');
  // submitBtn.className = 'btn-util';
  submitBtn.addEventListener('click', compareAnswers, false);
  submitBtn.setAttribute('onmouseover', 'btnBig(this)');
  submitBtn.setAttribute('onmouseout', 'btnSm(this)');
  CBcontainer.appendChild(submitBtn);
  gsap.from(submitBtn, {opacity: 0, scale: 0.6, duration: 0.6, ease: "expo"});
}

function compareAnswers(){
  genClick.play();
  animSuccess();
  let initPrompt = document.getElementById('q-prompt');
  gsap.to(initPrompt, {opacity: 0, duration: 0.8, ease: "expo"});
  let initInput = document.getElementById('u-input');
  gsap.to(initInput, {opacity: 0, duration: 0.8, ease: "expo"});
  let contBtn = document.getElementById('continueButton');
  gsap.to(contBtn, {opacity: 0, duration: 0.8, ease: "expo", onComplete: remPrompt});
}

function remPrompt(){
  document.getElementById('continueButton').remove();
  document.getElementById('q-prompt').remove();
  document.getElementById('u-input').remove();
  document.getElementById('input-cont').remove();

  showResults();
}

function showResults(){
  
  let titleContainer = document.createElement('div');
  titleContainer.className = 'title-container';
  titleContainer.setAttribute('id', 'title-cont');
  Acontainer.appendChild(titleContainer);


  let uTitle = document.createElement('div');
  uTitle.setAttribute('id', 'user-title');
  let uTitleText = document.createTextNode("Your Answer");
  uTitle.appendChild(uTitleText);
  titleContainer.appendChild(uTitle);

  let eTitle = document.createElement('div');
  eTitle.setAttribute('id', 'expert-title');
  let eTitleText = document.createTextNode("Expert Answer");
  eTitle.appendChild(eTitleText);
  titleContainer.appendChild(eTitle);

  
  let inputContainer = document.createElement('div');
  inputContainer.className = 'input-container';
  inputContainer.setAttribute('id', 'input-cont');
  Acontainer.appendChild(inputContainer);

  let userAnswer = document.createElement('div');
  userAnswer.className = 'user-input-display';
  let userAnswerText = document.createTextNode(userInput);
  userAnswer.appendChild(userAnswerText);
  inputContainer.appendChild(userAnswer);

  let expertAnswer = document.createElement('div');
  expertAnswer.className = 'expert-input-display';
  let expertAnswerText = document.createTextNode(expertInput);
  expertAnswer.appendChild(expertAnswerText);
  inputContainer.appendChild(expertAnswer);

  gsap.from(uTitle, {opacity: 0, scale: 0.7, duration: 1.2, delay: 0, ease: "expo"});
  gsap.from(userAnswer, {opacity: 0, scale: 0.7, duration: 1.2, delay: 0.2, ease: "expo"});

  gsap.from(eTitle, {opacity: 0, scale: 0.7, duration: 1.2, delay: 1.5, ease: "expo"});
  gsap.from(expertAnswer, {opacity: 0, scale: 0.7, duration: 1.2, delay: 1.7, ease: "expo"});

  showContButton();

  // scorm for user input

  currScore = currScore + 1;
  pipwerks.SCORM.set('cmi.core.score.raw', currScore);
  console.log('You have ' + currScore + ' out of ' + numQuestions + ' questions correct');
  pipwerks.SCORM.save();
}

// =======================================================
// ========= DISPLAY CONTINUE BUTTON AFTER ANSWER ========
// =======================================================

function showContButton(){
  let contBtn = document.createElement('button');
  contBtn.innerHTML = "Continue";
  contBtn.setAttribute('id', 'continueButton');
  // contBtn.className = 'btn-util';
  contBtn.addEventListener('click', animElementsOff, false);
  contBtn.setAttribute('onmouseover', 'btnBig(this)');
  contBtn.setAttribute('onmouseout', 'btnSm(this)');
  CBcontainer.appendChild(contBtn);
  gsap.from(contBtn, {opacity: 0, scale: 0.6, duration: 0.6, delay: 0.5, ease: "expo"});
}

// =======================================================
// =========== ANIMATE ALL ELEMENTS OFF SCREEN ===========
// =======================================================

function animElementsOff(){
  animIdle();

  genClick.play();

  let animOff = document.getElementById('question');
  gsap.to(animOff, {opacity: 0, scale: 0.4, duration: 0.5, ease: "back.in"});

  let remPrompt = document.getElementById('q-prompt');
  gsap.to(remPrompt, {opacity: 0, scale: 0.4, duration: 0.5, ease: "back.in"});

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    gsap.to(remContainer.children[i], {opacity: 0, scale: 0.4, duration: 0.5, delay: 0.1 + (i * 0.1), ease: "back.in"});
  }

  let animContOff = document.getElementById('continueButton');
  gsap.to(animContOff, {opacity: 0, scale: 0.4, duration: 0.5, delay: 0.8, ease: "back.in", onComplete: removeOldQuestion});
}

// ===========================================================
// ========= DISPLAY NEXT QUESTION OR SUMMARY SCREEN ========
// ===========================================================

function removeOldQuestion(){
  // resetting input type variables
  inputClicked = false;
  userInput = '';
  expertInput = '';

  document.getElementById('question').remove();
  document.getElementById('continueButton').remove();
  document.getElementById('q-prompt').remove();
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.firstChild.remove();
  }
  
  if(qNum == numQuestions - 1){
    
    // scorm

    let passingScoreCalc = currScore / numQuestions;
    if(passingScoreCalc > passingScore){
      pipwerks.SCORM.set('cmi.core.lesson_status', 'passed');
    }else{
      pipwerks.SCORM.set('cmi.core.lesson_status', 'failed');
    }
    
    pipwerks.SCORM.save();

    bgLoop.pause();

    animIdle();

    sndComplete.play();

    document.getElementById('tracker').remove();

    let finalDiv = document.createElement('h1');
    finalDiv.className = 'balloon balloon-right';
    finalDiv.innerText = 'Way to go champ! You finished!!';
    Qcontainer.appendChild(finalDiv);

    let qScores = document.getElementById('summ-header');
    qScores.innerHTML = 'You got '+ currScore + ' out of ' + numQuestions + ' correct.';
    SUMMcontainer.removeAttribute('summary');
    SUMMcontainer.setAttribute('id', 'summary-reveal'); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  }else{
    qNum = qNum + 1;
    buildQuestionElements(xml);
  }
} 

// ===============================================================
// =============== ANIMATION TRIGGERS FOR GUY ====================
// ===============================================================

function animIdle(){
  ANIMcontainer.className = 'a-idle';
}

function animQuestion(){
  ANIMcontainer.className = 'a-question';
}

function animSuccess(){
  ANIMcontainer.className = 'a-success';
}

function animFail(){
  ANIMcontainer.className = 'a-fail';
}