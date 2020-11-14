function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + 200000000);
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function authSuccess(){
  location.replace("/profile");
}
function authFail(){
  location.replace("/");
}

function genRandUser(){
  return(false);
}

function cookieCheck(){
  var cookies = document.cookie;
  cookies = cookies.split(";");
  for (var i = 0; i < cookies.length; i++){
    var key = cookies[i].split("=")[0];
    if (key.localeCompare(" userid") == 0 || key.localeCompare("userid") == 0){
      return(true);
    }
  }
  return(false);
}

function getUserId(){
  var cookies = document.cookie;
  var state = false;
  cookies = cookies.split(";");
  for (var i = 0; i < cookies.length; i++){
    var key = cookies[i].split("=")[0];
    var sotr = cookies[i].split("=")[1];
    if (key.localeCompare(" userid") == 0 || key.localeCompare("userid") == 0){
      return (sotr);
    }
  }
  return (false);
}

function checkFormState(){

  var class_1 = document.getElementById("class_1").value;

  var class_2 = document.getElementById("class_2").value;

  var club_1 = document.getElementById("club_1").value;

  var results = [class_1, class_2, club_1]
  return (results)
}

function createUserCard(name, email, class_1, class_2, club_1, id){
  console.log('yes');
  var newCol = document.createElement('div');
  newCol.className = "col";
  newCol.style.padding = "10px";

  var newCard = document.createElement('div');
  newCard.className = "card";
  newCard.style.width = "100%";
  var row = document.createElement('div');
  row.className = "row no-gutters";

  var col1 = document.createElement('div');
  col1.className = "col-4";

  var newCardBody = document.createElement('div');
  newCardBody.className = 'card-body';

  var newCardTitle = document.createElement('h5');
  newCardTitle.className = 'card-title';
  var t = document.createTextNode(name);
  newCardTitle.appendChild(t);

  var newCardText = document.createElement('p');
  newCardText.className = 'card-text';
  t = document.createTextNode(email);
  newCardText.appendChild(t);

  var col2 = document.createElement('div');
  col2.className = "col-2 align-self-center";

  var newClass1Text = document.createElement('h6');
  newClass1Text.className = 'card-text';
  t = document.createTextNode(class_1);
  newClass1Text.appendChild(t);
  col2.appendChild(newClass1Text);

  var nClass1 = document.createElement('p');
  nClass1.className = 'card-text';
  t = document.createTextNode("First Class");
  nClass1.appendChild(t);
  col2.appendChild(nClass1);


  var col3 = document.createElement('div');
  col3.className = "col-2 align-self-center";

  var newClass2Text = document.createElement('h6');
  newClass2Text.className = 'card-text';
  t = document.createTextNode(class_2);
  newClass2Text.appendChild(t);
  col3.appendChild(newClass2Text);

  var nClass2 = document.createElement('p');
  nClass2.className = 'card-text';
  t = document.createTextNode("First Class");
  nClass2.appendChild(t);
  col3.appendChild(nClass2);

  var col4 = document.createElement('div');
  col4.className = "col-2 align-self-center";

  var newClub1Text = document.createElement('h6');
  newClub1Text.className = 'card-text';
  t = document.createTextNode(club_1);
  newClub1Text.appendChild(t);
  col4.appendChild(newClub1Text);

  var nClub1 = document.createElement('p');
  nClub1.className = 'card-text';
  t = document.createTextNode("First Class");
  nClub1.appendChild(t);
  col4.appendChild(nClub1);

  var col5 = document.createElement('div');
  col5.className = "col-2 align-self-center";

  var newButton = document.createElement('a');
  newButton.className = 'btn btn-primary';
  newButton.style.width = "90%";
  newButton.style.padding = "10px";
  t = document.createTextNode("Chat");
  newButton.appendChild(t);

  newCardBody.appendChild(newCardTitle);
  newCardBody.appendChild(newCardText);
  col1.appendChild(newCardBody);

  col5.appendChild(newButton);

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  row.appendChild(col4);
  row.appendChild(col5);

  newCard.appendChild(row);

  newCol.appendChild(newCard);

  document.getElementById(id).appendChild(newCol);

  return (false);
}
