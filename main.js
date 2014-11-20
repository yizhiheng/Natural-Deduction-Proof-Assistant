var expressionList = {};


window.addEventListener("load", init);

function init() {
	setListener();
};

function setListener() {
	var conclude_button = document.getElementById("conclude");
	var premise_button = document.getElementById("premise");
	var assumption_button = document.getElementById("assumption");
	var undo_button = document.getElementById("undo");
	var expression = document.getElementById("expression");

	
	document.getElementById("&i").addEventListener("click", function() {
		expression.value = "&i";
	});



	//conclude按钮被单击
	conclude_button.addEventListener("click", conclude);

	//premise按钮被单击
	premise_button.addEventListener("click", function() {
		addNewExpression(expression.value, "Premise");
	});

	//assumption按钮被单击
	assumption_button.addEventListener("click", function() {
		addNewExpression(expression.value, "Assumption");
	});

	//undo按钮被单击
	undo_button.addEventListener("click", undo);
};

function addNewExpression(content, type, scope) {

};

function conclude() {
	var expr = expression.value;
	expr = beautify(parse(trim(expr).split(""), 0));

};