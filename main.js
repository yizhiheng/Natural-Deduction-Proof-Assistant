var expressionList = [];
var workScope = 0;

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
		addPremise(expression.value, "Premise", 0);
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

function addPremise(content, type, scope) {
	var currentId = expressionList.length;
	content = beautify(parse(trim(content).split(""), 0));
	//Expression(id, scope, content, type)
	var newPremise = new Expression(currentId + 1, 0, content, "Premise");
	expressionList.push(newPremise);
};

function conclude() {
	var expr = expression.value;
	//^(\&i|\&e1|\&e2|vi1|vi2|ve|=>i|=>e|~~i|~~e)\s(\d+,)*\d+$
	var concludePatt = new RegExp("(\&i|\&e1|\&e2|vi1|vi2|ve|=>i|=>e|~~i|~~e)(\s*)(\d+,*)*");
	if (concludePatt.test(expr)) {
		//deal with expr
		var splitedArray = expr.split(" ");
		var logicRule = splitedArray[0];
		var expressionArray = splitedArray[1].split(",");
		deduct(logicRule, expressionArray);
	} else {
		//error
		info("error");	//此处要提示输入的格式要对

	}

};

function info (infoContent) {
	document.getElementById("info_box").innerHTML = infoContent;
}