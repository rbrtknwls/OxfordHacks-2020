var numDestinations = 2;
var dests = [];
var destinations=[];

var inputContainer = document.getElementById("input-container");

for (i = 0; i < 2; i++) {
  var div = document.createElement("DIV");
  var input = document.createElement("input");

  div.classList.add("add-input");
  input.classList.add("map-input");
  div.id = "inputbox".concat(toString(numDestinations));

  div.appendChild(input);
  dests.push(div)

  inputContainer.appendChild(dests[i]);
}


document.getElementById('add-dest').addEventListener('click', function () {

  if (numDestinations <=8) {
    var div = document.createElement("DIV");
    var input = document.createElement("input");

    div.classList.add("add-input");
    input.classList.add("map-input");

    div.appendChild(input);

    numDestinations += 1
    dests.push(div)

    for (i = 0; i < dests.length; i++) {
      inputContainer.appendChild(dests[i]);

    }

    console.log(inputContainer);

  }

  

});


document.getElementById('sub-dest').addEventListener('click', function () {

  if (numDestinations > 2) {
    numDestinations -= 1;
    var element = dests.pop()

    element.remove();
    console.log(numDestinations );
  }

});



document.getElementById('send-btn').addEventListener('click', function () {

  destinations=[]
  for (i = 0; i < dests.length; i++) {
    destinations.push(dests[i].childNodes[0].value)
  }

  console.log(destinations);

});